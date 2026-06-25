#!/usr/bin/env bash
# Sync canonical copy from Obsidian vault into the repo (run after editing ~/vault/portfolio/site.json)
set -euo pipefail
VAULT="${VAULT:-$HOME/vault/portfolio/site.json}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cp "$VAULT" "$ROOT/data/site.json"
cp "$VAULT" "$ROOT/design-mvp/site.json"
echo "Synced site.json -> data/ and design-mvp/"
