# Quick Start Guide - Building Windows .exe

This guide helps you quickly build the Financial Statement Generator as a Windows .exe file.

## Prerequisites Checklist

Before you start, ensure you have:
- [ ] Windows 10 (1909+) or Windows 11
- [ ] Node.js 20+ installed ([Download](https://nodejs.org/))
- [ ] Internet connection (for downloading dependencies)
- [ ] ~10 GB free disk space
- [ ] PostgreSQL 16+ installed (or ready to install) ([Download](https://www.postgresql.org/download/windows/))

## Quick Build (3 Simple Steps)

### Step 1: Check Your Environment
```cmd
check-environment.bat
```
This will verify all prerequisites are installed correctly.

### Step 2: Build the Application
```cmd
build-windows.bat
```
This automated script will:
- Install dependencies
- Build the web application
- Compile Electron scripts
- Create the Windows installer

**Duration**: 15-25 minutes on first run

### Step 3: Test the Installer
Navigate to `dist-electron/` folder and run:
```
Financial Statement Generator-Setup-1.0.0.exe
```

## Installation Files Created

After successful build, you'll find in `dist-electron/`:

| File | Purpose | Size |
|------|---------|------|
| `Financial Statement Generator-Setup-1.0.0.exe` | Full installer with wizard | ~200-400 MB |
| `Financial Statement Generator-1.0.0-Portable.exe` | Portable version (no installation) | ~200-400 MB |
| `win-unpacked/` folder | Unpacked application for testing | ~400-600 MB |

## What Each File Does

### Setup Installer
- **Installs** to Program Files
- **Creates** desktop and Start Menu shortcuts
- **Registers** file associations (Excel, CSV)
- **Includes** uninstaller
- **Best For**: Distributing to end users

### Portable Version
- **No installation** required
- **Run** directly from any location
- **Self-contained** with all dependencies
- **Best For**: USB drives, testing, temporary use

## Troubleshooting Quick Fixes

### Problem: "pnpm is not installed"
**Fix**:
```cmd
npm install -g pnpm
```

### Problem: "Cannot connect to database"
**Fix**: 
1. Install PostgreSQL from https://www.postgresql.org/download/windows/
2. Create database:
   ```cmd
   createdb -U postgres financialsdb
   ```
3. Configure connection in .env file

### Problem: Build fails with network error
**Fix**:
1. Check internet connection
2. Check firewall settings
3. Try again - sometimes network issues are temporary

### Problem: "Disk space insufficient"
**Fix**:
- Free up at least 10 GB
- Run Disk Cleanup (`cleanmgr`)
- Delete old node_modules folders from other projects

## Next Steps After Build

### 1. Setup Database
See `DATABASE_SETUP_GUIDE.md` for detailed instructions on:
- Installing PostgreSQL
- Creating the database
- Configuring connections

### 2. Test with Sample Data
1. Launch the application
2. Configure database connection
3. Import `Sample TB.xlsx` from the repository
4. Generate financial statements
5. Export to Excel and verify formulas

### 3. Distribute to Users
Options for distribution:
- **Email** the installer file
- **Network Share** for internal deployment
- **Cloud Storage** (Google Drive, OneDrive, etc.)
- **USB Drive** for offline distribution

## Important Notes

⚠️ **Database Required**: The application requires PostgreSQL. Users need to either:
- Install PostgreSQL locally
- Connect to a shared PostgreSQL server
- Or you can bundle PostgreSQL with the installer (advanced)

🔒 **Security**: Change default passwords in `.env` before distribution:
```env
ADMIN_PASSWORD=YOUR_SECURE_PASSWORD
JWT_SECRET=YOUR_LONG_RANDOM_STRING
```

📊 **Testing**: Always test the installer on a clean machine or VM before distribution.

## Need More Help?

- **Detailed Build Instructions**: See `COMPLETE_BUILD_SOLUTION.md`
- **Database Setup**: See `DATABASE_SETUP_GUIDE.md`
- **Original Instructions**: See `EXE Instructions.md`
- **Build Fixes Applied**: See `BUILD_FIXES_SUMMARY.md`

## Build Summary Checklist

Before distributing the installer:
- [ ] Built successfully without errors
- [ ] Tested installer on clean Windows machine
- [ ] Database setup instructions provided to users
- [ ] Changed default admin password
- [ ] Tested with Sample TB.xlsx
- [ ] All functions working (trial balance, PPE, exports, etc.)
- [ ] Excel exports have working formulas
- [ ] Created user documentation

## Success! What You've Built

You now have a professional Windows desktop application that:
- ✅ Runs on Windows 10/11
- ✅ Generates Schedule III compliant financial statements
- ✅ Exports to Excel with live formulas
- ✅ Includes user authentication and licensing
- ✅ Supports multiple companies
- ✅ Provides compliance checking
- ✅ Calculates ratios and aging schedules
- ✅ Works offline (once database is set up)

## Support

If you encounter issues:
1. Check error messages carefully
2. Review the detailed guides (COMPLETE_BUILD_SOLUTION.md)
3. Search for similar issues in the repository
4. Create a GitHub issue with full error details

---

**Quick Reference Commands**:
```cmd
# Check environment
check-environment.bat

# Build application  
build-windows.bat

# Test the build
cd dist-electron
"Financial Statement Generator-Setup-1.0.0.exe"

# If build fails, clean and retry
rmdir /s /q node_modules
rmdir /s /q dist
rmdir /s /q dist-electron
del pnpm-lock.yaml
pnpm install
pnpm run build
pnpm run build:electron
pnpm run electron:dist:win
```

**Last Updated**: October 2025  
**Build Time**: 15-25 minutes  
**Installer Size**: 200-400 MB
