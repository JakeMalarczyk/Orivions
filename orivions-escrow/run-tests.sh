#!/usr/bin/env bash
# Orivions Escrow - full TypeScript suite. One command for auditors.
# Requires: Node.js 18+. Uses the TypeScript pinned in devDependencies.
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
echo "== Building core/ -> dist/ =="
./node_modules/.bin/tsc -p tsconfig.json
echo "== Running TypeScript test suite =="
for t in surface stateMachine fees payments parity; do
  node "tests/$t.test.mjs"
done
echo ""
echo "All TypeScript tests passed."
echo "Rust core:  cd rust && cargo test"
