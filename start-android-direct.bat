@echo off
chcp 65001 > nul
echo ===================================================
echo   Android 実寸表示 (Pixel 7 ランドスケープ)
echo ===================================================
echo.
start /b python -m http.server 8090 > nul 2>&1
timeout /t 2 /nobreak > nul

set EDGE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set UA="Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"

if exist %EDGE% (
    start "" %EDGE% --app="http://localhost:8090/index.html" --window-size=915,412 --user-agent=%UA%
) else (
    start http://localhost:8090/index.html
)
