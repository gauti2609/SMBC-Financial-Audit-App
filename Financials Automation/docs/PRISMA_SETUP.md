# Prisma Setup and Configuration

This document explains the Prisma setup in this project and the specific configurations required to make Prisma work with Vinxi/Nitro bundling.

## Overview

Prisma is used as the ORM for database operations in this application. However, Prisma has specific requirements that conflict with modern bundlers like Rollup/Vite, which are used by Vinxi.

## The Problem

Prisma generates internal modules (like `.prisma/client` and `.prisma`) that are not meant to be bundled. When bundlers try to process these modules, they fail because:

1. These modules contain binary engines and native dependencies
2. They use dynamic imports and runtime code generation
3. They expect to be loaded from the filesystem, not bundled

The error typically looks like:
```
Invalid module ".prisma" is not a valid package name imported from @prisma/client/default.js
```

## The Solution

We've implemented a comprehensive externalization strategy across multiple configuration files:

### 1. App Configuration (`app.config.ts`)

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

### 2. Vinxi Configuration (`vinxi.config.ts`)

Additional bundling rules that complement the main configuration:
- Comprehensive external dependencies list
- SSR-specific externalization
- Optimization exclusions

### 3. Build Process (`package.json`)

Updated scripts ensure proper setup:
- `postinstall`: Generates Prisma client after dependency installation
- `verify-prisma`: Validates Prisma setup before builds
- `prebuild`: Runs verification before any build process

### 4. Verification Script (`scripts/verify-prisma`)

Automated checks for:
- Prisma schema existence and validity
- Environment variable configuration
- Prisma client generation
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
| `app.config.ts` | Main Vinxi configuration with Prisma externalization |
| `vinxi.config.ts` | Additional bundling rules for Prisma |
| `scripts/verify-prisma` | Automated Prisma setup verification |
| `prisma/client.ts` | Centralized Prisma client exports |

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
