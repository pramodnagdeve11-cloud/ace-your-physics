@echo off
title Ace Your Physics - GitHub Upload Tool
color 0b
cls
echo ========================================================
echo        ACE YOUR PHYSICS - GITHUB UPLOADER
echo ========================================================
echo.
echo Folder: %~dp0
echo.
cd /d "%~dp0"

echo [1/3] Git status check ho raha hai...
git status
echo.

set /p REPO_URL="Apna GitHub Repository URL yahan paste karein aur Enter dabayein: "

if "%REPO_URL%"=="" (
    echo.
    echo [ERROR] URL khali nahi ho sakta! Please dobara run karein.
    pause
    exit /b
)

echo.
echo [2/3] GitHub repository ko link kiya ja raha hai...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo.
echo [3/3] Code GitHub par upload ho raha hai...
echo (Agar browser login window open ho, toh 'Sign in with your browser' par click karein)
echo.

git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo    SUCCESS! Aapki website GitHub par upload ho gayi hai!
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo    Kripya apna GitHub login authorize karein ya URL check karein.
    echo ========================================================
)

echo.
pause
