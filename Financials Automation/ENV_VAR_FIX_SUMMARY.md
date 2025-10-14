# Environment Variable Configuration Fix

## Problem

The Windows installer was failing with "Server file not found" error even when users:
- Rebuilt the installer after PR #37
- Set system environment variables via PowerShell
- Created the PostgreSQL database
- Followed all documented setup steps

## Root Cause

The Electron application in production mode was **not loading environment variables** from configuration files. It only read from `process.env`, which meant:

1. **System environment variables** needed a computer restart to take effect (many users missed this step)
2. **No fallback mechanism** - if the environment variable wasn't set, the app would fail with a misleading "Server file not found" error
3. **No config file support** - users couldn't simply create a `config.env` file like they could in development

## Solution Implemented

### 1. Environment Variable Loading Function

Added `loadEnvironmentVariables()` function in `electron/main.ts` that:
- Loads environment variables from multiple locations (in priority order):
  1. System environment variables (highest priority)
  2. `%APPDATA%\Financial Statement Generator\config.env` (user-specific)
  3. `resources\config.env` (installation-wide)
  4. `resources\.env` (bundled with installer)
- Properly parses `.env` file format (key=value pairs)
- Skips comments and empty lines
- Only overwrites if variable isn't already set (system env vars take precedence)
- Logs all attempted paths and successful loads for debugging

### 2. Better Error Messages

Updated the `startServer()` function to:
- Check if `DATABASE_URL` is configured before starting the server
- Show a clear, actionable error message with:
  - Exact location where to create `config.env`
  - Required format for the DATABASE_URL
  - Three different configuration methods
  - References to documentation

### 3. Installer Improvements

Updated `installer.nsh` to:
- Create the AppData directory during installation
- Show a message box after installation with critical setup steps
- Create a desktop shortcut to the setup instructions
- Reference the bundled documentation

### 4. Bundled Documentation

Updated `electron-builder.config.cjs` to include:
- `config.env.template` - Template file users can copy
- `INSTALLATION_SETUP_GUIDE.md` - Comprehensive step-by-step guide
- Existing guides (QUICK_START.md, POSTGRESQL_SETUP_GUIDE.md)

### 5. Comprehensive Setup Guide

Created `INSTALLATION_SETUP_GUIDE.md` with:
- Step-by-step PostgreSQL installation
- Three methods to configure DATABASE_URL (file-based recommended)
- Detailed troubleshooting section
- Examples and screenshots
- Checklist for users to verify setup

## Configuration Methods

Users now have **three ways** to configure the database connection:

### Method A: config.env File (RECOMMENDED - Easiest)

1. Create file: `%APPDATA%\Financial Statement Generator\config.env`
2. Add line: `DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/financialsdb`
3. Save and launch the app

**Advantages:**
- No admin privileges required
- No computer restart needed
- Easy to edit and verify
- Works immediately

### Method B: Use Template

1. Copy `config.env.template` from installation folder
2. Rename to `config.env` and place in AppData folder
3. Edit with your password
4. Save and launch

### Method C: System Environment Variable (Advanced)

1. Open PowerShell as Admin
2. Run: `[System.Environment]::SetEnvironmentVariable('DATABASE_URL', 'postgresql://...', 'User')`
3. **Restart computer** (required!)
4. Launch the app

## Files Changed

### Core Changes
- `electron/main.ts` - Added environment loading and better error handling
- `electron/main.cjs` - Compiled version of main.ts
- `electron-builder.config.cjs` - Added config template and setup guide to installer

### Installer Changes
- `installer.nsh` - Added post-install instructions and desktop shortcut

### Documentation
- `INSTALLATION_SETUP_GUIDE.md` - New comprehensive setup guide (6KB)

### Dependencies
- `package.json` - Added @types/node for TypeScript compilation

## Testing Checklist

To test this fix:

1. **Build the installer:**
   ```bash
   cd "Financials Automation"
   pnpm install
   pnpm run build
   pnpm run build:electron
   pnpm run electron:dist:win
   ```

2. **Uninstall any existing version**

3. **Install the new version:**
   - Run the .exe from `dist-electron/`
   - Note the post-install message box
   - Check that desktop shortcut "Setup Instructions" was created

4. **Follow setup without system environment variable:**
   - Create `%APPDATA%\Financial Statement Generator\config.env`
   - Add `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb`
   - Launch the application immediately (no restart needed)
   - Should see login screen (not error)

5. **Verify error messages:**
   - Delete the `config.env` file
   - Launch the app
   - Should see clear error about DATABASE_URL with instructions

6. **Check documentation:**
   - Open `Setup Instructions` shortcut from desktop
   - Verify it opens the INSTALLATION_SETUP_GUIDE.md
   - Check all referenced files exist in `resources` folder

## Expected Behavior After Fix

### Successful Launch
- User creates config.env file
- App loads environment from file
- Backend server starts successfully
- Frontend connects to localhost:3000
- Login screen displays
- No errors

### Missing Configuration
- User hasn't created config.env
- App shows clear error dialog:
  - "DATABASE_URL environment variable is not configured"
  - Lists all three configuration methods
  - Shows exact file paths
  - References documentation
- User follows instructions
- Creates config.env
- Relaunches app successfully

### After Installation
- Message box shows critical setup steps
- Desktop shortcut created for setup instructions
- User can open and read comprehensive guide
- Template file available in installation folder

## Benefits

1. **No more misleading "Server file not found" errors** - The actual issue (missing DATABASE_URL) is now clear
2. **No computer restart required** - Config file method works immediately
3. **Multiple configuration options** - Users can choose what works best for them
4. **Better discoverability** - Post-install message and desktop shortcut guide users
5. **Self-service troubleshooting** - Comprehensive guide answers common questions
6. **Production-ready** - Same .env file approach that works in development

## Rollout Plan

1. Merge this PR
2. Create a new release tag (e.g., v1.0.1)
3. Trigger GitHub Actions workflow to build installer
4. Download and test the installer on clean Windows machine
5. If successful, publish release with:
   - Updated installer
   - Release notes highlighting the config.env file method
   - Link to INSTALLATION_SETUP_GUIDE.md

## Support Impact

This fix should significantly reduce support requests because:
- Error messages now tell users exactly what to do
- Configuration is straightforward (create one file)
- No admin privileges or restarts required
- Comprehensive documentation included
- Post-install message prevents users from missing setup steps

## Breaking Changes

None. This is fully backward compatible:
- Still supports system environment variables
- Adds new config file support
- Existing installations will continue to work
