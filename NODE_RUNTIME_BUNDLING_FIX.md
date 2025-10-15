# Node.js Runtime Bundling Fix

## Problem

The application was failing to start on Windows machines without Node.js installed, with the error:
```
spawn node ENOENT
```

This occurred because the application tried to spawn a Node.js process using `spawn('node', ...)` at line 167 of `electron/main.ts`, but Node.js was not available on the target system.

## Root Cause

The application architecture requires a backend server (Nitro/Vinxi) to run alongside the Electron frontend. The original implementation assumed Node.js would be installed on every user's machine and available in the system PATH.

**Critical issues:**
1. Node.js was not bundled with the Electron application
2. The application used `spawn('node', ...)` which requires Node.js in PATH
3. No documentation about Node.js being a prerequisite
4. Users installing via the Windows installer had no way to run the application

## Solution Implemented

### 1. Bundle Node.js Runtime with the Application

Created a build script (`scripts/download-node.js`) that:
- Copies the Node.js executable from the build environment
- Places it in `resources/node/` directory
- Gets included in the Electron installer via `extraResources`

### 2. Update Electron Main Process

Modified `electron/main.ts` to intelligently select the Node.js executable:

```typescript
// Determine the Node.js executable to use
let nodeExecutable: string;

if (app.isPackaged) {
  // In production, use bundled Node.js executable
  const bundledNodePath = join(process.resourcesPath, 'node', 
    process.platform === 'win32' ? 'node.exe' : 'node');
  
  if (existsSync(bundledNodePath)) {
    nodeExecutable = bundledNodePath;
    console.log('Using bundled Node.js from:', bundledNodePath);
  } else {
    // Fallback: try to use system node (will fail if not installed)
    console.warn('Bundled Node.js not found at:', bundledNodePath);
    nodeExecutable = 'node';
  }
} else {
  // In development, use system Node.js
  nodeExecutable = process.execPath.includes('node') ? process.execPath : 'node';
}

serverProcess = spawn(nodeExecutable, [serverPath], {
  env: serverEnv,
  stdio: ['ignore', 'pipe', 'pipe'],
  cwd: basePath,
});
```

### 3. Update Build Process

Updated `package.json` scripts to include Node.js bundling:

```json
"bundle-node": "node scripts/download-node.js",
"electron:dist:win": "npm run build && npm run bundle-node && electron-builder --win"
```

### 4. Update Electron Builder Configuration

Added Node.js runtime to `extraResources` in `electron-builder.config.cjs`:

```javascript
extraResources: [
  // ... other resources
  {
    from: 'resources/node',
    to: 'node',
    filter: ['**/*']
  }
]
```

## Files Changed

1. **`electron/main.ts`**
   - Added intelligent Node.js executable detection
   - Uses bundled Node.js in production, system Node.js in development
   - Added fallback logic with helpful error messages

2. **`scripts/download-node.js`** (NEW)
   - Automates bundling of Node.js runtime
   - Copies Node.js executable to `resources/node/`
   - Cross-platform support (Windows, macOS, Linux)

3. **`package.json`**
   - Added `bundle-node` script
   - Integrated into distribution builds (`dist:win`, `dist:mac`, `dist:linux`)

4. **`electron-builder.config.cjs`**
   - Added `resources/node` to `extraResources`
   - Ensures Node.js is packaged with the installer

5. **`.gitignore`**
   - Added `resources/node/` (generated during build)

6. **`BLANK_SCREEN_FIX.md`**
   - Updated documentation to clarify Node.js is bundled

## How It Works

### Development Environment
- Uses system Node.js (installed on developer machines)
- Normal `npm run dev` and `npm run electron:dev` workflows

### Production Build Process
1. Run `npm run build` - builds the application
2. Run `npm run bundle-node` - copies Node.js to `resources/node/`
3. Run `electron-builder` - packages everything into installer
4. Node.js binary is included in `resources/node/` directory

### Production Runtime
1. User installs application via Windows installer
2. Application launches
3. Electron checks for bundled Node.js at `resources/node/node.exe` (Windows)
4. Spawns backend server using bundled Node.js
5. Application works without requiring Node.js installation

## Benefits

✅ **No External Dependencies**: Users don't need to install Node.js separately  
✅ **Self-Contained**: Application includes everything it needs to run  
✅ **Reliable**: No PATH issues or version conflicts  
✅ **Better UX**: Users can install and run immediately  
✅ **Cross-Platform**: Works on Windows, macOS, and Linux  
✅ **Fallback Support**: Still works if Node.js is installed on the system  

## Testing

### Manual Test
1. Build the application:
   ```bash
   cd "Financials Automation"
   npm install
   npm run build
   npm run bundle-node
   npm run build:electron
   npm run electron:dist:win
   ```

2. Check that Node.js was bundled:
   ```bash
   # Verify resources/node/node.exe exists (Windows)
   # or resources/node/node exists (Unix)
   ls -lh resources/node/
   ```

3. Install on a machine **without Node.js installed**
4. Launch the application
5. Verify it starts without "spawn node ENOENT" error

### Expected Behavior
- Application launches successfully
- Backend server starts using bundled Node.js
- No errors related to missing Node.js
- Full application functionality works

## Distribution

When distributing the application:

1. **Windows Installer**: `Financial Statement Generator-Setup-1.0.0.exe`
   - Includes Node.js runtime (~90MB for Windows x64)
   - Self-contained, no prerequisites needed

2. **System Requirements**: 
   - Windows 10/11 (64-bit recommended)
   - ~150MB disk space
   - PostgreSQL (for database)

3. **No Node.js Required**: Users do NOT need to install Node.js

## Troubleshooting

### If "Bundled Node.js not found" Warning Appears

This means the Node.js binary wasn't included in the build. To fix:

1. Ensure `npm run bundle-node` was executed before building
2. Check that `resources/node/node.exe` (Windows) exists
3. Verify `electron-builder.config.cjs` includes the `resources/node` in `extraResources`
4. Rebuild: `npm run dist:win`

### If Server Still Fails to Start

1. Check application logs (Console in DevTools)
2. Verify server file exists at `.output/server/index.mjs`
3. Check database connection (DATABASE_URL environment variable)
4. Review error messages for specific issues

## Future Improvements

1. **Automatic Version Matching**: Bundle Node.js version matching the build environment
2. **Download from Official Source**: Instead of copying, download specific Node.js version
3. **Smaller Bundle Size**: Use Node.js without npm (smaller runtime)
4. **Electron Utility Process**: Migrate to Electron 28+ utility processes (if supported)

## References

- [Electron Documentation: Process](https://www.electronjs.org/docs/latest/api/process)
- [Electron Builder: extraResources](https://www.electron.build/configuration/contents#extraresources)
- [Node.js Downloads](https://nodejs.org/en/download/)
