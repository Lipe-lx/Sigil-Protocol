#!/bin/bash
# Deploy Sigil Protocol to Devnet

echo "Deploying Sigil Protocol..."
docker run --rm \
    -v $(pwd):/work \
    -v $(pwd)/id.json:/home/node/.config/solana/id.json \
    -w /work \
    backpackapp/build:v0.30.1 \
    solana program deploy \
    programs/sigil-registry/target/deploy/sigil_registry.so \
    --program-id programs/sigil-registry-keypair.json \
    --keypair /home/node/.config/solana/id.json \
    --url devnet

echo "Deployment complete."
