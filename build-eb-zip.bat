@echo off
setlocal
cd /d "%~dp0"
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\build-eb-zip.ps1"
if errorlevel 1 exit /b 1
pause
