# Prisma Setup and Configuration

This document explains the Prisma setup in this project and the specific configurations required to make Prisma work with Vinxi/Nitro bundling.

## Overview

Prisma is used as the ORM for database operations in this application. Prisma generates client code in `node_modules/.prisma/client` that should not be bundled by modern bundlers like Rollup/Vite.

## The Problem

Prisma generates internal modules (like `.prisma/client` and `.prisma`) that are not meant to be bundled. When bundlers try to process these modules, they fail because:

1. These modules contain binary engines and native dependencies
2. They use dynamic imports and runtime code generation
3. They expect to be loaded from the filesystem, not bundled

Common errors include:
```
Invalid module ".prisma" is not a valid package name imported from @prisma/client/default.js
```

Or during installation:
```
ENOENT: no such file or directory, open 'node_modules/@prisma/client/runtime/wasm-engine-edge.js'
```

## The Solution

We use the **standard Prisma client location** (`node_modules/.prisma/client`) and implement externalization patterns across configuration files to prevent bundling issues.

### 1. Prisma Schema (`prisma/schema.prisma`)

The Prisma schema uses the **default output location**:
```prisma
generator client {
  provider = "prisma-client-js"
  // No custom output path - uses default node_modules/.prisma/client
}
```

### 2. App Configuration (`app.config.ts`)

The main Vinxi configuration externalizes Prisma modules in three contexts:
- Main server nitro configuration
- tRPC router configuration  
- Debug router configuration

Key externalization patterns:
```javascript
external: [
  "@prisma/client", 
  ".prisma/client", 
  ".prisma",
  "@prisma/engines",
  "@prisma/engines-version",
  /^\.prisma\//,
  /^@prisma\//,
]
```

### 3. Vinxi Configuration (`vinxi.config.ts`)

Additional bundling rules that complement the main configuration:
- Comprehensive external dependencies list
- SSR-specific externalization
- Optimization exclusions

### 4. Build Process (`package.json`)

Updated scripts ensure proper setup:
- `postinstall`: Generates Prisma client after dependency installation
- `verify-prisma`: Validates Prisma setup before builds
- `prebuild`: Runs verification before any build process

### 5. Verification Script (`scripts/verify-prisma`)

Automated checks for:
- Prisma schema existence and validity
- Environment variable configuration
- Prisma client generation in default location (`node_modules/.prisma/client`)
- Import capability testing

## Usage

### Development
```bash
npm install          # Automatically generates Prisma client
npm run dev         # Starts development server
```

### Production Build
```bash
npm run build       # Automatically verifies Prisma setup first
```

### Manual Verification
```bash
npm run verify-prisma  # Check Prisma setup manually
```

## Troubleshooting

### Error: "ENOENT: wasm-engine-edge.js" during installation
This error occurs when `prisma generate` runs before `@prisma/client` is fully extracted. The fix is to:
- Use the default Prisma output location (not a custom path)
- Ensure `prisma/schema.prisma` has no `output` option in the generator block
- Run `pnpm install` or `npm install` from a clean state

### Error: "Invalid module .prisma"
- Ensure all externalization patterns are present in `app.config.ts`
- Run `npm run verify-prisma` to check setup
- Clear `node_modules` and reinstall if needed

### Error: "Cannot find module @prisma/client"
- Run `npx prisma generate` manually
- Check that `DATABASE_URL` is set in `.env`
- Verify `prisma/schema.prisma` exists and is valid

### Build Fails with Prisma Errors
- Check that `prebuild` script is running successfully
- Ensure all external patterns include Prisma modules
- Verify that no Prisma imports are being processed by the bundler

## Configuration Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Prisma schema with default client output location |
| `app.config.ts` | Main Vinxi configuration with Prisma externalization |
| `vinxi.config.ts` | Additional bundling rules for Prisma |
| `scripts/verify-prisma` | Automated Prisma setup verification |
| `prisma/client.ts` | Centralized Prisma client re-exports |

## Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)

## Best Practices

1. Always run verification script before debugging bundling issues
2. Don't import Prisma client in client-side code
3. Use the centralized `prisma/client.ts` for type exports
4. Keep all Prisma-related code in `src/server/` directory
5. Update externalization patterns when adding new Prisma-related dependencies
