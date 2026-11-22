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

set DEFAULT_URL=https://github.com/pramodnagdeve11-cloud/ace-your-physics.git
echo Default GitHub URL: %DEFAULT_URL%
echo.
set /p REPO_URL="Enter dabayein default URL (%DEFAULT_URL%) ke liye, ya koi naya URL paste karein: "

if "%REPO_URL%"=="" (
    set REPO_URL=%DEFAULT_URL%
)

echo.
echo [2/3] GitHub repository ko link kiya ja raha hai...
echo Target: %REPO_URL%
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
    echo    View at: https://github.com/pramodnagdeve11-cloud/aceyourphysics
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo    [NOTE] Agar repository nahi mili (Repository not found):
    echo    1. Browser me https://github.com/new kholein
    echo    2. Repository name me 'aceyourphysics' daalein
    echo    3. 'Create repository' button par click karein
    echo    4. Uske baad is file ko dobara run karein!
    echo ========================================================
)

echo.
pause
