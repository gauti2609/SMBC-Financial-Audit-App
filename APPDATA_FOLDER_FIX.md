# AppData Folder Name Fix - Solution Summary

## Problem
When trying to run the Financial Statement Generator, you encountered:
- Error: "Windows cannot find 'C:\Users\mishr\AppData\Roaming\Financial'"
- The folder `%APPDATA%\Financial Statement Generator` didn't exist
- Instead, there was a folder named `first-project`

## Root Cause
The issue occurred because:
1. The installer creates: `%APPDATA%\Financial Statement Generator`
2. But the app was looking in: `%APPDATA%\first-project`

This happened because Electron's `app.getPath('userData')` was using the package.json `name` field ("first-project") instead of the desired application name.

## Solution Applied
We made two key changes:

### 1. Updated package.json
Changed the package name from "first-project" to "financial-statement-generator"
```json
{
  "name": "financial-statement-generator",
  ...
}
```

### 2. Set App Name in Electron
Added `app.setName('Financial Statement Generator')` before app initialization in `electron/main.ts`:
```typescript
// Set the app name to match the product name (used for userData path)
app.setName(APP_NAME); // 'Financial Statement Generator'
app.whenReady().then(() => {
  // ... rest of the code
});
```

## What This Fixes
Now when the application runs:
1. Electron sets the app name to "Financial Statement Generator" early in initialization
2. All calls to `app.getPath('userData')` will return: `%APPDATA%\Financial Statement Generator`
3. This matches exactly where the installer creates the folder
4. The config.env file will be found in the correct location

## How to Verify the Fix

### Option 1: Build New Installer
1. Navigate to `Financials Automation` folder
2. Run: `npm run dist:win`
3. Install the new `.exe` file from `dist-electron` folder
4. The app should now look in the correct AppData folder

### Option 2: Manual Verification (Current Installation)
If you want to test with your current installation:
1. Navigate to: `%APPDATA%\first-project`
2. **Copy** (don't move) the entire folder contents
3. Navigate to: `%APPDATA%\Financial Statement Generator`
4. **Paste** the contents there
5. Run the application again

## Expected Folder Structure
After the fix, the correct folder should be:
```
%APPDATA%\Financial Statement Generator\
├── config.env          (your database configuration)
├── preferences.json    (app preferences)
├── exports\            (exported files)
├── imports\            (imported files)
├── templates\          (templates)
├── backups\            (backups)
└── logs\               (log files)
```

## Migration Instructions
If you already have data in the `first-project` folder:

1. Open File Explorer
2. Navigate to: `%APPDATA%`
3. You should see both:
   - `first-project` (old, with your data)
   - `Financial Statement Generator` (new, correct folder)
4. Copy all files from `first-project` to `Financial Statement Generator`
5. Specifically, make sure to copy:
   - `config.env` (your database configuration)
   - Any files in `exports`, `imports`, `templates`, etc.
6. After verifying everything works, you can safely delete the `first-project` folder

## Next Steps
1. **Rebuild the installer** using `npm run dist:win`
2. **Uninstall the current version** (if installed)
3. **Install the new version** with the fix
4. **Configure the database** as per INSTALLATION_SETUP_GUIDE.md
5. The app should now work correctly!

## Technical Details
This fix ensures that:
- Package name follows npm conventions: `financial-statement-generator` (lowercase, hyphens)
- Display name remains: `Financial Statement Generator` (proper case, spaces)
- Electron userData path: `%APPDATA%\Financial Statement Generator` (matches display name)
- Installer folders: `%APPDATA%\Financial Statement Generator` (consistent!)

---

**Issue Resolution Date:** January 2025  
**Fixed Files:** 
- `Financials Automation/package.json`
- `Financials Automation/electron/main.ts`
- `Financials Automation/electron/main.cjs`
