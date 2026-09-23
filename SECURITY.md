<!-- Copied from the Wira Delta Indonesia legal source (wdi-method/security.md) on 2026-09-16.
     Edit the source, then copy it here again. -->

# Security policy

WDI Method is a command-line tool (CLI) designed to structure architecture and engineering workflows for developers and AI coding agents. Code integrity and zero-compromise security across installed repositories are mandatory invariants.

---

## Two facts most people want up front

1. **Does this tool send code or telemetry anywhere?**  
   **No.** WDI Method operates 100% locally on your filesystem. There are zero outbound HTTP/HTTPS requests, zero telemetry calls, and zero analytics transmitted to Wira Delta Indonesia or any third-party servers.
2. **Does this tool accept network input or open listening ports?**  
   **No.** WDI Method opens no listening sockets and runs no background web servers.

---

## Reporting a vulnerability

**Please do not open a public GitHub issue for a security vulnerability.**

Report security issues privately through either of these channels:
1. **GitHub Security Advisories (Recommended):** Open the *Security* tab at <https://github.com/wiradeltaid/wdi-method> and select *Report a vulnerability*.
2. **Security Email:** Send technical details to [`security@wiradelta.id`](mailto:security@wiradelta.id).

Please include a description of the vulnerability, minimal reproduction steps, and the affected `wdi-method` version (`npx wdi-method --version`). You will receive an acknowledgement within 48 business hours.

---

## Release integrity

WDI Method is distributed publicly through npm and GitHub releases:
- **npm Registry:** Every published version of `wdi-method` carries an official npm SHA-512 integrity digest.
- **Git Tags & CI:** Every git tag (`v*`) triggers the full automated test suite in CI (`.github/workflows/release.yml`). Tags that fail tests cannot be released.
- **Verification:** Run `npm audit` and `npm verify` to check the installed package.

---

## Package sanitization invariants

To protect users and maintain confidentiality, automated guards run on every push and pull request in CI (`.github/workflows/ci.yml`):
- **No Machine Paths:** Packages cannot contain absolute filesystem paths from author environments (`/home/`, `/Users/`, or `C:\Users\`).
- **No Private Entities:** Packages cannot contain internal client names or private product identifiers.
- **No Python Bytecode:** Packages reject `.pyc` and `__pycache__` artifacts in the distribution surface.
