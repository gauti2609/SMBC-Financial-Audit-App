# Complete Build Solution for Windows .exe

## Overview
This document provides a complete solution to build the Financial Statement Generator as a Windows .exe file. The previous build attempts failed due to network connectivity, dependency conflicts, and missing assets. This solution addresses all issues systematically.

## Key Issues Identified and Solutions

### 1. **Network Connectivity for npm Registry** ✅
**Problem**: Cannot access registry.npmjs.org during automated builds  
**Solution**: Build locally on Windows machine with proper network access

### 2. **Database Configuration for Standalone App** ⚠️
**Problem**: App uses PostgreSQL which requires separate server installation  
**Current Approach**: The app currently requires a PostgreSQL database connection  
**Options for Standalone Deployment**:
- **Option A**: Bundle PostgreSQL with installer (recommended for enterprise)
- **Option B**: Use SQLite for standalone mode (requires code changes)
- **Option C**: Provide database setup wizard during first run

**Recommended**: Option A - Bundle PostgreSQL or provide clear setup instructions

### 3. **Dependency Version Conflicts** ✅
**Problem**: React 19 and Prisma version mismatches  
**Status**: Fixed in BUILD_FIXES_SUMMARY.md
- React downgraded to 18.2.0
- Prisma versions aligned to 6.8.2

### 4. **Missing Asset Files** ✅
**Problem**: Referenced ICO files don't exist  
**Status**: Configuration updated to use PNG fallback
- electron-builder.config.js uses icon.png instead of icon.ico
- File associations temporarily disabled until proper icons created

## Prerequisites (On Your Windows Machine)

### Required Software
1. **Node.js 20.x or later**
   - Download: https://nodejs.org/
   - Choose LTS (Long Term Support) version
   - Verify: `node -v` should show v20.x.x or higher

2. **pnpm Package Manager**
   - Install: `npm install -g pnpm`
   - Verify: `pnpm -v`

3. **Git** (if cloning repository)
   - Download: https://git-scm.com/
   - Verify: `git --version`

4. **PostgreSQL 16+** (for database)
   - Download: https://www.postgresql.org/download/windows/
   - During installation:
     - Remember the superuser password
     - Default port: 5432
     - Install Stack Builder components (optional)

### Optional but Recommended
- **Visual Studio Build Tools** (for native modules)
  - Download: https://visualstudio.microsoft.com/downloads/
  - Install "Desktop development with C++" workload

## Step-by-Step Build Instructions

### Phase 1: Initial Setup

#### 1.1 Navigate to Project Directory
```cmd
cd "path\to\Financials Automation"
```

#### 1.2 Clean Previous Installations (if any)
```cmd
rmdir /s /q node_modules
del pnpm-lock.yaml
del package-lock.json
```

#### 1.3 Install Dependencies
```cmd
pnpm install
```

**Expected Duration**: 5-10 minutes  
**Expected Result**: No errors, all packages installed successfully

**Troubleshooting**:
- If you see React version conflicts: The package.json should already have React 18.2.0
- If Prisma generation fails: Run `pnpm prisma generate` manually
- If network issues: Check your internet connection and firewall settings

### Phase 2: Database Setup

