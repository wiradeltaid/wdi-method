// Two language settings, and only two. What matters most here is the second test: a setting somebody
// already chose is NOT the installer's to change behind their back.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  readLanguagePolicy,
  writeLanguagePolicy,
  readBranchPolicy,
  writeBranchPolicy,
  readProductIdentity,
  DEFAULT_DOC_LANGUAGE,
  humaniseFolderName,
} from "../lib/identity.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const CLI = path.join(ROOT, "bin", "wdi-method.js");

function repoWithIndex(policy) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-lang-"));
  fs.mkdirSync(path.join(dir, ".control", "registry"), { recursive: true });
  let text = 'product:\n  name: "X"\n  client: ""\n\nmode: catalog\n';
  if (policy) text = writeLanguagePolicy(text, policy);
  fs.writeFileSync(path.join(dir, ".control", "registry", "index.yaml"), text);
  return dir;
}

function run(args, dir) {
  return execFileSync(process.execPath,
    [CLI, "update", dir, "--yes", "--skip-bmad-check", "--skip-engines-check", "--agents", "claude", ...args],
    { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function policyOf(dir) {
  return readLanguagePolicy(
    fs.readFileSync(path.join(dir, ".control", "registry", "index.yaml"), "utf8"));
}

test("writeLanguagePolicy is idempotent and leaves `product:` alone", () => {
  let text = 'product:\n  name: "X"\n  client: ""\n\nmode: catalog\n';
  text = writeLanguagePolicy(text, { docLanguage: "id", docFilenameLanguage: "id" });
  text = writeLanguagePolicy(text, { docLanguage: "en", docFilenameLanguage: "id" });
  assert.equal((text.match(/^policy:/gm) || []).length, 1, "a second policy block was written");
  assert.deepEqual(readLanguagePolicy(text), { docLanguage: "en", docFilenameLanguage: "id" });
  assert.match(text, /^product:\n  name: "X"/m, "product block was disturbed");
  assert.match(text, /^mode: catalog$/m, "the rest of index.yaml was disturbed");
});

test("the flags land in index.yaml", () => {
  const dir = repoWithIndex(null);
  try {
    run(["--doc-language", "id", "--doc-filename-language", "id"], dir);
    assert.deepEqual(policyOf(dir), { docLanguage: "id", docFilenameLanguage: "id" });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("an existing setting survives a run that does not mention language", () => {
  // The rule is about DEFAULTS, not about flags: a value nobody asked about MUST NOT be replaced by
  // this installer's idea of a default.
  const dir = repoWithIndex({ docLanguage: "id", docFilenameLanguage: "id" });
  try {
    const out = run([], dir);
    assert.deepEqual(policyOf(dir), { docLanguage: "id", docFilenameLanguage: "id" },
      "a default overwrote a language the product had already chosen");
    assert.match(out, /kept policy\.doc_language = id/,
      "keeping it silently is not enough — the run MUST say so");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("an EXPLICIT flag does change it — being asked and answering is a choice, not a default", () => {
  const dir = repoWithIndex({ docLanguage: "id", docFilenameLanguage: "id" });
  try {
    run(["--doc-language", "English"], dir);
    assert.equal(policyOf(dir).docLanguage, "English",
      "an explicit answer was ignored; the TUI asks with the old value prefilled, and changing it MUST land");
    assert.equal(policyOf(dir).docFilenameLanguage, "id",
      "the field nobody mentioned was changed too");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("English is the default when nothing is passed", () => {
  const dir = repoWithIndex(null);
  try {
    run([], dir);
    assert.deepEqual(policyOf(dir), { docLanguage: "English", docFilenameLanguage: "English" });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("free text, not an enum — anything a model can read is accepted, and quoted so YAML survives", () => {
  // The consumer is a model, so there is no list to match against. What MUST NOT happen is a value
  // with a space breaking the YAML, or being silently truncated to its first word.
  const dir = repoWithIndex(null);
  try {
    run(["--doc-language", "Bahasa Indonesia", "--doc-filename-language", "Indonesia"], dir);
    assert.deepEqual(policyOf(dir),
      { docLanguage: "Bahasa Indonesia", docFilenameLanguage: "Indonesia" });
    const raw = fs.readFileSync(path.join(dir, ".control", "registry", "index.yaml"), "utf8");
    assert.match(raw, /doc_language: "Bahasa Indonesia"/, "free text MUST be quoted in the file");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("only an empty value is refused", () => {
  const dir = repoWithIndex(null);
  try {
    assert.throws(() => run(["--doc-language", ""], dir), /needs a value/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("a bare legacy value is still read — `doc_language: id` was written before quoting", () => {
  const bare = [
    'policy:',
    '  doc_language: id   # a trailing note',
    '  doc_filename_language: id',
    '',
  ].join(String.fromCharCode(10));
  assert.deepEqual(readLanguagePolicy(bare), { docLanguage: "id", docFilenameLanguage: "id" });
  assert.equal(DEFAULT_DOC_LANGUAGE, "English");
});

test("CRLF: a Windows checkout is read and written without losing its endings", () => {
  // Bug found 2026-08-18 on the first real install into a Windows product repo. Every regex in
  // identity.mjs is anchored on a bare newline, so a CRLF file read as "" — and an empty name makes
  // identityIsPlaceholder true, which makes the installer write NOTHING and report nothing. It printed
  // `policy.doc_language = ` while the file plainly said `id`.
  const lf = [
    'product:',
    '  name: "X"',
    '  client: ""',
    '',
    'policy:',
    '  doc_language: id',
    '  doc_filename_language: id',
    '',
  ].join("\n");
  const crlf = lf.split("\n").join("\r\n");

  assert.deepEqual(readLanguagePolicy(crlf), { docLanguage: "id", docFilenameLanguage: "id" },
    "policy unreadable in a CRLF file");
  assert.equal(readProductIdentity(crlf).name, "X", "product name unreadable in a CRLF file");

  const out = writeLanguagePolicy(crlf, { docLanguage: "en", docFilenameLanguage: "id" });
  assert.ok(out.includes("\r\n"), "CRLF endings were flattened on write");
  assert.equal(out.split("\n").length - 1, out.split("\r\n").length - 1,
    "the file was left with mixed endings");
  assert.deepEqual(readLanguagePolicy(out), { docLanguage: "en", docFilenameLanguage: "id" });
  assert.equal((out.match(/^policy:/gm) || []).length, 1, "a second policy block appeared");

  const lfOut = writeLanguagePolicy(lf, { docLanguage: "en", docFilenameLanguage: "id" });
  assert.ok(!lfOut.includes("\r"), "an LF file was given CRLF endings");
});

test("the folder name becomes an Enter-ready suggestion, and an acronym stays one", () => {
  // A first install has nowhere to read a product name from, so the folder is the best guess there is —
  // and a guess the owner accepts with Enter beats a field they have to type.
  const cases = [
    ["acme-billing-portal", "Acme Billing Portal"],
    ["acmeBillingPortal", "Acme Billing Portal"],
    ["my_app.v2", "My App V2"],
    ["API-gateway", "API Gateway"],
    ["repo", "Repo"],
    ["", ""],
  ];
  for (const [input, want] of cases) {
    assert.equal(humaniseFolderName(input), want, `folder "${input}"`);
  }
});

test("writeLanguagePolicy preserves other keys in policy: (like primary_branch and development_branch)", () => {
  const initial = [
    'product:',
    '  name: "Widget"',
    '  client: ""',
    '',
    'policy:',
    '  doc_language: "id"',
    '  doc_filename_language: "id"',
    '  primary_branch: "main"',
    '  development_branch: "development"',
    '',
    'mode: catalog',
    '',
  ].join("\n");

  const updated = writeLanguagePolicy(initial, {
    docLanguage: "English",
    docFilenameLanguage: "English",
  });

  assert.match(updated, /primary_branch:\s*"main"/);
  assert.match(updated, /development_branch:\s*"development"/);
  assert.equal(readLanguagePolicy(updated).docLanguage, "English");
  assert.equal(readBranchPolicy(updated).primaryBranch, "main");
  assert.equal(readBranchPolicy(updated).developmentBranch, "development");
});

test("readBranchPolicy reads configured branches or defaults to main", () => {
  assert.deepEqual(readBranchPolicy(""), {
    primaryBranch: "main",
    developmentBranch: "main",
  });

  const custom = [
    'policy:',
    '  primary_branch: "trunk"',
    '  development_branch: "dev"',
  ].join("\n");
  assert.deepEqual(readBranchPolicy(custom), {
    primaryBranch: "trunk",
    developmentBranch: "dev",
  });

  const bare = [
    'policy:',
    '  primary_branch: trunk',
    '  development_branch: dev',
  ].join("\n");
  assert.deepEqual(readBranchPolicy(bare), {
    primaryBranch: "trunk",
    developmentBranch: "dev",
  });

  const singleQuoted = [
    'policy:',
    "  primary_branch: 'trunk'",
    "  development_branch: 'dev'",
  ].join("\n");
  assert.deepEqual(readBranchPolicy(singleQuoted), {
    primaryBranch: "trunk",
    developmentBranch: "dev",
  });
});

test("writeBranchPolicy writes branch settings into policy: without destroying existing keys", () => {
  const initial = [
    'product:',
    '  name: "Widget"',
    '  client: ""',
    '',
    'policy:',
    '  doc_language: "id"',
    '  doc_filename_language: "id"',
    '',
    'mode: catalog',
  ].join("\n");

  const updated = writeBranchPolicy(initial, {
    primaryBranch: "main",
    developmentBranch: "development",
  });

  assert.deepEqual(readBranchPolicy(updated), {
    primaryBranch: "main",
    developmentBranch: "development",
  });
  assert.deepEqual(readLanguagePolicy(updated), {
    docLanguage: "id",
    docFilenameLanguage: "id",
  });
});

test("writeBranchPolicy creates policy: block after product: if policy: is missing", () => {
  const initial = 'product:\n  name: "Widget"\n  client: ""\n\nmode: catalog\n';
  const updated = writeBranchPolicy(initial, {
    primaryBranch: "main",
    developmentBranch: "development",
  });
  assert.deepEqual(readBranchPolicy(updated), {
    primaryBranch: "main",
    developmentBranch: "development",
  });
  assert.match(updated, /product:\n  name: "Widget"[\s\S]*policy:\n[\s\S]*mode: catalog/);
});

test("peer review edge case: header regex does not match nested keys at column > 0", () => {
  const nested = [
    'something:',
    '  policy:',
    '    nested_key: 1',
    '',
    'mode: catalog',
    '',
  ].join("\n");
  const updated = writeBranchPolicy(nested, {
    primaryBranch: "main",
    developmentBranch: "development",
  });
  // Top-level policy: block should be created, NOT injected into something.policy
  assert.match(updated, /^policy:\n  primary_branch: "main"/m);
  assert.match(updated, /something:\n  policy:\n    nested_key: 1/);
});

test("peer review edge case: column-0 comments inside block do not terminate block prematurely", () => {
  const withComment = [
    'policy:',
    '  doc_language: "id"',
    '# note in column 0',
    '  primary_branch: "trunk"',
    '',
    'mode: catalog',
  ].join("\n");
  assert.equal(readBranchPolicy(withComment).primaryBranch, "trunk");
  const updated = writeBranchPolicy(withComment, { developmentBranch: "dev" });
  assert.equal(readBranchPolicy(updated).primaryBranch, "trunk");
  assert.equal(readBranchPolicy(updated).developmentBranch, "dev");
  assert.match(updated, /# note in column 0/);
});

test("peer review edge case: nested child keys (indent > 2) are not overwritten as direct sibling keys", () => {
  const nestedChild = [
    'policy:',
    '  branch_defaults:',
    '    primary_branch: "nested"',
    '  doc_language: "id"',
    '',
    'mode: catalog',
  ].join("\n");
  const updated = writeBranchPolicy(nestedChild, { primaryBranch: "main" });
  assert.match(updated, /    primary_branch: "nested"/);
  assert.match(updated, /  primary_branch: "main"/);
});

test("peer review edge case: empty partial write does not create empty block", () => {
  const text = 'mode: catalog\n';
  const updated = writeLanguagePolicy(text, {});
  assert.equal(updated, text);
});

test("peer review edge case: preserves inline comments on updated key", () => {
  const initial = [
    'policy:',
    '  primary_branch: "trunk"   # production release branch',
    '  development_branch: "dev"',
  ].join("\n");
  const updated = writeBranchPolicy(initial, { primaryBranch: "main" });
  assert.match(updated, /  primary_branch: "main"   # production release branch/);
});

test("peer review edge case: CRLF round-trip and idempotency for writeBranchPolicy", () => {
  const lf = [
    'product:',
    '  name: "X"',
    '',
    'policy:',
    '  doc_language: "en"',
    '  primary_branch: "main"',
    '',
    'mode: catalog',
  ].join("\n");
  const crlf = lf.replaceAll("\n", "\r\n");

  const out1 = writeBranchPolicy(crlf, { primaryBranch: "trunk", developmentBranch: "dev" });
  assert.ok(out1.includes("\r\n"));
  assert.equal(out1.split("\n").length - 1, out1.split("\r\n").length - 1);
  assert.deepEqual(readBranchPolicy(out1), { primaryBranch: "trunk", developmentBranch: "dev" });

  // Idempotency: calling again produces identical output
  const out2 = writeBranchPolicy(out1, { primaryBranch: "trunk", developmentBranch: "dev" });
  assert.equal(out2, out1);
});


