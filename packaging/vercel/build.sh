#!/usr/bin/env bash
# WordNext fork: build the browser version on Vercel (static output in dist/web).
# Vercel's image has an old glibc, so use the static (musl) Trunk build; install Rust and the wasm target ourselves.
set -euo pipefail

TRUNK_VERSION="${TRUNK_VERSION:-0.21.14}"

# The image may ship a bare `cargo` without rustup (no wasm target), so always use our own rustup.
export CARGO_HOME="${CARGO_HOME:-$HOME/.cargo}"
export RUSTUP_HOME="${RUSTUP_HOME:-$HOME/.rustup}"
export PATH="$CARGO_HOME/bin:$PATH"
if ! command -v rustup >/dev/null 2>&1; then
  curl -fsSL https://sh.rustup.rs | sh -s -- -y --no-modify-path --profile minimal --default-toolchain stable
fi
rustup default stable
rustup target add wasm32-unknown-unknown
cargo --version

mkdir -p "$CARGO_HOME/bin"
curl -fsSL "https://github.com/trunk-rs/trunk/releases/download/v${TRUNK_VERSION}/trunk-x86_64-unknown-linux-musl.tar.gz" \
  | tar -xz -C "$CARGO_HOME/bin" trunk
trunk --version

cd apps/photocraft-web
trunk build --release
