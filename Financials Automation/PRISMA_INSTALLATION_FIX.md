# Prisma Installation Error Fix

## Problem Statement
When running `pnpm install`, the installation fails with the following error:

```
Error:
ENOENT: no such file or directory, open 'C:\...\node_modules\@prisma\client\runtime\wasm-engine-edge.js'

 ELIFECYCLE  Command failed with exit code 1.
```

This error occurs during the `postinstall` script when `prisma generate` is executed.

## Root Cause
The issue was caused by using a **custom Prisma output location** (`output = "../src/generated/prisma"` in `prisma/schema.prisma`). This created a race condition where:

1. `pnpm install` downloads and extracts packages
2. The `postinstall` script runs `prisma generate` 
3. `prisma generate` tries to read files from `node_modules/@prisma/client/runtime/`
4. However, the `@prisma/client` package hasn't been fully extracted yet
5. The missing `wasm-engine-edge.js` file causes the error

## Solution Applied
We removed the custom output path and now use Prisma's **default location** (`node_modules/.prisma/client`), which is the recommended approach. This allows Prisma to generate the client in a predictable location that doesn't interfere with package installation.

### Changes Made:

1. **prisma/schema.prisma** - Removed custom output path:
   ```diff
   generator client {
     provider = "prisma-client-js"
   - output   = "../src/generated/prisma"
   }
   ```

2. **Import statements** - Updated all imports to use standard `@prisma/client`:
   - `src/server/db.ts`
   - `prisma/client.ts`

3. **Configuration files** - Removed custom path references:
   - `app.config.ts` - Removed `~/generated/prisma`, `./src/generated/prisma`, etc.
   - `vinxi.config.ts` - Removed custom path references
   - `scripts/verify-prisma` - Updated to check default location

## How to Apply This Fix

If you're experiencing this error:

1. **Pull the latest changes** from this branch
2. **Clean install**:
   ```bash
   # Remove existing dependencies
   rm -rf node_modules pnpm-lock.yaml
   
   # Fresh install
   pnpm install
   ```

3. The installation should now complete successfully!

## Verification

After installation, verify the setup:
```bash
pnpm run verify-prisma
```

This will check that:
- ✅ Prisma schema is valid
- ✅ DATABASE_URL is configured
- ✅ Prisma client is generated in the correct location
- ✅ Prisma client files exist

## Benefits of This Fix

1. **Eliminates race condition** - Prisma generates in its standard location without timing issues
2. **Follows best practices** - Uses Prisma's recommended default output location
3. **Simpler configuration** - No need to maintain custom path mappings
4. **More reliable** - Works consistently across different environments and package managers

## Additional Resources

- See `docs/PRISMA_SETUP.md` for detailed Prisma configuration documentation
- See `BUILD_FIXES_SUMMARY.md` for other fixes applied to the project

## Notes

- The `.env` file is required for Prisma to work (contains `DATABASE_URL`)
- Use `config.env.template` as a reference to create your `.env` file
- The Prisma client is now imported as `import { PrismaClient } from "@prisma/client"`
