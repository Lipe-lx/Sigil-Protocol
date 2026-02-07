#!/bin/bash
# =============================================================================
# Sigil Protocol - Devnet Deploy Script (Using Official Anchor Build Image)
# Uses backpackapp/build:v0.30.1 - Official pre-built image with all deps pinned
# =============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Official Solana Foundation Anchor build image with modern toolchain
# Contains Rust 1.90.0, Cargo 1.90.0, fully supports edition2024
IMAGE_NAME="solanafoundation/anchor:v0.32.1"
WALLET_FILE="id.json"
PROGRAM_ID="BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe"

echo "♠️ Sigil Protocol - Devnet Deploy"
echo "=================================="
echo "Using official build image: $IMAGE_NAME"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Pull Docker Image
# ─────────────────────────────────────────────────────────────────────────────
echo "🐳 Pulling official Anchor build image..."
docker pull "$IMAGE_NAME"
echo "✅ Image ready"

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Verify Wallet
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "💰 Checking wallet balance..."
if [ ! -f "$WALLET_FILE" ]; then
    echo "❌ Wallet file not found: $WALLET_FILE"
    exit 1
fi

# Get wallet address
WALLET_ADDR=$(docker run --rm \
    -v "$SCRIPT_DIR/$WALLET_FILE:/wallet.json:ro" \
    "$IMAGE_NAME" \
    solana-keygen pubkey /wallet.json 2>/dev/null)
echo "   Address: $WALLET_ADDR"

# Get balance
BALANCE=$(docker run --rm \
    "$IMAGE_NAME" \
    solana balance "$WALLET_ADDR" --url devnet 2>/dev/null | awk '{print $1}')
echo "   Balance: $BALANCE SOL"

# ─────────────────────────────────────────────────────────────────────────────
# Step 3: Clean previous builds
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🧹 Cleaning previous build artifacts..."
rm -rf target/deploy target/idl target/types .anchor 2>/dev/null || true
# Remove any stale Cargo.lock that might have wrong deps
rm -f Cargo.lock 2>/dev/null || true

# ─────────────────────────────────────────────────────────────────────────────
# Step 4: Build Program
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "📦 Building program (this may take 2-5 minutes)..."
docker run --rm \
    -v "$SCRIPT_DIR:/workdir" \
    -w /workdir \
    "$IMAGE_NAME" \
    /bin/bash -c "
        anchor build 2>&1
    "

if [ $? -ne 0 ]; then
    echo "❌ Anchor build failed"
    exit 1
fi

# Verify the .so file exists
SO_FILE="target/deploy/sigil_registry.so"
if [ ! -f "$SO_FILE" ]; then
    echo "❌ Build artifact not found: $SO_FILE"
    exit 1
fi
echo "✅ Build successful: $SO_FILE ($(du -h "$SO_FILE" | cut -f1))"

# ─────────────────────────────────────────────────────────────────────────────
# Step 5: Deploy to Devnet
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🚀 Deploying to Devnet..."
echo "   Program ID: $PROGRAM_ID"

docker run --rm \
    -v "$SCRIPT_DIR:/workdir" \
    -v "$SCRIPT_DIR/$WALLET_FILE:/root/.config/solana/id.json" \
    -w /workdir \
    "$IMAGE_NAME" \
    /bin/bash -c "
        solana config set --url devnet && \
        solana program deploy target/deploy/sigil_registry.so \
            --program-id programs/sigil-registry-keypair.json \
            --keypair /root/.config/solana/id.json
    "

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Deploy command returned non-zero. Checking if it was successful anyway..."
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 6: Verify Deployment
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🔍 Verifying deployment..."
sleep 3

docker run --rm "$IMAGE_NAME" \
    solana program show "$PROGRAM_ID" --url devnet 2>&1 || true

# ─────────────────────────────────────────────────────────────────────────────
# Success
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=================================="
echo "♠️ Sigil Protocol Deploy Complete"
echo "=================================="
echo "Program ID: $PROGRAM_ID"
echo "Explorer:   https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
