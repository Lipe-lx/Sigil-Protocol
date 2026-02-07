---
description: Build and deploy Sigil Protocol to Solana Devnet using Docker
---

# Sigil Protocol Deploy Workflow

This workflow builds and deploys the Sigil Protocol smart contract to Solana Devnet using the official `solanafoundation/anchor:v0.32.1` Docker image.

## Prerequisites

- Docker installed and running
- Wallet file `id.json` in the project root with sufficient SOL (minimum 2 SOL recommended)
- Project configured with Anchor 0.32.1

## Steps

### 1. Navigate to Sigil Protocol directory

```bash
cd /media/lulipe/moltroad_bench1/openclaw-data/workspace/02-SIGIL-USDC-MOLTBOOK/sigil-protocol
```

### 2. Verify wallet balance

```bash
docker run --rm \
    -v "$(pwd)/id.json:/wallet.json:ro" \
    solanafoundation/anchor:v0.32.1 \
    solana balance $(docker run --rm -v "$(pwd)/id.json:/wallet.json:ro" solanafoundation/anchor:v0.32.1 solana-keygen pubkey /wallet.json) --url devnet
```

> [!WARNING]
> Ensure you have at least 2 SOL for deployment. Get devnet SOL from https://faucet.solana.com/

### 3. Clean previous builds

```bash
rm -rf target/deploy target/idl target/types .anchor Cargo.lock
```

// turbo

### 4. Run the deploy script

```bash
./docker-deploy.sh
```

This script will:
1. Pull the official Docker image
2. Build the program with `anchor build`
3. Deploy to devnet with `solana program deploy`
4. Verify the deployment

### 5. Verify deployment on explorer

After successful deployment, open:
https://explorer.solana.com/address/BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe?cluster=devnet

---

## Troubleshooting

### Error: `edition2024 is required`

This means a dependency (usually `blake3`) is too new. Ensure `blake3 = "=1.5.5"` is pinned in `programs/sigil-registry/Cargo.toml`.

### Error: `insufficient funds`

Get more devnet SOL from the faucet: https://faucet.solana.com/

### Error: RPC rate limit

The devnet RPC can be unstable. Wait a few minutes and retry, or use a different RPC endpoint.

---

## Environment Reference

| Component | Version |
|-----------|---------|
| Docker Image | `solanafoundation/anchor:v0.32.1` |
| Anchor | 0.32.1 |
| Rust | 1.90.0 |
| Solana CLI | 2.x (Agave) |
| blake3 (pinned) | 1.5.5 |

---

## Program Info

- **Program ID**: `BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe`
- **Network**: Devnet
- **Wallet**: `3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo`
