@echo off
REM =============================================================================
REM Pre-Build Environment Check Script
REM =============================================================================
REM This script verifies that your system meets all requirements for building
REM the Financial Statement Generator Windows application.
REM =============================================================================

echo.
echo ===================================================================
echo  Financial Statement Generator - Environment Check
echo ===================================================================
echo.

setlocal enabledelayedexpansion
set ISSUES_FOUND=0

REM Check Node.js
echo [1/6] Checking Node.js...
node -v > nul 2>&1
if errorlevel 1 (
    echo [FAIL] Node.js is not installed or not in PATH
    echo        Please install Node.js 20+ from https://nodejs.org/
    set /a ISSUES_FOUND+=1
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK]   Node.js found: !NODE_VERSION!
    
    REM Check if version is 20 or higher
    for /f "tokens=1 delims=v." %%a in ("!NODE_VERSION!") do set NODE_MAJOR=%%a
    if !NODE_MAJOR! LSS 20 (
        echo [WARN] Node.js version is below 20. Version 20+ is recommended.
        echo        Current: !NODE_VERSION!
        set /a ISSUES_FOUND+=1
    )
)
echo.

REM Check npm
echo [2/6] Checking npm...
npm -v > nul 2>&1
if errorlevel 1 (
    echo [FAIL] npm is not installed or not in PATH
    set /a ISSUES_FOUND+=1
) else (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK]   npm found: !NPM_VERSION!
)
echo.

REM Check pnpm
echo [3/6] Checking pnpm...
pnpm -v > nul 2>&1
if errorlevel 1 (
    echo [WARN] pnpm is not installed
    echo        Installing pnpm is recommended for faster builds
    echo        Install with: npm install -g pnpm
    set /a ISSUES_FOUND+=1
) else (
    for /f "tokens=*" %%i in ('pnpm -v') do set PNPM_VERSION=%%i
    echo [OK]   pnpm found: !PNPM_VERSION!
)
echo.

REM Check PostgreSQL
echo [4/6] Checking PostgreSQL...
psql --version > nul 2>&1
if errorlevel 1 (
    echo [WARN] PostgreSQL command-line tools not found in PATH
    echo        PostgreSQL is required for the application to function
    echo        Install from: https://www.postgresql.org/download/windows/
    set /a ISSUES_FOUND+=1
) else (
    for /f "tokens=*" %%i in ('psql --version') do set PG_VERSION=%%i
    echo [OK]   PostgreSQL found: !PG_VERSION!
)
echo.

REM Check if .env file exists
echo [5/6] Checking .env configuration file...
if exist ".env" (
    echo [OK]   .env file found
    
    REM Check if DATABASE_URL is configured
    findstr /C:"DATABASE_URL" .env > nul
    if errorlevel 1 (
        echo [WARN] DATABASE_URL not found in .env file
        echo        You'll need to configure database connection
        set /a ISSUES_FOUND+=1
    ) else (
        echo [OK]   DATABASE_URL is configured
    )
) else (
    echo [WARN] .env file not found
    echo        Copy .env.example to .env and configure it
    echo        Or configure database connection in the application
    set /a ISSUES_FOUND+=1
)
echo.

REM Check available disk space
echo [6/6] Checking available disk space...
for /f "tokens=3" %%a in ('dir /-c ^| find "bytes free"') do set FREE_SPACE=%%a
set FREE_SPACE=!FREE_SPACE:,=!

REM Convert to GB (approximate)
set /a FREE_GB=!FREE_SPACE! / 1073741824

if !FREE_GB! LSS 10 (
    echo [WARN] Low disk space: approximately !FREE_GB! GB free
    echo        At least 10 GB recommended for build process
    set /a ISSUES_FOUND+=1
) else (
    echo [OK]   Sufficient disk space: approximately !FREE_GB! GB free
)
echo.

REM Summary
echo ===================================================================
echo  Environment Check Summary
echo ===================================================================
echo.

if !ISSUES_FOUND! EQU 0 (
    echo [SUCCESS] All checks passed! You're ready to build.
    echo.
    echo Next steps:
    echo   1. Run build-windows.bat to build the application
    echo   2. If you haven't set up PostgreSQL, see DATABASE_SETUP_GUIDE.md
    echo   3. For detailed build instructions, see COMPLETE_BUILD_SOLUTION.md
    echo.
) else (
    echo [WARNING] !ISSUES_FOUND! issue(s) found
    echo.
    echo Please resolve the issues above before building.
    echo For help, see COMPLETE_BUILD_SOLUTION.md
    echo.
)

echo Press any key to exit...
pause > nul
