#!/bin/bash
set -e

echo "Building WASM module..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "Installing wasm-pack..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Navigate to wasm-renderer directory
cd "$(dirname "$0")/../wasm-renderer"

# Build the WASM module
wasm-pack build --target web --release

# Copy output to public directory
mkdir -p ../public/wasm
cp pkg/ascii_renderer_bg.wasm ../public/wasm/
cp pkg/ascii_renderer.js ../public/wasm/
cp pkg/ascii_renderer.d.ts ../public/wasm/

echo "WASM build complete!"
