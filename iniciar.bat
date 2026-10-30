@echo off
cd /d "%~dp0"
node gerar.js
start "" index.html
