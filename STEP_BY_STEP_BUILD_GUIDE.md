# Step-by-Step Build and Test Guide

## Purpose
This guide will walk you through building the Financial Statement Generator Windows installer with bundled Node.js, step by step, with verification at each stage.

---

## Prerequisites

Before starting, ensure you have:
- ✅ Windows 10/11 OR a build environment with Node.js 20+
- ✅ Git installed
- ✅ PostgreSQL installed (for runtime testing)

---

## Step 1: Clean Environment

Start with a clean slate:

```bash
cd "Financials Automation"

# Remove any existing build artifacts
rm -rf dist-electron/
rm -rf node_modules/
rm -rf .output/
rm -rf resources/node/

# Clean install
npm install
```

**Verify**: Run `npm list electron` and confirm Electron is installed.

---

## Step 2: Build the Application

Build the frontend and backend:

```bash
npm run build
```

**Expected Output**:
- ✅ `.output/public/` directory created with frontend files
- ⚠️ May show Prisma build errors - this is a known issue that doesn't affect packaged apps

**Verify**: Check that `.output/public/` exists:
```bash
ls -la .output/public/
```

---

## Step 3: Bundle Node.js Runtime

This is the KEY step that fixes the "spawn node ENOENT" error:

```bash
npm run bundle-node
```

**Expected Output**:
```
✅ Created directory: .../resources/node
📦 Bundling Node.js runtime for Electron app...
   Version: v20.x.x
   Platform: win32 (or linux/darwin)
   Architecture: x64
   Source: /path/to/node.exe
   Output: .../resources/node

✅ Copied node.exe to resources/node/

🎉 Node.js runtime bundled successfully!
```

**Verify**: Check the bundled Node.js exists and is the right size:
```bash
# Windows
dir resources\node\node.exe

# Linux/Mac
ls -lh resources/node/node
# Should show ~90MB file
```

---

## Step 4: Compile Electron Scripts

Compile the TypeScript Electron main and preload scripts to JavaScript:

```bash
npm run build:electron
```

**Expected Output**:
- ✅ `electron/main.cjs` created/updated
- ✅ `electron/preload.cjs` created/updated

**Verify**: Check that the compiled file includes Node.js detection logic:
```bash
# Windows
findstr "bundledNodePath" electron\main.cjs

# Linux/Mac
grep "bundledNodePath" electron/main.cjs
```

Should show lines with `bundledNodePath` variable.

---

## Step 5: Run the Test Script

Verify everything is configured correctly before building:

```bash
node scripts/test-bundling.mjs
```

**Expected Output**: All tests should show ✅

If any test shows ❌, review the specific test and fix the issue before proceeding.

---

## Step 6: Create Windows Installer

Build the Windows installer with electron-builder:

```bash
npm run dist:win
```

**What This Does**:
1. Runs `npm run build` (builds frontend/backend)
2. Runs `npm run bundle-node` (bundles Node.js)
3. Runs `electron-builder --win` (packages everything)

**Expected Output**:
```
• electron-builder version=24.x.x
• loaded configuration file=electron-builder.config.cjs
• building target=nsis arch=x64
• packaging...
• building block map...
• writing effective config...
```

**Duration**: 5-15 minutes depending on system

**Verify**: Check that the installer was created:
```bash
ls -lh dist-electron/*.exe
```

Should show `Financial Statement Generator-Setup-1.0.0.exe` (approx 200-300MB)

---

## Step 7: Test the Installer (Critical!)

### Option A: Test on Clean Windows VM (Recommended)

1. **Create or use a Windows 10/11 virtual machine WITHOUT Node.js**
2. **Copy the installer**: Transfer `dist-electron/Financial Statement Generator-Setup-1.0.0.exe` to the VM
3. **Install**: Run the installer
4. **Launch**: Open the application
5. **Check for errors**: 
   - ✅ Should NOT see "spawn node ENOENT"
   - ✅ Application should start
   - ✅ Login screen should appear

