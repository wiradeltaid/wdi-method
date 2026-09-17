#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pyyaml>=6"]
# ///
"""lifecycle — manages spec lifecycle transitions: archive or prune closed specs.

Specs in WDI method have two lifecycle choices once closed:
  - archive: git mv folder to .archive/specs/<spec>/ and update specs.yaml spec_folder
  - prune:   git rm -r folder, preserving specs.yaml metadata and RTM traceability

Active (open) specs MUST remain in .scratch/ where tickets are materialized
into git worktrees for implementation.

Preflight guards:
  1. Git working tree must be clean.
  2. Target spec must be `status: closed`.
  3. No memlog in .control/memlog/ may cite the target folder in `artifact:`.
  4. No active git worktree may be using the target folder path.
  5. Target path must reside inside repository and within allowed spec locations (.scratch/, _bmad-output/specs/).
  6. Archived specs in .archive/ cannot be pruned; --all-closed only archives/prunes specs in .scratch/.
  7. Post-execution, `validate.py --check` must pass; any failure triggers atomic git rollback.
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

import yaml


def _run_cmd(cmd: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)


def check_git_clean(root: Path, dry_run: bool = False) -> None:
    res = _run_cmd(["git", "status", "--porcelain"], root)
    if res.returncode != 0:
        sys.exit(f"error: failed to run git status (not a git repo?):\n{res.stderr.strip()}")
    if res.stdout.strip():
        if dry_run:
            print("advisory: git working tree has uncommitted changes (ignored for --dry-run)")
        else:
            sys.exit("error: git working tree has uncommitted changes. Commit or stash them before running lifecycle operations.")


def check_worktree_collision(root: Path, target_folder: Path) -> None:
    res = _run_cmd(["git", "worktree", "list", "--porcelain"], root)
    if res.returncode != 0:
        sys.exit(f"error: failed to query git worktree list (code {res.returncode}):\n{res.stderr.strip()}")
    resolved_root = root.resolve()
    resolved_target = target_folder.resolve()
    for line in res.stdout.splitlines():
        if line.startswith("worktree "):
            wt_path = Path(line.removeprefix("worktree ").strip()).resolve()
            if wt_path == resolved_root:
                if resolved_target == resolved_root:
                    sys.exit(f"error: target path `{target_folder}` cannot be the repository root.")
                continue
            if wt_path == resolved_target or resolved_target in wt_path.parents or wt_path in resolved_target.parents:
                sys.exit(f"error: target path `{target_folder}` is in use by active git worktree at `{wt_path}`.")


def check_source_boundary(root: Path, target_folder: Path, spec_id: str) -> None:
    try:
        rel = target_folder.resolve().relative_to(root.resolve()).as_posix()
    except ValueError:
        sys.exit(f"error: spec `{spec_id}` folder `{target_folder}` is outside repository root.")
    if rel == "." or not rel:
        sys.exit(f"error: spec `{spec_id}` folder cannot be the repository root.")
    clean = rel.rstrip("/")
    allowed_roots = (".scratch", "_bmad-output/specs", ".archive/specs")
    if not any(clean == a or clean.startswith(f"{a}/") for a in allowed_roots):
        sys.exit(
            f"error: spec `{spec_id}` folder `{rel}` is not within an allowed spec location "
            f"(.scratch/, _bmad-output/specs/, or .archive/specs/)."
        )


def check_memlog_artifacts(root: Path, target_folder: Path) -> None:
    memlog_dir = root / ".control" / "memlog"
    if not memlog_dir.is_dir():
        return
    try:
        rel_posix = target_folder.relative_to(root).as_posix().rstrip("/")
    except ValueError:
        rel_posix = str(target_folder).replace("\\", "/").rstrip("/")
    rel_norm = rel_posix.lower()

    for path in memlog_dir.rglob("*.md"):
        try:
            content = path.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        if not content.startswith("---"):
            continue
        parts = content.split("---", 2)
        if len(parts) < 3:
            continue
        fm_text = parts[1]
        try:
            fm = yaml.safe_load(fm_text) or {}
        except Exception:
            continue
        artifact = fm.get("artifact")
        if not artifact:
            continue
        artifacts = artifact if isinstance(artifact, list) else [artifact]
        for item in artifacts:
            item_str = str(item).replace("\\", "/").strip().rstrip("/").lower()
            if item_str == rel_norm or item_str.startswith(f"{rel_norm}/"):
                memlog_rel = path.relative_to(root).as_posix()
                sys.exit(
                    f"error: refusing to modify `{rel_posix}`: memlog `{memlog_rel}` has artifact "
                    f"pointing to `{item}` — run provenance must not be broken."
                )


def _rollback_git_changes(root: Path, created_dirs: list[Path] | None = None) -> None:
    _run_cmd(["git", "restore", "--staged", "--worktree", "--", "."], root)
    if created_dirs:
        for d in created_dirs:
            if d.is_dir():
                try:
                    d.rmdir()
                except OSError:
                    pass


def find_specs_file(root: Path) -> Path:
    candidates = [
        root / ".control" / "registry" / "specs.yaml",
        root / "control" / "registry" / "specs.yaml",
    ]
    for c in candidates:
        if c.is_file():
            return c
    sys.exit(f"error: specs.yaml not found in {root / '.control' / 'registry'}")


def load_specs_data(specs_file: Path) -> tuple[dict, list[dict]]:
    try:
        data = yaml.safe_load(specs_file.read_text(encoding="utf-8")) or {}
    except Exception as e:
        sys.exit(f"error: failed to parse `{specs_file}`: {e}")
    spec_list = data.get("specs") or data.get("waves") or []
    return data, spec_list


def resolve_spec_folder(root: Path, spec: dict) -> Path | None:
    folder_val = str(spec.get("spec_folder") or "").strip()
    if folder_val:
        p = root / folder_val.replace("\\", "/").strip("/")
        if p.exists():
            return p

    # Check tickets fallback
    for t in spec.get("tickets") or []:
        if isinstance(t, dict):
            tf = str(t.get("spec_folder") or "").strip()
            if tf:
                p = root / tf.replace("\\", "/").strip("/")
                if p.exists():
                    return p

    # Fallback to searching in .scratch/
    sid = str(spec.get("id") or "").strip()
    scratch_dir = root / ".scratch"
    if scratch_dir.is_dir() and sid:
        sid_lower = sid.lower()
        for child in scratch_dir.iterdir():
            if child.is_dir():
                c_name = child.name.lower()
                if c_name == sid_lower or c_name.startswith(f"{sid_lower}-") or f"-{sid_lower}-" in c_name:
                    return child
    return None


def update_spec_folder_in_yaml(specs_file: Path, spec_id: str, new_folder: str) -> None:
    content = specs_file.read_text(encoding="utf-8")
    newline = "\r\n" if "\r\n" in content else "\n"
    lines = content.splitlines()

    clean_sid = spec_id.strip().upper()

    item_starts: list[tuple[int, str]] = []
    for idx, line in enumerate(lines):
        m = re.match(r"^(\s*)-\s+", line)
        if m:
            item_starts.append((idx, m.group(1)))

    target_start_line = -1
    target_end_line = len(lines)
    base_indent = ""

    for i, (start_line, indent) in enumerate(item_starts):
        end_line = item_starts[i + 1][0] if i + 1 < len(item_starts) else len(lines)
        found_id = False
        for l_idx in range(start_line, end_line):
            line = lines[l_idx]
            if l_idx > start_line and line and not line.startswith(" ") and not line.startswith("\t") and not line.startswith("#"):
                end_line = l_idx
                break
            id_m = re.search(r"^\s*(?:-\s+)?id:\s*['\"]?([^'\"#\s]+)['\"]?", line, re.IGNORECASE)
            if id_m and id_m.group(1).strip().upper() == clean_sid:
                found_id = True
                break
        if found_id:
            target_start_line = start_line
            target_end_line = end_line
            base_indent = indent
            break

    if target_start_line == -1:
        raise RuntimeError(f"spec `{spec_id}` could not be located in `{specs_file}` for update")

    folder_idx = -1
    field_indent = base_indent + "  "
    for idx in range(target_start_line, target_end_line):
        line = lines[idx]
        m = re.match(r"^(\s*)spec_folder:\s*.*$", line)
        if m:
            folder_idx = idx
            field_indent = m.group(1)
            break

    clean_folder = new_folder.replace("\\", "/").strip("/") + "/"
    new_line = f"{field_indent}spec_folder: {clean_folder}"

    if folder_idx != -1:
        lines[folder_idx] = new_line
    else:
        lines.insert(target_start_line + 1, new_line)

    specs_file.write_text(newline.join(lines) + newline, encoding="utf-8")


def run_validator_check(root: Path, created_dirs: list[Path] | None = None) -> None:
    validate_script = Path(__file__).parent / "validate.py"
    if not validate_script.is_file():
        _rollback_git_changes(root, created_dirs)
        sys.exit(f"error: validate.py script not found at `{validate_script}` — fail-closed.")
    baseline_file = root / ".github" / "validate-baseline.txt"
    base_args = ["--baseline", str(baseline_file)] if baseline_file.is_file() else []
    res = _run_cmd(["uv", "run", str(validate_script), "--root", str(root), "--check", *base_args], root)
    if res.returncode != 0 and ("No such file or directory" in res.stderr or "not recognized" in res.stderr):
        res = _run_cmd(["uv", "run", "--with", "pyyaml", "python", str(validate_script), "--root", str(root), "--check", *base_args], root)
    if res.returncode != 0 and ("No such file or directory" in res.stderr or "not recognized" in res.stderr):
        res = _run_cmd([sys.executable, str(validate_script), "--root", str(root), "--check", *base_args], root)
    if res.returncode != 0:
        if baseline_file.is_file():
            raw_lines = res.stdout.splitlines()
            findings = []
            for line in raw_lines:
                if line.startswith("Skipped:") or line.startswith("V14 reference date:"):
                    break
                if re.match(r"^\s{2}[a-z][a-z0-9-]*\s+", line):
                    findings.append(line.rstrip())
            baseline_lines = [l.rstrip() for l in baseline_file.read_text(encoding="utf-8").splitlines() if l.strip()]
            if sorted(findings) == sorted(baseline_lines):
                return
        _rollback_git_changes(root, created_dirs)
        sys.exit(
            f"error: validate.py --check failed after lifecycle operation. Git changes have been rolled back.\n"
            f"{res.stdout}\n{res.stderr}"
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Manage spec lifecycle: archive or prune closed specs."
    )
    parser.add_argument("--spec", help="Spec ID (e.g. SPEC-1)")
    parser.add_argument("--archive", action="store_true", help="Move closed spec to .archive/specs/<spec>/ and update specs.yaml")
    parser.add_argument("--prune", action="store_true", help="Remove closed spec folder with git rm -r, preserving specs.yaml metadata")
    parser.add_argument("--all-closed", action="store_true", help="Process all closed specs currently in .scratch/")
    parser.add_argument("--dry-run", action="store_true", help="Simulate execution without modifying files or git index")
    parser.add_argument("--root", default=".", help="Root directory of the repository (default: .)")

    args = parser.parse_args()

    if not args.archive and not args.prune:
        parser.error("must specify either --archive or --prune")
    if args.archive and args.prune:
        parser.error("cannot specify both --archive and --prune")
    if not args.spec and not args.all_closed:
        parser.error("must specify either --spec <id> or --all-closed")
    if args.spec and args.all_closed:
        parser.error("cannot specify both --spec and --all-closed")

    root = Path(args.root).resolve()
    check_git_clean(root, dry_run=args.dry_run)

    specs_file = find_specs_file(root)
    _, spec_list = load_specs_data(specs_file)

    target_specs: list[dict] = []
    if args.spec:
        sid_req = args.spec.strip().upper()
        found = None
        for s in spec_list:
            if str(s.get("id") or "").strip().upper() == sid_req:
                found = s
                break
        if not found:
            sys.exit(f"error: spec `{args.spec}` not found in `{specs_file}`")
        status = str(found.get("status") or "").strip()
        if status != "closed":
            sys.exit(f"error: spec `{found.get('id')}` status is `{status or 'empty'}` — only closed specs may be archived or pruned.")
        target_specs.append(found)
    else:
        for s in spec_list:
            if str(s.get("status") or "").strip() == "closed":
                target_specs.append(s)
        if not target_specs:
            print("No closed specs found in specs.yaml.")
            return

    operations: list[tuple[dict, Path, str]] = []
    for spec in target_specs:
        sid = str(spec.get("id"))
        folder_path = resolve_spec_folder(root, spec)
        if not folder_path or not folder_path.exists():
            if args.prune:
                print(f"advisory: spec `{sid}` folder does not exist on disk (already pruned); skipping.")
            else:
                print(f"advisory: spec `{sid}` folder not found on disk; skipping.")
            continue

        try:
            rel_folder = folder_path.relative_to(root).as_posix()
        except ValueError:
            rel_folder = str(folder_path).replace("\\", "/")

        clean = rel_folder.replace("\\", "/").strip()
        while clean.startswith("./"):
            clean = clean[2:]
        if clean.startswith("/"):
            clean = clean.lstrip("/")

        if clean.startswith(".archive/") or clean == ".archive":
            if args.archive:
                print(f"advisory: spec `{sid}` is already archived at `{rel_folder}`; skipping.")
                continue
            elif args.prune:
                if args.spec:
                    sys.exit(f"error: spec `{sid}` is already archived at `{rel_folder}` — refusing to prune an archived audit record.")
                else:
                    print(f"advisory: spec `{sid}` is already archived at `{rel_folder}`; skipping.")
                    continue

        if not args.spec and not (clean.startswith(".scratch/") or clean == ".scratch"):
            print(f"advisory: spec `{sid}` folder `{rel_folder}` is outside `.scratch/`; skipping in bulk operation.")
            continue

        check_source_boundary(root, folder_path, sid)
        check_memlog_artifacts(root, folder_path)
        check_worktree_collision(root, folder_path)
        operations.append((spec, folder_path, "archive" if args.archive else "prune"))

    if not operations:
        print("No eligible spec folders to process.")
        return

    created_dirs: list[Path] = []
    try:
        for spec, src_path, action in operations:
            sid = str(spec.get("id"))
            rel_src = src_path.relative_to(root).as_posix()
            if action == "archive":
                dest_dir = root / ".archive" / "specs" / src_path.name
                rel_dest = dest_dir.relative_to(root).as_posix() + "/"
                if args.dry_run:
                    print(f"[dry-run] would git mv -- `{rel_src}` -> `{rel_dest}`")
                    print(f"[dry-run] would update `spec_folder: {rel_dest}` in `{specs_file.relative_to(root).as_posix()}`")
                else:
                    if not dest_dir.parent.exists():
                        dest_dir.parent.mkdir(parents=True, exist_ok=True)
                        created_dirs.append(dest_dir.parent)
                    res = _run_cmd(["git", "mv", "--", rel_src, dest_dir.relative_to(root).as_posix()], root)
                    if res.returncode != 0:
                        raise RuntimeError(f"git mv failed for spec `{sid}`:\n{res.stderr.strip()}")
                    update_spec_folder_in_yaml(specs_file, sid, rel_dest)
                    res_add = _run_cmd(["git", "add", "--", specs_file.relative_to(root).as_posix()], root)
                    if res_add.returncode != 0:
                        raise RuntimeError(f"git add failed for specs.yaml:\n{res_add.stderr.strip()}")
                    print(f"Archived spec `{sid}`: `{rel_src}` -> `{rel_dest}`")
            elif action == "prune":
                if args.dry_run:
                    print(f"[dry-run] would git rm -r -- `{rel_src}`")
                else:
                    res = _run_cmd(["git", "rm", "-r", "--", rel_src], root)
                    if res.returncode != 0:
                        raise RuntimeError(f"git rm failed for spec `{sid}`:\n{res.stderr.strip()}")
                    print(f"Pruned spec `{sid}`: removed `{rel_src}` from git and filesystem")
    except (Exception, BaseException) as e:
        _rollback_git_changes(root, created_dirs)
        sys.exit(f"error: lifecycle operation failed; rolled back all git changes.\n{e}")

    if args.dry_run:
        print("[dry-run] would run validate.py --check")
        print("[dry-run] lifecycle dry run completed successfully.")
        return

    print("Running post-lifecycle validation check...")
    run_validator_check(root, created_dirs)
    print("All lifecycle operations completed and validated successfully.")


if __name__ == "__main__":
    main()
