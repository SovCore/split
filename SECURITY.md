# Security Policy: SovCore Split (`split.sovcore.eu`)

At SovCore B.V., our core architectural thesis is that **"Trust is a structural vulnerability."** We design our ecosystems under the principle of Sovereignty-by-Design—eliminating the requirement for database or provider trust through absolute mathematical and cryptographic boundaries. 

Because our utilities run exclusively client-side inside your browser context, we take security vulnerabilities with the highest level of gravity. This document outlines our supported versions, defined threat model bounds, and the secure reporting protocol.

## Supported Versions

We actively monitor and patch security vulnerabilities for the following versions:

| Version | Supported          | Core Architecture / Layer |
| ------- | ------------------ | ------------------------- |
| Main    | :white_check_mark: | WASM Engine (`lib.rs`) / React SPA |
| < Main  | :x:                | Historical Pre-TRL Assets |

*Note: Because `split.sovcore.eu` is delivered as an ephemeral, zero-infrastructure deployment via immutable edge pages, users are always served the latest hardened production cryptographic build.*

## Coordinated Vulnerability Disclosure (CVD)

**Do not open public GitHub issues for suspected security vulnerabilities.** If you discover a memory leak, cryptographic flaw, or isolation escape, please report it through our secure, private triage channel:

* **Primary Channel:** [Open a Private GitHub Security Advisory](https://github.com/sovcore/workspace/security/advisories/new)
* **Encrypted Email Escalation:** `security@sovcore.eu`
* **PGP Key Fingerprint:** `[Insert Your Team's Production PGP Fingerprint Here]`

### Our Commitment
* **Initial Response:** Within 24 hours of submission.
* **Triage & Assessment:** Within 72 hours, confirming or denying reproducibility.
* **Status Updates:** Every 48 hours until a production mitigation/patch is compiled and pushed to the edge.
* **Credit:** Valid vulnerabilities will be recognized in our public release notes (unless anonymity is requested).

## Architectural Threat Model & Boundaries

To protect both our engineering team and security researchers, we explicitly define the boundaries of the `split.sovcore.eu` local execution context.

### In-Scope (Valid Security Reports)
We actively solicit and reward disclosures concerning:
1. **Forensic Memory Residuals:** Failure of the WASM linear memory heap to zeroize payloads immediately following a split or assembly routine (`payload.zeroize()` bypasses).
2. **Cryptographic Deficiencies:** Practical state collisions, algebraic flaws in the Galois Field $GF(2^8)$ Rijndael table implementation, or token generation verification escapes.
3. **Isolation Breakdown:** Failures in our build configurations or edge distribution frameworks to effectively deliver strict `COOP` (Cross-Origin-Opener-Policy) and `COEP` (Cross-Origin-Embedder-Policy) security headers.
4. **Integrity Validation Bypass:** Bypassing the embedded SHA-256 validation token (`sov1:x:y_hex:hash_hex`) to pass corrupted shares into the reverse Lagrange interpolation loop without triggering an immediate integrity error.

### Out-of-Scope (Environmental Boundaries)
The client-side execution model assumes the local host environment is compromised or outside our sphere of technical enforcement. The following conditions are out-of-scope:
* **Host OS Compromise:** Active malware, keyloggers, or memory dumpers operating with root/system privileges on the user's physical machine.
* **Malicious Browser Extensions:** Extensions with broad DOM read/write permissions capable of scraping inputs prior to ingestion or capturing active volatile RAM views.
* **Physical Attacks:** Shoulder surfing, cold-boot attacks on hardware, or physical seizure of a device while a volatile RAM tab session is open.
* **User-Driven Downgrades:** Local proxy modifications (e.g., Charles/Burp Suite) stripping `COOP`/`COEP` headers from the network transmission layer via client-side interception.

## Verification of Invariants

Every release branch is automatically validated via a local testing harness executing:
* Static Analysis (`cargo clippy` and `eslint`).
* Deterministic and differential cryptographic tests over our precomputed lookup tables (`GF_MUL_TABLE` and `GF_INV_TABLE`).
* Continuous verification of zeroization traits across global and transient structures.