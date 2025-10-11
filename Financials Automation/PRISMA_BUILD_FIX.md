# Prisma Build Error Fix - Module Resolution

## Problem Statement

When running `npm run build` or `pnpm run build`, the build process fails during the Nitro server compilation phase with the following error:

```
[vinxi XX:XX:XX XX]  ERROR  TypeError [ERR_INVALID_MODULE_SPECIFIER]: Invalid module ".prisma" is not a valid package name imported from C:\...\node_modules\@prisma\client\default.js
```

This error also appears with a deprecation warning:
```
(node:XXXXX) [DEP0155] DeprecationWarning: Use of deprecated trailing slash pattern mapping "./" in the "exports" field module resolution of the package at ...\node_modules\@prisma\client\package.json
```

## Root Cause

The issue occurs during the Nitro/Rollup bundling phase when the build tool tries to resolve module imports from Prisma Client. Specifically:

1. The `@prisma/client/default.js` file contains: `require('.prisma/client/default')`
2. Rollup/Nitro's module resolver interprets `.prisma` as a package name (like `@prisma`) instead of a relative path
3. This causes the "Invalid module" error because `.prisma` is not a valid npm package name
4. The issue is exacerbated by Node.js's deprecation of trailing slash patterns in package.json exports

## Solution

The fix involves adding comprehensive externalization patterns to both `app.config.ts` and `vinxi.config.ts` to ensure that:

1. All Prisma-related modules are properly externalized (not bundled)
2. Module resolution correctly handles `.prisma` paths
3. Resolver aliases are configured to help with path resolution

### Changes Made

#### 1. app.config.ts - Nitro Configuration

Added comprehensive externalization patterns in the `server.nitro` configuration:

```typescript
nitro: {
  rollupConfig: {
    external: [
      "@prisma/client", 
      ".prisma/client", 
      ".prisma",
      "@prisma/engines",
      "@prisma/engines-version",
      // NEW: Regex pattern to catch all .prisma paths
      /^\.prisma\/.*/,
      // NEW: Explicit patterns for common imports
      ".prisma/client/default",
      ".prisma/client/index",
    ],
    resolve: {
      preferBuiltins: true,
      // NEW: Alias to help resolve .prisma paths correctly
      alias: {
        '.prisma/client': '@prisma/client/.prisma/client',
      },
    },
  },
  // NEW: Nitro-level alias configuration
  alias: {
    '.prisma/client': '@prisma/client/.prisma/client',
  },
  // NEW: Disable module tracing for externals
  externals: {
    traceInclude: [],
    trace: false,
  },
}
```

#### 2. vinxi.config.ts - Build Configuration

Added matching patterns in the build configuration:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        '@prisma/client',
        '.prisma/client',
        '.prisma',
        '@prisma/engines',
        '@prisma/engines-version',
        /^\.prisma\//,
        /^@prisma\//,
        // NEW: Additional comprehensive patterns
        /^\.prisma\/.*/,
        '.prisma/client/default',
        '.prisma/client/index',
      ],
      output: {
        // NEW: Prevent unwanted chunking
        manualChunks: undefined,
      },
    },
  },
})
```

## How This Fix Works

1. **Comprehensive External Patterns**: By adding the regex pattern `/^\.prisma\/.*/`, we tell Rollup to treat ALL paths starting with `.prisma/` as external modules that should not be bundled.

2. **Explicit Path Patterns**: Adding `.prisma/client/default` and `.prisma/client/index` as explicit external patterns ensures these specific imports are always externalized.

3. **Resolver Alias**: The alias `'.prisma/client': '@prisma/client/.prisma/client'` helps the module resolver correctly map `.prisma/client` imports to the actual location in `node_modules/@prisma/client/.prisma/client`.

4. **Manual Chunks Control**: Setting `manualChunks: undefined` prevents Rollup from trying to create separate chunks for Prisma modules, which could cause resolution issues.

5. **Trace Disable**: Disabling module tracing for externals prevents Nitro from attempting to analyze and bundle Prisma's internal dependencies.

## Verification

After applying this fix, you can verify it's working by:

1. **Clean Build**:
   ```bash
   npm run build
   ```
   The build should complete without the "Invalid module .prisma" error.

2. **Check Externalization**:
   ```bash
   ls -la .output/server/node_modules/@prisma/client
   ```
   You should see the Prisma client properly externalized in the output directory.

3. **No Deprecation Warnings**: The DEP0155 deprecation warning should not cause the build to fail.

## Why This Happens

This is a known compatibility issue between:
- Prisma's package structure (which uses `.prisma/client` as a path)
- Modern bundlers like Rollup/Vite (which have strict module resolution rules)
- Node.js module resolution changes (deprecating certain export patterns)

The issue is particularly common when:
- Using Prisma 6.x with Vinxi/Nitro
- Building for production (the dev server may work fine)
- Using Windows (path resolution differences)

## Alternative Solutions (Not Recommended)

Other potential solutions that were considered but not implemented:

1. **Custom Output Path**: Setting a custom output path in Prisma schema (e.g., `output = "./generated/client"`)
   - **Issue**: Can cause race conditions during installation
   - **Issue**: Requires updating all import paths throughout the codebase

2. **Modifying Prisma Client Files**: Manually editing `@prisma/client/default.js`
   - **Issue**: Changes are lost when reinstalling dependencies
   - **Issue**: Not maintainable

3. **Downgrading Prisma**: Using an older version of Prisma
   - **Issue**: Loses access to new features and bug fixes
   - **Issue**: May have security implications

## Related Issues

- Prisma Issue: Module resolution in bundlers
- Vinxi/Nitro: External module configuration
- Node.js DEP0155: Trailing slash deprecation

## Additional Resources

- [Prisma Bundling Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/caveats-when-deploying-to-aws-platforms#aws-lambda)
- [Vite SSR Externals](https://vitejs.dev/guide/ssr.html#ssr-externals)
- [Nitro Configuration](https://nitro.unjs.io/config)

---

**Last Updated**: 2025-10-11  
**Status**: ✅ RESOLVED  
**Affected Versions**: Prisma 6.8.2, Vinxi 0.5.3, Vite 6.x
