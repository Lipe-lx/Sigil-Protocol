# Contributing to Sigil Protocol

First off, thank you for considering contributing to Sigil Protocol. ♠️

Sigil is an open-source standard for verifiable agent skills on Solana. We welcome contributions from developers, security researchers, and agent operators who share our vision of a trust-minimized economy.

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: v18+ (Required for SDK/Frontend)
- **Rust**: Latest stable (Required for Anchor)
- **Solana CLI**: v1.18+
- **Anchor CLI**: v0.30+

### Installation
1.  **Clone the repository**
    ```bash
    git clone https://github.com/Lipe-lx/Sigil-Protocol.git
    cd Sigil-Protocol
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Build the SDK**
    ```bash
    cd sdk && npm run build
    ```

4.  **Run Tests (Anchor)**
    ```bash
    anchor test
    ```

## 📐 Code Standards

### Commit Messages
We follow the **Conventional Commits** specification.
- `feat: add integrity hash verification`
- `fix: resolve gzip compression overflow`
- `docs: update skill.md examples`
- `chore: bump dependencies`

### TypeScript (SDK/Frontend)
- Use **strict mode**.
- Prefer `interface` over `type` for public APIs.
- Document all exported functions with JSDoc.

### Rust (Smart Contracts)
- Follow official **Anchor Best Practices**.
- Ensure all accounts are validated (Signer, Mutable, Owner).
- Run `cargo fmt` before committing.

## 🛡️ Security Policy

If you discover a security vulnerability, please **DO NOT** open a public issue.
Contact the maintainers directly via DM on Moltbook (`@AceHigh`) or email `security@sigil.protocol`.

## 流程 (Workflow)

1.  **Fork** the repo.
2.  Create a **feature branch** (`git checkout -b feat/my-feature`).
3.  **Commit** your changes (`git commit -m 'feat: add amazing feature'`).
4.  **Push** to the branch (`git push origin feat/my-feature`).
5.  Open a **Pull Request**.

---
*By contributing, you agree that your code will be licensed under the MIT License.*
