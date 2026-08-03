@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title Evora Mavic 3E Pilot v4 - Instalacao e Gateway
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0INICIAR-TUDO.ps1"
set "EVORA_EXIT=%errorlevel%"
echo.
if not "%EVORA_EXIT%"=="0" echo O gateway terminou com codigo %EVORA_EXIT%.
echo Pressione qualquer tecla para fechar.
pause >nul
exit /b %EVORA_EXIT%
