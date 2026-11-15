@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Premium ATS Resume Builder
color 0B

echo =========================================================
echo       PREMIUM ATS RESUME BUILDER PLATFORM
echo =========================================================
echo.

:: Check Node.js installation
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js v18 or newer from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v
echo.

:: Check npm installation
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed or not found in system PATH.
    echo Please install Node.js with npm from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] npm detected:
call npm -v
echo.

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [INFO] node_modules folder not found. Installing dependencies...
    echo This may take a few moments. Please wait...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install npm dependencies.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
    echo.
)

:: Inform user and prepare application launch
echo [INFO] Starting Next.js development server...
echo [INFO] Local URL: http://localhost:3000
echo [INFO] The web application will open in your default browser.
echo.

:: Launch browser in background after 3 second delay so server has time to bind
start "" cmd /c "ping 127.0.0.1 -n 4 >nul & start http://localhost:3000"

:: Start development server
call npm run dev

if errorlevel 1 (
    echo.
    echo [ERROR] Development server stopped unexpectedly.
    pause
)
