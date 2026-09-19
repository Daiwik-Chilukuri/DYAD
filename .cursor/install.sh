#!/usr/bin/env bash
# DYAD Cloud Agent install: idempotently install dependencies for the root app
# (once it exists) and every isolated prototype-*/ folder that has a package.json.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "DYAD environment install — repo root: $ROOT"

# Don't let corepack block on an interactive download prompt in CI-like runs.
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

install_dir() {
  local dir="$1"
  if [ -f "$dir/package.json" ]; then
    echo "==> Installing dependencies in $dir"
    if [ -f "$dir/pnpm-lock.yaml" ]; then
      (cd "$dir" && pnpm install --frozen-lockfile) || (cd "$dir" && pnpm install)
    else
      (cd "$dir" && pnpm install)
    fi
  fi
}

# Root (future unified Next.js app under src/, if/when it lands).
install_dir "$ROOT"

# Each self-descriptive prototype folder.
shopt -s nullglob
for dir in "$ROOT"/prototype-*/; do
  install_dir "${dir%/}"
done

echo "DYAD install complete."