### Option B: Test Locally (Less Reliable)

If you can't use a VM:

1. **Open the installer location**:
   ```bash
   cd dist-electron/win-unpacked/resources/
   ```

2. **Verify bundled Node.js is included**:
   ```bash
   # Check if node/ folder exists
   ls -la node/
   
   # Should show node.exe (~90MB on Windows)
   ```

3. **Check logs** (if application starts):
   - Open DevTools in the app
   - Look for: `"Using bundled Node.js from: ..." in Console

---

## Step 8: Verify Success

After installation and launch, open the application's DevTools (if available) or check logs.

**Look for these log messages**:

✅ **SUCCESS**:
```
Using bundled Node.js from: C:\...\resources\node\node.exe
Starting server from: C:\...\resources\.output\server\index.mjs
[Server]: Listening on http://localhost:3000
```

❌ **FAILURE**:
```
Bundled Node.js not found at: ...
spawn node ENOENT
```

---

## Troubleshooting

### Issue: "bundled Node.js not found"

**Cause**: Step 3 (bundle-node) was skipped or failed.

**Fix**:
1. Run `npm run bundle-node`
2. Verify `resources/node/node.exe` exists
3. Rebuild: `npm run dist:win`

### Issue: "spawn node ENOENT" still appears

**Possible Causes**:
1. **Old installer**: You're testing an installer built BEFORE the fix
   - **Fix**: Delete old installer, run `npm run dist:win` again
   
2. **Node.js not bundled**: The bundle-node step didn't run
   - **Fix**: Run `npm run bundle-node` manually, then `npm run dist:win`
   
3. **Path issue**: The bundled Node.js is in the wrong location
   - **Fix**: Check electron-builder.config.cjs has:
     ```javascript
     extraResources: [
       {
         from: 'resources/node',
         to: 'node',
         filter: ['**/*']
       }
     ]
     ```

### Issue: Build fails with Prisma errors

**This is NORMAL and expected** - see BLANK_SCREEN_FIX.md line 115.

The Prisma error during `npm run build` is a known ESM/CommonJS compatibility issue that:
- ❌ Affects direct server testing in development
- ✅ Does NOT affect the packaged application
- ✅ Does NOT prevent the installer from working

**Fix**: Ignore the error and proceed with `npm run dist:win`

---

## Quick Reference: Complete Build Command

For a clean build from scratch:

```bash
# Windows PowerShell
cd "Financials Automation"
Remove-Item -Recurse -Force dist-electron, node_modules, .output, resources/node -ErrorAction SilentlyContinue
npm install
npm run dist:win

# Linux/Mac Bash
cd "Financials Automation"
rm -rf dist-electron/ node_modules/ .output/ resources/node/
npm install
npm run dist:win
```

This runs all steps automatically in the correct order.

---

## Verification Checklist

Before distributing the installer, verify:

- [ ] `npm run bundle-node` completed successfully
- [ ] `resources/node/node.exe` exists (~90MB on Windows)
- [ ] `npm run build:electron` compiled without errors
- [ ] `npm run dist:win` completed without errors
- [ ] Installer .exe file was created in `dist-electron/`
- [ ] Tested installer on a machine WITHOUT Node.js
- [ ] Application starts without "spawn node ENOENT" error
- [ ] Backend server starts (check logs for "Listening on...")
- [ ] Login screen appears

---

## Summary

The key to fixing the "spawn node ENOENT" error is ensuring:

1. ✅ Node.js is bundled during build (`npm run bundle-node`)
2. ✅ The bundled Node.js is included in the installer (electron-builder config)
3. ✅ The application uses the bundled Node.js (electron/main.ts logic)
4. ✅ You test with a NEWLY built installer, not an old one

If all steps are followed and all verifications pass, the installer will work on Windows machines without Node.js installed.

---

**Last Updated**: October 15, 2024
**For Issues**: Review the Troubleshooting section or check application logs
