# Fix for Unenv Compatibility Issue

## Problem Summary

When running `pnpm run dev` or `pnpm run build`, the application encountered errors:

```
✘ [ERROR] Cannot find module 'unenv/node/inspector/promises' from '.'
✘ [ERROR] Cannot find module 'unenv/mock/empty' from '.'
✘ [ERROR] Missing "./node/process" specifier in "unenv" package
```

## Root Cause

The issue was caused by an incompatibility between `vite-plugin-node-polyfills` v0.23.0 and `unenv` v1.10.0:

1. **vite-plugin-node-polyfills v0.23.0** was hardcoded to use import paths like:
   - `unenv/node/inspector/promises`
   - `unenv/node/process`
   - `unenv/mock/empty`

2. **unenv v1.10.0** changed its export structure:
   - Old paths: `unenv/node/*`, `unenv/mock/*`
   - New paths: `unenv/runtime/node/*`, `unenv/runtime/mock/*`

3. The plugin's hardcoded paths no longer matched the actual exports in the unenv package, causing module resolution failures.

## Solution

Downgraded `vite-plugin-node-polyfills` from version `^0.23.0` to `^0.17.0`, which is compatible with the unenv version being used.

### Changes Made

**File: `package.json`**
```diff
- "vite-plugin-node-polyfills": "^0.23.0",
+ "vite-plugin-node-polyfills": "^0.17.0",
```

### Installation Steps

```bash
# Update package.json as shown above, then run:
pnpm install --no-frozen-lockfile

# Verify the fix
pnpm run dev    # Should start successfully
pnpm run build  # Should complete without errors
```

## Verification Results

✅ **pnpm run dev** - Development server starts successfully on http://localhost:3000/  
✅ **pnpm run build** - Build completes successfully with all routers compiled

## Notes

- A peer dependency warning appears: `vite-plugin-node-polyfills@0.17.0` expects vite versions 2-5, but vite 6.3.6 is installed
- Despite this warning, the plugin functions correctly with vite 6
- This is a known working solution recommended by the community for this specific compatibility issue

## Alternative Solutions Considered

1. **Upgrading vite-plugin-node-polyfills** - Newer versions still have the same issue
2. **Downgrading unenv** - Would require extensive dependency changes
3. **Removing nodePolyfills()** - Could break browser-side Node.js API usage
4. **Manual polyfills** - More maintenance burden

The downgrade approach (solution implemented) was chosen as the most straightforward and maintainable fix.

## Future Considerations

Monitor for updates to `vite-plugin-node-polyfills` that add compatibility with unenv v1.10.0+ or consider migrating to an alternative polyfill solution if/when:
- vite-plugin-node-polyfills releases a version compatible with both vite 6 and unenv v1.10.0+
- The unenv dependency chain causes other compatibility issues
- Performance improvements are needed in the polyfill layer

## References

- GitHub Issue: https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues
- Community Solution: Downgrading to v0.17.0 resolves the unenv/node/* path issues
- Date Fixed: October 10, 2025
