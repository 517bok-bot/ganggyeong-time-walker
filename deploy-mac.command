#!/bin/bash
# 강경 타임워커 - Vercel 배포 (macOS 더블클릭). 처음 한 번은 브라우저에서 Vercel 로그인
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js가 필요합니다: https://nodejs.org (LTS)"; read -r; exit 1; }
QR_SECRET="$(node scripts/qr-secret.mjs)"
npx --yes vercel@latest deploy --prod --yes -e QR_SECRET="$QR_SECRET" -e ADMIN_DEMO=true
echo
echo "나온 https://... 주소 뒤에 /share 를 붙이면 접속용 QR, /admin/qr 은 장소 인증 QR 인쇄본이에요."
read -r
