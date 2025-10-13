@echo off
REM Build Environment Checker for Financial Statement Generator
REM This script checks if your system has all prerequisites for building the .exe installer

echo ========================================
echo Financial Statement Generator
echo Build Environment Checker
echo ========================================
echo.

REM Check Node.js
echo [1/4] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [FAIL] Node.js is NOT installed
    echo    Download from: https://nodejs.org/
    set BUILD_READY=0
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo    [OK] Node.js is installed: %NODE_VERSION%
)
echo.

REM Check pnpm
echo [2/4] Checking pnpm installation...
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [FAIL] pnpm is NOT installed
    echo    Install with: npm install -g pnpm
    set BUILD_READY=0
) else (
    for /f "tokens=*" %%i in ('pnpm -v') do set PNPM_VERSION=%%i
    echo    [OK] pnpm is installed: v%PNPM_VERSION%
)
echo.

REM Check Git
echo [3/4] Checking Git installation...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [FAIL] Git is NOT installed
    echo    Download from: https://git-scm.com/
    set BUILD_READY=0
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo    [OK] Git is installed: %GIT_VERSION%
)
echo.

REM Check current directory
echo [4/4] Checking repository structure...
if exist "Financials Automation" (
    echo    [OK] Found 'Financials Automation' directory
    if exist "Financials Automation\package.json" (
        echo    [OK] Found package.json
    ) else (
        echo    [WARN] package.json not found
    )
    if exist "Financials Automation\electron-builder.config.js" (
        echo    [OK] Found electron-builder.config.js
    ) else (
        echo    [WARN] electron-builder.config.js not found
    )
) else (
    echo    [FAIL] 'Financials Automation' directory not found
    echo    Make sure you're in the repository root directory
    set BUILD_READY=0
)
echo.

echo ========================================
echo Summary
echo ========================================

if "%BUILD_READY%"=="0" (
    echo Status: [NOT READY] - Please install missing prerequisites
    echo.
    echo Next Steps:
    echo 1. Install missing tools listed above
    echo 2. Run this script again to verify
    echo 3. Follow build instructions in EXE Instructions.md
) else (
    echo Status: [READY] - All prerequisites are installed!
    echo.
    echo Next Steps:
    echo 1. cd "Financials Automation"
    echo 2. pnpm install
    echo 3. pnpm run build
    echo 4. pnpm run build:electron
    echo 5. pnpm run electron:dist:win
    echo.
    echo The installer will be created in: Financials Automation\dist-electron\
)
echo.
echo For detailed instructions, see:
echo - HOW_TO_GET_INSTALLER.md
echo - Financials Automation\EXE Instructions.md
echo.
pause
