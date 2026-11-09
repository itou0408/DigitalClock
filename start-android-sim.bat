@echo off
chcp 65001 > nul
echo ===================================================
echo   Android シミュレータ起動ランチャー (SEIKO Clock)
echo ===================================================
echo.
echo [1/2] ローカル Web サーバーを起動中 (ポート 8090)...
start /b python -m http.server 8090 > nul 2>&1

timeout /t 2 /nobreak > nul

echo [2/2] Android エミュレーション画面を起動中...

set EDGE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if exist %EDGE% (
    start "" %EDGE% --app="http://localhost:8090/simulator.html" --window-size=1200,750
) else (
    start http://localhost:8090/simulator.html
)

echo.
echo 起動が完了しました！
echo 終了する場合は、このウィンドウを閉じるか Ctrl+C を押してください。
pause
