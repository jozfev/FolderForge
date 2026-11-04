
@echo off
chcp 65001 >nul
title FolderForge Launcher

cd /d "%~dp0"

if not exist "node_modules" (
    echo Установка зависимостей FolderForge...
    call npm install
)

echo Запуск FolderForge...
start "" cmd /c "npm run dev -- --open"

exit
