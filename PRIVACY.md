<!-- Copied from the Wira Delta Indonesia legal source (wdi-method/privacy.md) on 2026-09-16.
     Edit the source, then copy it here again. -->

# Privacy

**Last updated:** 2026-09-16  
**Publisher:** PT Wira Delta Indonesia (`wiradelta.com`)  

WDI Method is an offline, local-first command-line tool. It runs entirely on your local machine, maintains zero telemetry servers, and collects no personal data or usage metrics.

---

## 1. What data is collected or processed?

WDI Method collects **no personal data**.

When you run `wdi-method` commands (`install`, `update`, `check`, `validate`), it inspects and modifies only the local files in your current repository:
- Project repository structure (e.g. `.constitution/`, `.control/`, `docs/`, `package.json`).
- Language configuration and initiative slug entered during interactive prompts.
- Local git metadata (`git rev-parse --short HEAD`) to stamp the installed kit version.

All processing occurs in-memory on your local machine.

## 2. Where is data sent?

**Nowhere.**

- **No Outbound HTTP Requests:** WDI Method makes zero external HTTP/HTTPS calls.
- **No Telemetry or Crash Reporting:** No usage statistics, event logs, or error reports are sent to Wira Delta Indonesia or third parties.
- **No Listening Sockets:** WDI Method does not open or listen on any network ports.

Initial package downloads and updates occur exclusively via npm registry mechanisms (`npx wdi-method`), subject to npm/GitHub privacy terms.

## 3. Where is data stored, and for how long?

WDI Method stores nothing in system-wide application directories (`%APPDATA%`, `~/.config`, or OS registry). All generated artifacts reside directly within your repository's local filesystem:

| Storage Location | Contents | Retention |
|---|---|---|
| `.constitution/` | Architectural rules, engineering guidelines, and project constitution | As long as maintained in your project |
| `.control/` | Registries for use cases, components, risks, decisions, and memory logs | As long as maintained in your project |
| `.scratch/` | Temporary working files, drafted tickets, and agent context | Can be pruned by the developer at any time |

Because all data lives in your repository's git tree, you retain complete sovereignty over retention, backups, and deletion.

## 4. How to remove data and contact us

- **Removal:** To remove WDI Method from a project, delete the `.constitution/`, `.control/`, and `.scratch/` directories and remove the method block from `AGENTS.md`.
- **Inquiries:** For questions regarding this privacy commitment, contact [`support@wiradelta.com`](mailto:support@wiradelta.com).