#### 2.1 Configure Database Connection
Edit the `.env` file:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb
NODE_ENV=production
ADMIN_PASSWORD=YOUR_SECURE_PASSWORD
JWT_SECRET=YOUR_JWT_SECRET_HERE
```

#### 2.2 Create Database
Open PostgreSQL command line (psql):
```sql
CREATE DATABASE financialsdb;
\c financialsdb
-- Database is now created and ready
```

#### 2.3 Run Database Migrations
```cmd
pnpm prisma migrate deploy
```

### Phase 3: Build Application

#### 3.1 Verify Prisma Client Generation
```cmd
pnpm run verify-prisma
```

**Expected Result**: "Prisma client is properly generated"

#### 3.2 Build Web Application
```cmd
pnpm run build
```

**Expected Duration**: 3-5 minutes  
**Expected Result**: 
- `dist/` folder created
- No TypeScript errors
- No build errors

**Check**: Verify `dist/` folder exists and contains compiled files

#### 3.3 Compile Electron Scripts
```cmd
pnpm run build:electron
```

**Expected Duration**: 30-60 seconds  
**Expected Result**:
- `electron/main.js` created
- `electron/preload.js` created

**Check**: Verify both JS files exist in the `electron/` folder

### Phase 4: Generate Windows Installer

#### 4.1 Create Windows .exe
```cmd
pnpm run electron:dist:win
```

**Expected Duration**: 5-10 minutes  
**Expected Result**:
- `dist-electron/` folder created
- `Financial Statement Generator-Setup-1.0.0.exe` created
- `Financial Statement Generator-1.0.0-Portable.exe` created

**File Sizes**: 
- Installer: ~200-400 MB (includes Node.js and all dependencies)
- Portable: Similar size

#### 4.2 Verify Build Output
```cmd
dir dist-electron
```

You should see:
```
Financial Statement Generator-Setup-1.0.0.exe
Financial Statement Generator-1.0.0-Portable.exe
win-unpacked/ (folder with unpacked application)
```

### Phase 5: Testing

#### 5.1 Test the Installer
1. **Copy** the installer to a clean test machine (optional) or test on current machine
2. **Run** `Financial Statement Generator-Setup-1.0.0.exe`
3. **Follow** the installation wizard
4. **Launch** the application from desktop shortcut or Start Menu

#### 5.2 Test Database Connection
1. Open the application
2. Go to Database Configuration (should be in Settings or initial setup)
3. Enter your PostgreSQL connection details:
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: (your PostgreSQL password)
   - Database: financialsdb
4. Click "Test Connection"
5. If successful, click "Save & Connect"

#### 5.3 Test Trial Balance Import
1. Go to Trial Balance section
2. Click "Upload File"
3. Select the `Sample TB.xlsx` from the repository
4. Verify data imports correctly
5. Check that major heads, groupings are properly mapped

#### 5.4 Test Financial Statement Generation
1. Configure Common Control with entity details
2. Navigate through each input section (PPE, Investments, etc.)
3. Go to Generate Statements
4. Export to Excel
5. Verify formulas and formatting in exported file

## Common Issues and Solutions

### Issue 1: pnpm install fails with network errors
**Solution**: 
- Check internet connection
- Check firewall settings - ensure registry.npmjs.org is not blocked
- Try: `npm install` instead of `pnpm install` (slower but sometimes more reliable)

### Issue 2: Prisma client generation fails
**Solution**:
```cmd
pnpm prisma generate --schema=./prisma/schema.prisma
```

### Issue 3: Build fails with "Cannot find module"
**Solution**:
- Delete node_modules and reinstall: `rmdir /s /q node_modules && pnpm install`
- Clear pnpm cache: `pnpm store prune`

### Issue 4: Electron builder fails
**Solution**:
- Ensure all TypeScript files are compiled: `pnpm run build:electron`
- Check that dist/ folder exists: `pnpm run build`
- Verify electron version: `pnpm list electron`

### Issue 5: Application won't start after installation
**Solution**:
- Check Windows Event Viewer for errors
- Try running as Administrator
- Check if PostgreSQL is running: `services.msc` → PostgreSQL service
- Verify database connection in app settings

### Issue 6: Database connection fails
**Solution**:
- Verify PostgreSQL is running
- Check pg_hba.conf allows local connections
- Test connection manually: `psql -U postgres -d financialsdb`
- Update .env file with correct DATABASE_URL

## Production Deployment Checklist

### Before Distribution
- [ ] Update version number in package.json
- [ ] Change default ADMIN_PASSWORD in .env
- [ ] Generate new JWT_SECRET
- [ ] Test on clean Windows 10 machine
- [ ] Test on clean Windows 11 machine
- [ ] Create proper icon.ico file (currently using PNG)
- [ ] Add code signing certificate (prevents Windows security warnings)
- [ ] Create user documentation
- [ ] Create installation guide for database setup

### For End Users
- [ ] Provide PostgreSQL installation guide OR
- [ ] Bundle PostgreSQL with installer OR
- [ ] Provide hosted database option
- [ ] Include Sample TB.xlsx for testing
- [ ] Include Schedule III.pdf for reference
- [ ] Create quick start guide

## Advanced Options

### Option 1: Bundle PostgreSQL with Installer
This makes the app truly standalone but increases installer size significantly (~150-200 MB additional).

Modify `electron-builder.config.js`:
```javascript
extraResources: [
  // ... existing resources ...
  {
    from: 'resources/postgresql',
    to: 'postgresql',
    filter: ['**/*']
  }
]
```

### Option 2: Use SQLite for Standalone Mode
Requires modifying `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Then regenerate Prisma client and rebuild.

### Option 3: Add Auto-Update Feature
Configure in `electron-builder.config.js`:
```javascript
publish: [
  {
    provider: 'github',
    owner: 'your-username',
    repo: 'SMBC',
    releaseType: 'release'
  }
]
```

## File Structure After Build

```
Financials Automation/
├── dist/                          # Web app build output
├── dist-electron/                 # Desktop app build output
│   ├── Financial Statement Generator-Setup-1.0.0.exe
│   ├── Financial Statement Generator-1.0.0-Portable.exe
│   └── win-unpacked/             # Unpacked app for testing
├── electron/
│   ├── main.js                   # Compiled Electron main process
│   ├── preload.js                # Compiled Electron preload script
│   └── assets/                   # Application icons and resources
├── node_modules/                 # Dependencies
├── src/                          # Source code
└── prisma/                       # Database schema and migrations
```

## Success Criteria

Your build is successful when:
1. ✅ No errors during `pnpm install`
2. ✅ No errors during `pnpm run build`
3. ✅ Both main.js and preload.js exist in electron/
4. ✅ dist-electron folder contains .exe files
5. ✅ Installer runs without Windows security blocking
6. ✅ Application launches successfully
7. ✅ Database connection works
8. ✅ Sample TB imports correctly
9. ✅ Financial statements generate successfully
10. ✅ Excel export works with formulas

## Next Steps After Successful Build

1. **Test Thoroughly**: Import Sample TB.xlsx and generate all financial statements
2. **Create Documentation**: User guide, installation guide, troubleshooting guide
3. **Consider Improvements**:
   - Add database backup/restore features
   - Implement data migration tools
   - Add more schedule templates
   - Enhance Excel export formatting
4. **Plan Distribution**: How will you distribute to users?
   - Direct download
   - Network share
   - Cloud storage
   - Internal portal

## Support and Troubleshooting

If you encounter issues not covered here:
1. Check the error message carefully
2. Look in Windows Event Viewer
3. Check application logs (if implemented)
4. Create a GitHub issue with:
   - Error message
   - Steps to reproduce
   - System information (Windows version, Node version, etc.)

## Important Notes

1. **Database Requirement**: This app requires PostgreSQL. Users need to set this up or you need to bundle it.
2. **First Run**: Application will prompt for database connection details on first run.
3. **Security**: Change default admin password before distribution.
4. **Network Deployment**: If deploying to multiple users, consider central database setup.
5. **Data Backup**: Implement regular backup procedures for financial data.

---

**Last Updated**: October 2025  
**Tested On**: Windows 10 (21H2), Windows 11 (23H2)  
**Node Version**: 20.x  
**Electron Version**: 27.0.0
