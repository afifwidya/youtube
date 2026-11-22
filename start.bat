@echo off
chcp 65001 >nul
title Faceless Radar - Launcher
setlocal EnableDelayedExpansion

cd /d "%~dp0"

:menu
cls
echo ================================================================
echo               📡 FACELESS RADAR - YOUTUBE RESEARCH              
echo ================================================================
echo.
echo   [1] Jalankan Server Web ^& Buka di Browser (http://localhost:8080)
echo   [2] Update / Ambil Data YouTube Indonesia (npm run collect:id)
echo   [3] Update / Ambil Data YouTube Global US (npm run collect:us)
echo   [4] Update Data Indonesia ^& US Sekaligus
echo   [5] Rebuild / Reset Data Awal Indonesia (npm run seed:id)
echo   [6] Jalankan Diagnostic / Unit Test (npm test)
echo   [0] Keluar
echo.
echo ================================================================
set "pilihan="
set /p pilihan="Pilih menu [1-6, atau 0]: "

if "%pilihan%"=="1" goto start_server
if "%pilihan%"=="2" goto collect_id
if "%pilihan%"=="3" goto collect_us
if "%pilihan%"=="4" goto collect_both
if "%pilihan%"=="5" goto seed_id
if "%pilihan%"=="6" goto run_test
if "%pilihan%"=="0" goto keluar

echo.
echo Pilihan tidak valid. Silakan coba lagi.
ping -n 2 127.0.0.1 >nul
goto menu

:start_server
cls
echo ================================================================
echo   Menjalankan Server Faceless Radar di http://localhost:8080...
echo ================================================================
echo Tekan Ctrl + C di jendela ini untuk mematikan server.
echo.
start "" "http://localhost:8080"
node scripts/serve.mjs
echo.
pause
goto menu

:collect_id
cls
echo ================================================================
echo   Mengumpulkan Data Riset YouTube Indonesia (ID)...
echo ================================================================
echo.
node scripts/collect.mjs --region id
echo.
echo Selesai! Data tersimpan di folder site/data/id/
echo.
pause
goto menu

:collect_us
cls
echo ================================================================
echo   Mengumpulkan Data Riset YouTube Global (US)...
echo ================================================================
echo.
node scripts/collect.mjs --region us
echo.
echo Selesai! Data tersimpan di folder site/data/us/
echo.
pause
goto menu

:collect_both
cls
echo ================================================================
echo   [1/2] Mengumpulkan Data Riset YouTube Indonesia (ID)...
echo ================================================================
echo.
node scripts/collect.mjs --region id
echo.
echo ================================================================
echo   [2/2] Mengumpulkan Data Riset YouTube Global (US)...
echo ================================================================
echo.
node scripts/collect.mjs --region us
echo.
echo Semua data berhasil dikumpulkan!
echo.
pause
goto menu

:seed_id
cls
echo ================================================================
echo   Menyusun Ulang Data Awal Indonesia (Seed Offline)...
echo ================================================================
echo.
node scripts/seed-id.mjs
echo.
pause
goto menu

:run_test
cls
echo ================================================================
echo   Menjalankan Unit Test Collector Sintetis...
echo ================================================================
echo.
node tests/run.mjs
echo.
pause
goto menu

:keluar
cls
echo Terima kasih telah menggunakan Faceless Radar!
ping -n 2 127.0.0.1 >nul
exit /b 0
