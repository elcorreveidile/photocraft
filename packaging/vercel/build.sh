#!/usr/bin/env bash
# WordNext fork: build the browser version on Vercel (static output in dist/web).
# Vercel's build image has no Rust, so install the toolchain, the wasm target and Trunk first.
set -euo pipefail

TRUNK_VERSION="${TRUNK_VERSION:-0.21.14}"

if ! command -v cargo >/dev/null 2>&1; then
  curl -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable
fi
# shellcheck disable=SC1091
. "$HOME/.cargo/env"
rustup target add wasm32-unknown-unknown

mkdir -p "$HOME/.cargo/bin"
curl -fsSL "https://github.com/trunk-rs/trunk/releases/download/v${TRUNK_VERSION}/trunk-x86_64-unknown-linux-gnu.tar.gz" \
  | tar -xz -C "$HOME/.cargo/bin" trunk
trunk --version

cd apps/photocraft-web
trunk build --release
