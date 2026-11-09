#!/bin/bash
# 강경 타임워커 - 실행 (macOS: 더블클릭 / Linux: bash run-mac.command). 같은 와이파이 휴대폰도 접속 가능
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js가 필요합니다: https://nodejs.org (LTS)"; read -r; exit 1; }
[ -d node_modules ] || npm install --no-audit --no-fund
[ -f .next/BUILD_ID ] || npm run build
export QR_SECRET="$(node scripts/qr-secret.mjs)"
export ADMIN_DEMO=true
node scripts/lan-url.mjs &
npm start
