#!/bin/bash
# Sigil Protocol - Build & Deploy Script
# Run this on your local machine with Anchor installed

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         SIGIL PROTOCOL - BUILD & DEPLOY                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Navigate to project
cd "$(dirname "$0")"

# Check anchor
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Install with:"
    echo "   cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli"
    exit 1
fi

echo "✅ Anchor CLI found: $(anchor --version)"

# Check Solana CLI
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found."
    exit 1
fi

echo "✅ Solana CLI found: $(solana --version)"
echo "✅ Network: $(solana config get | grep 'RPC URL')"

# Build
echo ""
echo "📦 Building program..."
anchor build

# Get program ID from keypair
PROGRAM_ID=$(solana address -k target/deploy/sigil_registry-keypair.json)
echo "✅ Program ID: $PROGRAM_ID"

# Update lib.rs with program ID if different
CURRENT_ID=$(grep "declare_id" programs/sigil-registry/src/lib.rs | grep -oP '"[^"]+"' | tr -d '"')
if [ "$PROGRAM_ID" != "$CURRENT_ID" ]; then
    echo "⚠️  Updating program ID in lib.rs..."
    sed -i "s/$CURRENT_ID/$PROGRAM_ID/" programs/sigil-registry/src/lib.rs
    echo "   Rebuilding with new ID..."
    anchor build
fi

# Deploy to devnet
echo ""
echo "🚀 Deploying to Solana Devnet..."
anchor deploy --provider.cluster devnet

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT COMPLETE                    ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  Program ID: $PROGRAM_ID"
echo "║  Network: Devnet                                          ║"
echo "║  Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo "╚═══════════════════════════════════════════════════════════╝"

# Copy IDL to frontend
echo ""
echo "📋 Copying IDL to frontend..."
cp target/idl/sigil_registry.json frontend/lib/idl.json
echo "✅ IDL copied to frontend/lib/idl.json"

echo ""
echo "🎉 Done! Run 'npm run dev' in frontend/ to test."
