# How to Test the AppData Folder Fix

## Quick Test Guide

This guide helps you verify that the AppData folder fix is working correctly.

## Prerequisites
- Windows 10 or Windows 11
- Git installed
- Node.js 18+ installed
- npm or pnpm installed

## Testing Steps

### Step 1: Pull the Latest Changes
```bash
git checkout copilot/fix-financial-statement-generator-error
git pull
```

### Step 2: Build the New Installer
```bash
cd "Financials Automation"

# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Build the application and create Windows installer
npm run dist:win
```

This will:
1. Build the web application
2. Compile Electron TypeScript files
3. Create a Windows installer (.exe) in `dist-electron` folder

**Expected Output:**
```
dist-electron/
└── Financial Statement Generator-Setup-1.0.0.exe
```

### Step 3: Uninstall Old Version (if installed)
1. Open **Windows Settings** → **Apps** → **Installed apps**
2. Find **Financial Statement Generator**
3. Click **Uninstall**
4. **Important:** When prompted, choose to keep or delete app data (your choice)

### Step 4: Clean Old AppData Folder (Optional)
If you want a completely fresh test:
```bash
# Open PowerShell and run:
Remove-Item "$env:APPDATA\first-project" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\Financial Statement Generator" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 5: Install New Version
1. Navigate to `Financials Automation\dist-electron`
2. Double-click `Financial Statement Generator-Setup-1.0.0.exe`
3. Follow installation prompts
4. Choose installation directory (default is fine)
5. Complete installation

### Step 6: Verify Correct Folder is Created
```bash
# Open PowerShell and run:
Test-Path "$env:APPDATA\Financial Statement Generator"
```

**Expected Result:** `True` (folder exists)

```bash
# Also check the old folder doesn't exist (or is empty):
Test-Path "$env:APPDATA\first-project"
```

**Expected Result:** `False` (folder doesn't exist with fresh install)

### Step 7: Verify App Uses Correct Folder
1. Open File Explorer
2. Navigate to: `%APPDATA%\Financial Statement Generator`
3. Create a test file: `config.env` with this content:
   ```
   DATABASE_URL=postgresql://postgres:test@localhost:5432/financialsdb
   ```
4. Launch **Financial Statement Generator** from Start menu or desktop
5. The app should attempt to use this config.env file

### Step 8: Check App Console for Verification
1. Launch the app
2. Press **Ctrl+Shift+I** to open Developer Tools
3. Go to **Console** tab
4. Look for log messages showing the environment file location

**Expected Console Output:**
```
Loading environment from: C:\Users\YourUsername\AppData\Roaming\Financial Statement Generator\config.env
```

OR (if file not found):
```
Environment file not found: C:\Users\YourUsername\AppData\Roaming\Financial Statement Generator\config.env
```

**✅ Success:** Path contains "Financial Statement Generator" (not "first-project")

## Verification Checklist

- [ ] Build completed without errors
- [ ] Installer .exe created in dist-electron folder
- [ ] Old version uninstalled successfully
- [ ] New version installed successfully
- [ ] Folder `%APPDATA%\Financial Statement Generator` exists
- [ ] App launches without "folder not found" error
- [ ] Console logs show correct AppData path
- [ ] Config.env file is detected (if created)

## Common Issues

### Issue: Build fails with "Cannot find module"
**Solution:**
```bash
cd "Financials Automation"
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dist:win
```

### Issue: Installer won't run
**Solution:**
- Right-click installer → **Properties** → **Unblock** → **Apply**
- Or run as Administrator

### Issue: App still uses old folder
**Solution:**
- Make sure you uninstalled the old version completely
- Delete both old and new AppData folders
- Reinstall from the new installer

### Issue: Can't find dist-electron folder
**Solution:**
- Make sure you ran `npm run dist:win` (not just `npm run build`)
- Check for build errors in console output
- Verify you're in the "Financials Automation" directory

## Expected Folder Structure After Installation

```
C:\Users\YourUsername\AppData\Roaming\
└── Financial Statement Generator\     ← NEW CORRECT LOCATION!
    ├── config.env (you create this)
    ├── preferences.json (auto-created)
    ├── exports\
    ├── imports\
    ├── templates\
    ├── backups\
    └── logs\
```

## What Changed?

### Before Fix:
- Package name: `"first-project"`
- App looked in: `%APPDATA%\first-project`
- Installer created: `%APPDATA%\Financial Statement Generator`
- **Result:** MISMATCH! App couldn't find config files ❌

### After Fix:
- Package name: `"financial-statement-generator"` (npm convention)
- App calls: `app.setName('Financial Statement Generator')`
- App looks in: `%APPDATA%\Financial Statement Generator`
- Installer creates: `%APPDATA%\Financial Statement Generator`
- **Result:** MATCH! App finds config files ✅

## Next Steps After Verification

Once you've verified the fix works:
1. Merge the pull request
2. Create a GitHub release with the new installer
3. Update installation documentation if needed
4. Notify users about the fix

## Need Help?

If you encounter issues:
1. Check the console output for detailed error messages
2. Review `APPDATA_FOLDER_FIX.md` for migration instructions
3. Check `INSTALLATION_SETUP_GUIDE.md` for setup help
4. Open an issue on GitHub with:
   - Build output/errors
   - Console logs from the app
   - Windows version
   - Steps you've tried

---

**Test Guide Version:** 1.0  
**Last Updated:** January 2025  
**Related Fix:** AppData folder name mismatch resolution
