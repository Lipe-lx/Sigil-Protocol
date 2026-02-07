# Sigil Protocol - Especificação de Ambiente de Build

Este documento contém todas as versões e configurações necessárias para reproduzir o ambiente de build do Sigil Protocol.

## 🐳 Imagem Docker Oficial

```
solanafoundation/anchor:v0.32.1
```

### Versões no Container
| Componente | Versão |
|------------|--------|
| Rust | 1.90.0 |
| Cargo | 1.90.0 |
| Anchor CLI | 0.32.1 |
| Solana CLI | 2.x (Agave) |

---

## 📦 Dependências do Programa

### Anchor.toml
```toml
[toolchain]
anchor_version = "0.32.1"

[features]
seeds = false
skip-lint = false

[programs.devnet]
sigil_registry = "BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe"

[provider]
cluster = "devnet"
wallet = "./id.json"
```

### Cargo.toml (Root)
```toml
[workspace]
members = ["programs/*"]
resolver = "2"

[profile.release]
overflow-checks = true
```

### programs/sigil-registry/Cargo.toml
```toml
[package]
name = "sigil_registry"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "sigil_registry"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []
idl-build = ["anchor-lang/idl-build", "anchor-spl/idl-build"]

[dependencies]
anchor-lang = "0.32.1"
anchor-spl = "0.32.1"
blake3 = "=1.5.5"  # CRÍTICO: pinar para evitar edition2024
```

---

## ⚠️ Dependências Críticas

> **IMPORTANTE**: A dependência `blake3` DEVE ser pinada para `=1.5.5` porque versões mais recentes (1.8.x) usam `edition2024` que não é suportada pelo `cargo-build-sbf` embútido no Solana CLI.

| Dependência | Versão Pinada | Motivo |
|-------------|---------------|--------|
| `blake3` | `=1.5.5` | Versões 1.8+ usam edition2024 |

---

## 🌐 Programa Deployado

| Rede | Program ID |
|------|------------|
| Devnet | `BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe` |

**Explorer**: https://explorer.solana.com/address/BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe?cluster=devnet

---

## 📋 Procedimento de Build

```bash
# 1. Limpar builds anteriores
rm -rf target/deploy target/idl target/types .anchor Cargo.lock

# 2. Executar deploy via Docker
./docker-deploy.sh
```

---

## 🔒 Wallet

O arquivo `id.json` contém a keypair da carteira de deploy. Mantenha-o seguro e nunca commite no repositório.

**Endereço**: `3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo`
