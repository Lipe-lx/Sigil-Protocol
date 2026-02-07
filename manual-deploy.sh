#!/bin/bash
set -e

# Configuration
IMAGE_NAME="solanafoundation/anchor:v0.32.1"
WALLET_FILE="id.json"
PROGRAM_ID="BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe"
KEY_SOURCE_FILE="../../../../chaves-carteira-sigil.txt"

echo "♠️ Sigil Protocol - Emergency Manual Deploy"
echo "=========================================="

# 1. Extract/Verify Key
if [ ! -f "$WALLET_FILE" ]; then
    echo "🔑 key file '$WALLET_FILE' not found. Attempting to extract from source..."
    if [ -f "$KEY_SOURCE_FILE" ]; then
        # Extract the array content: everything between '[' and ']'
        KEY_CONTENT=$(grep -o '\[.*\]' "$KEY_SOURCE_FILE" | head -n 1)
        if [ -n "$KEY_CONTENT" ]; then
            echo "$KEY_CONTENT" > "$WALLET_FILE"
            echo "✅ Key extracted to $WALLET_FILE"
        else
            echo "❌ Could not find key pattern in $KEY_SOURCE_FILE"
            exit 1
        fi
    else
        echo "❌ Source key file not found at $KEY_SOURCE_FILE"
        exit 1
    fi
else
    echo "✅ Using existing $WALLET_FILE"
fi

# 2. Pull Docker Image
echo ""
echo "🐳 Pulling Docker image: $IMAGE_NAME..."
docker pull "$IMAGE_NAME"

# 3. Build & Deploy
echo ""
echo "🚀 Starting Build & Deploy Wrapper..."

# We run a single container to maintain state between commands if needed, 
# or chain commands in one go.
# We mount the current directory to /workdir
# We mount the id.json to /root/.config/solana/id.json so solana cli picks it up by default if needed,
# but we also pass it explicitly.

docker run --rm -it \
    -v "$(pwd):/workdir" \
    -v "$(pwd)/$WALLET_FILE:/root/.config/solana/id.json" \
    -w /workdir \
    "$IMAGE_NAME" \
    /bin/bash -c "
        set -e
        
        echo '📦 Installing dependencies...'
        yarn install

        echo '🔨 Building...'
        anchor build

        echo '📤 Deploying to Devnet...'
        # Ensure 'provider.wallet' in Anchor.toml points to a place accessible or we override it
        # We override with --provider.wallet
        # We use the keypair from programs/ for the program ID authority if needed, 
        # but usually upgrade authority is the wallet.
        
        # Note: If 'programs/sigil-registry-keypair.json' doesn't exist or doesn't match PROGRAM_ID, 
        # deployment might fail or deploy a new program. 
        # The user said 'Program ID: BWpp...' is expected.
        
        solana config set --url devnet
        
        echo '   Deploying...'
        anchor deploy --provider.cluster devnet --provider.wallet /root/.config/solana/id.json --program-keypair programs/sigil-registry-keypair.json --program-name sigil_registry
        
        echo '🔄 Syncing IDL...'
        # Try init first, if fails (already exists), try upgrade
        if ! anchor idl init --provider.cluster devnet --provider.wallet /root/.config/solana/id.json --filepath target/idl/sigil_registry.json $PROGRAM_ID; then
            echo '   IDL init failed (likely exists), trying upgrade...'
            anchor idl upgrade --provider.cluster devnet --provider.wallet /root/.config/solana/id.json --filepath target/idl/sigil_registry.json $PROGRAM_ID
        fi
        
        echo '✅ Deployment Sequence Complete inside Docker'
    "

echo ""
echo "🎉 Manual Deploy Script Finished."
