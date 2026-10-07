@echo off
title Movimento em Jogo - Servidor
echo Iniciando servidor...
rem %~dp0 = pasta onde este arquivo esta (funciona mesmo se o projeto mudar de lugar)
cd /d "%~dp0"
npm run dev
pause
