# Scripts Directory

This directory contains build and diagnostic scripts for the Financial Statement Generator.

## Scripts

### Build Scripts

#### `download-node.js`
**Purpose**: Bundles Node.js runtime with the application  
**When**: Automatically runs during `npm run dist:win`  
**Manual**: `npm run bundle-node`

Copies the current Node.js executable to `resources/node/` so it can be packaged with the Electron installer. This fixes the "spawn node ENOENT" error on machines without Node.js.

### Diagnostic Scripts

#### `diagnose.mjs`
**Purpose**: Comprehensive diagnostic check for build environment and configuration  
**Run**: `npm run diagnose`

Checks:
- ✅ Build environment (Node.js, npm installed)
- ✅ Dependencies installed
- ✅ Bundling configuration
- ✅ Code changes applied correctly
- ✅ Build artifacts exist

Use this first when troubleshooting issues.

#### `test-bundling.mjs`
**Purpose**: Detailed verification of Node.js bundling configuration  
**Run**: `npm run test-bundling`

Tests:
- ✅ Node.js was bundled correctly
- ✅ Paths resolve correctly
- ✅ electron-builder config is correct
- ✅ Build scripts are configured
- ✅ TypeScript code has bundling logic
- ✅ Compiled JavaScript has bundling logic

Use this to verify the bundling fix is properly configured.

### Other Scripts

#### `setup-prisma-symlink.js`
**Purpose**: Sets up symbolic link for Prisma client  
**When**: Automatically runs during `npm install`

#### `verify-prisma.js`
**Purpose**: Verifies Prisma client is correctly installed  
**When**: Automatically runs before build

## Usage

### Quick Diagnostics
```bash
# Check if everything is configured correctly
npm run diagnose

# Detailed bundling verification
npm run test-bundling
```

### Build Process
```bash
# Bundle Node.js (usually automatic)
npm run bundle-node

# Full Windows build (includes bundling)
npm run dist:win
```

## Troubleshooting

If you encounter issues:

1. **First**: Run `npm run diagnose` to identify problems
2. **Then**: Follow the fix suggestions in the output
3. **Finally**: Run `npm run test-bundling` to verify

For detailed help, see:
- `STEP_BY_STEP_BUILD_GUIDE.md` (root directory)
- `NODE_BUNDLING_README.md` (this directory)
