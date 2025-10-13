@echo off
REM =============================================================================
REM Financial Statement Generator - Windows Build Script
REM =============================================================================
REM This script automates the build process for creating Windows .exe installer
REM Run this script from the project root directory
REM =============================================================================

echo.
echo ===================================================================
echo  Financial Statement Generator - Windows Build Script
echo ===================================================================
echo.
echo This script will build the Windows installer for the application.
echo Please ensure you have:
echo   - Node.js 20+ installed
echo   - pnpm installed (npm install -g pnpm)
echo   - Internet connection for downloading dependencies
echo.
pause

REM Check if Node.js is installed
echo.
echo [1/8] Checking Node.js installation...
node -v > nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found: 
node -v
echo.

REM Check if pnpm is installed
echo [2/8] Checking pnpm installation...
pnpm -v > nul 2>&1
if errorlevel 1 (
    echo WARNING: pnpm is not installed
    echo Installing pnpm globally...
    npm install -g pnpm
    if errorlevel 1 (
        echo ERROR: Failed to install pnpm
        pause
        exit /b 1
    )
)
echo pnpm found:
pnpm -v
echo.

REM Clean previous build artifacts (optional)
echo [3/8] Cleaning previous builds...
if exist "dist-electron" (
    echo Removing old dist-electron folder...
    rmdir /s /q dist-electron
)
if exist "dist" (
    echo Removing old dist folder...
    rmdir /s /q dist
)
if exist "electron\main.js" (
    echo Removing old electron/main.js...
    del electron\main.js
)
if exist "electron\preload.js" (
    echo Removing old electron/preload.js...
    del electron\preload.js
)
echo Cleanup complete.
echo.

REM Install dependencies
echo [4/8] Installing dependencies...
echo This may take 5-10 minutes on first run...
pnpm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    echo.
    echo Troubleshooting tips:
    echo   1. Check your internet connection
    echo   2. Try deleting node_modules and running again
    echo   3. Try using npm instead: npm install
    echo.
    pause
    exit /b 1
)
echo Dependencies installed successfully.
echo.

REM Verify Prisma client generation
echo [5/8] Verifying Prisma client...
pnpm run verify-prisma
if errorlevel 1 (
    echo WARNING: Prisma verification failed, attempting to regenerate...
    pnpm prisma generate
    if errorlevel 1 (
        echo ERROR: Prisma client generation failed
        pause
        exit /b 1
    )
)
echo Prisma client verified.
echo.

REM Build web application
echo [6/8] Building web application...
echo This may take 3-5 minutes...
pnpm run build
if errorlevel 1 (
    echo.
    echo ERROR: Web application build failed
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)
echo Web application built successfully.
echo.

REM Compile Electron scripts
echo [7/8] Compiling Electron scripts...
pnpm run build:electron
if errorlevel 1 (
    echo.
    echo ERROR: Electron compilation failed
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)
echo Electron scripts compiled successfully.
echo.

REM Build Windows installer
echo [8/8] Creating Windows installer...
echo This may take 5-10 minutes...
pnpm run electron:dist:win
if errorlevel 1 (
    echo.
    echo ERROR: Windows installer creation failed
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ===================================================================
echo  BUILD COMPLETED SUCCESSFULLY!
echo ===================================================================
echo.
echo The Windows installer has been created in the dist-electron folder:
echo.
dir /b dist-electron\*.exe
echo.
echo Files created:
echo   - Financial Statement Generator-Setup-1.0.0.exe (Main Installer)
echo   - Financial Statement Generator-1.0.0-Portable.exe (Portable Version)
echo.
echo Next steps:
echo   1. Test the installer on your machine
echo   2. Set up PostgreSQL database (if not already done)
echo   3. Configure database connection in the application
echo   4. Import Sample TB.xlsx to test functionality
echo.
echo For detailed instructions, see COMPLETE_BUILD_SOLUTION.md
echo.
pause
