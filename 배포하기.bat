@echo off
chcp 65001 >nul
title 강경 타임워커 - Vercel 배포
echo ==============================================
echo   Vercel에 배포해 https 공개 주소를 만듭니다
echo   처음 한 번은 브라우저가 열리면 Vercel에 로그인하세요 (토큰 입력 불필요)
echo ==============================================
where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js가 없습니다. nodejs.org 에서 LTS 버전을 설치하세요.
  pause
  exit /b 1
)
for /f %%i in ('node scripts\qr-secret.mjs') do set QR_SECRET=%%i
call npx --yes vercel@latest deploy --prod --yes -e QR_SECRET=%QR_SECRET% -e ADMIN_DEMO=true
echo.
echo 위에 나온 https://... 주소 뒤에 /share 를 붙여 열면 접속용 QR이 나옵니다.
echo 장소 인증 QR 인쇄: https://.../admin/qr
pause
