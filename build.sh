#!/bin/bash
# Build Sigil Protocol using compatible Docker environment

echo "Building Sigil Protocol..."
docker run --rm \
    -v $(pwd):/work \
    -w /work \
    backpackapp/build:v0.30.1 \
    cargo build-sbf --manifest-path programs/sigil-registry/Cargo.toml

echo "Build complete. Artifact: programs/sigil-registry/target/deploy/sigil_registry.so"
