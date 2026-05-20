# SovCore Split 🛡️ (`split.sovcore.eu`)

> **"Trust is a structural vulnerability. We replace it with mathematical finality."**

`SovCore Split` is a free, open-source, 100% provider-blind cryptographic utility engineered to safely shard sensitive payloads—such as master cloud root credentials, multi-sig treasury seeds, or raw configuration keys—into independent mathematical pieces (shards). It utilizes Shamir's Secret Sharing (SSS) computed over the Rijndael Galois Field $GF(2^8)$.

The application runs entirely client-side inside a memory-hardened, process-isolated browser sandbox. It requires **zero server-side computation, zero database state, and zero network data flow**. Once the initial static web assets are loaded, the entire operation can be executed in absolute **Air-Gap / Airplane Mode**.

---

## 🛠️ Cryptographic & Architectural Pillars

### 1. Provable Air-Gap Execution

All polynomial distributions, share outputs, and Lagrange interpolations take place on the local client’s machine. The hosting infrastructure serves strictly static assets (HTML, JS, and compiled Rust `.wasm` binaries). You can cleanly sever your network connection completely before inputting any secret data.

### 2. Process-Level Memory Hardening

To protect transient key material from speculative execution side-channel vectors (e.g., Spectre/Meltdown) inside multi-tenant browser environments, this application enforces strict Cross-Origin Isolation via server-emitted headers:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

This forces the modern browser runtime to isolate the tab context into its own dedicated OS-level Process ID (PID), enabling multi-threaded `SharedArrayBuffer` pipelines while blinding external browser contexts.

### 3. Immediate Memory Zeroization

We do not leverage standard, immutable JavaScript string variables to process plaintext payloads, as they linger unpredictably inside the browser engine's unmanaged Garbage Collector (GC) heap. Instead:

- **Input fields** are captured via uncontrolled React references (`useRef`) into temporary byte arrays.
- **Internal values** pass directly into the linear memory heap of our compiled Rust engine.
- **The moment** a split or assembly routine hits finality, a manual `.zeroize()` macro explicitly overwrites the underlying memory slots with null masks (`0x00`).

### 4. Deterministic Verification Ring

Each generated share is packed into an explicit metadata wrapper matching the format:
`sov1:[share_index]:[y_hex_coordinate]:[payload_sha256_hash]`

By embedding a localized cryptographic hash of the original input payload before splitting, the assembly interface runs automatic integrity verification checks across all submitted shards. This safely flags mixed, altered, or corrupted pieces prior to executing mathematical reconstruction.

---

## 📐 Data Flow Diagram

```text
[Plaintext Payload Input]
           │
           ▼ (Uncontrolled JS Uint8Array Buffer Pointer)
 ┌────────────────────────────────────────────────────────┐
 │  Rust WebAssembly Core Linear Heap                     │
 │  ├─ CSPRNG (getrandom + crypto.getRandomValues)        │
 │  ├─ Polynomial Matrix Distribution over GF(2^8)        │
 │  └─ Explicit .zeroize() Overwrite Event                │
 └────────────────────────────────────────────────────────┘
           │
           ▼
 [Deterministic Shard Matrix] ──> Handed to User via UI
                                  (Zero Persistent State)
```

---

## ⚙️ Development & Local Compilation

### Prerequisites

- [Rust Toolchain](https://rustup.rs/) (`nightly` or stable)
- [`wasm-pack`](https://rustwasm.github.io/wasm-pack/installer/) for compiling Rust to WebAssembly
- Node.js (v18+) & `pnpm` (or `npm`)

### 1. Clone & Compile

```bash
git clone [https://github.com/sovcore/split.git](https://github.com/sovcore/split.git)
cd split
wasm-pack build --target web --release
pnpm install && pnpm dev
```

---

## 🚀 The Graduation Path to SovCore VDR

`SovCore Split` acts as your entry point. When your organization scales to capital fundraising, external compliance audits, or cross-border transactions, you can seamlessly graduate to **SovCore VDR** (`vdr.sovcore.eu`), our paid, enterprise-grade Virtual Document Room platform that extends our signature server-blind architecture to massive streaming corporate file vaults, cryptographically bound to verified European Legal Identities.

---

## ⚖️ Open-Source Licensing Strategy

SovCore Split is proudly open-source and released under the **GNU Affero General Public License v3 (AGPL-3.0)**.

### Why AGPLv3?

We believe cryptographic tools should be fully audit-ready. Under AGPLv3, any entity that adapts or clones this repository to offer it as a network-hosted cloud service (SaaS) **must legally open-source their entire software infrastructure under the same terms**. This prevents closed-source commercial encapsulation of our open-source growth assets.

---

_Copyright © 2026 SovCore B.V. All rights reserved. Sovereign-by-Design Infrastructure._
