@echo off
chcp 65001 >nul
title 강경 타임워커
echo ==============================================
echo   강경 타임워커 - 실행 (같은 와이파이 휴대폰도 접속 가능)
echo ==============================================
where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js가 없습니다. nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행하세요.
  pause
  exit /b 1
)
if not exist node_modules (
  echo [1/3] 필요한 파일 설치 중... 처음 한 번만, 1~3분
  call npm install --no-audit --no-fund
)
if not exist .next\BUILD_ID (
  echo [2/3] 앱 빌드 중... 처음 한 번만, 1분 내외
  call npm run build
)
for /f %%i in ('node scripts\qr-secret.mjs') do set QR_SECRET=%%i
set ADMIN_DEMO=true
echo [3/3] 실행합니다. Windows 방화벽 창이 뜨면 '허용'을 눌러야 휴대폰에서 접속돼요.
start "" /b node scripts\lan-url.mjs
call npm start
pause
