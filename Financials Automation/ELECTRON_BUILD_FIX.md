# Electron Build Fix - ES Module/CommonJS Compatibility

## Problem
The application was experiencing this error when running the packaged Electron app:

```
Error [ERR_REQUIRE_ESM]: require() of ES Module C:\Program Files\Financial Statement Generator\resources\app.asar\electron\main.js not supported.
main.js is treated as an ES module file as it is a .js file whose nearest parent package.json contains "type": "module"
```

## Root Cause
- The `package.json` has `"type": "module"` which tells Node.js to treat all `.js` files as ES modules
- The Electron main process files (`main.js` and `preload.js`) were compiled from TypeScript to CommonJS format (using `require()` and `exports`)
- Electron tried to load these CommonJS files, but Node.js expected them to be ES modules due to the package.json setting
- This created a module system conflict

## Solution
The fix involves using `.cjs` file extensions for the compiled Electron files, which explicitly tells Node.js that these files are CommonJS modules regardless of the package.json `"type"` setting.

### Changes Made

1. **Updated `build:electron` script in package.json**:
   - Added commands to rename compiled `.js` files to `.cjs` after TypeScript compilation
   - Added `--types node` flag to ensure proper Node.js types during compilation

2. **Updated package.json `main` field**:
   - Changed from `"main": "electron/main.js"` to `"main": "electron/main.cjs"`

3. **Updated electron-builder.config.cjs**:
   - Changed file references from `.js` to `.cjs` extensions
   - Updated the build extends reference in package.json to use `.cjs` extension

4. **Updated electron/main.ts**:
   - Changed preload reference from `preload.js` to `preload.cjs`

## Benefits
- ✅ Keeps `"type": "module"` in package.json (needed for the web application)
- ✅ Allows Electron main process to use CommonJS (standard for Electron)
- ✅ No need to change the overall module system of the project
- ✅ Clean separation between ES modules (web app) and CommonJS (Electron process)

## Building the Application

To build the Electron application:

```bash
# Build the Electron files
npm run build:electron

# Build the web application
npm run build

# Package for Windows
npm run electron:dist:win

# Package for macOS
npm run electron:dist:mac

# Package for Linux
npm run electron:dist:linux
```

## Technical Details

The `.cjs` extension is a standard way to indicate CommonJS modules in a package that has `"type": "module"`. Similarly, `.mjs` would indicate ES modules in a package with `"type": "commonjs"`. This explicit file extension approach is recommended by Node.js for mixed module systems.
