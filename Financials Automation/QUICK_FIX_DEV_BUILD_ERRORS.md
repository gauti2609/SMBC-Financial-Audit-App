# Quick Fix Guide: Dev and Build Errors

## If you see these errors:

```
✘ [ERROR] Cannot find module 'unenv/node/inspector/promises' from '.'
✘ [ERROR] Cannot find module 'unenv/mock/empty' from '.'
✘ [ERROR] Missing "./node/process" specifier in "unenv" package
```

## Quick Solution (Already Fixed!)

This issue has been resolved by downgrading `vite-plugin-node-polyfills` to v0.17.0.

If you're setting up a new environment:

```bash
# 1. Ensure you have the latest code
git pull

# 2. Install dependencies
pnpm install

# 3. Start development
pnpm run dev
```

## Commands That Should Work

✅ **Development Server**
```bash
pnpm run dev
# Opens on: http://localhost:3000/
```

✅ **Production Build**
```bash
pnpm run build
# Creates optimized build in .output/
```

✅ **Setup Prisma** (if needed)
```bash
pnpm run setup
```

## Troubleshooting

If you still encounter issues:

1. **Clear node_modules and reinstall**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **Ensure .env file exists**
   ```bash
   cp config.env.template .env
   # Edit .env with your database credentials
   ```

3. **Verify Prisma setup**
   ```bash
   pnpm run verify-prisma
   ```

## What Changed?

- `vite-plugin-node-polyfills`: `^0.23.0` → `^0.17.0`
- This version is compatible with the `unenv` dependency
- All functionality remains the same

## For More Details

See `FIX_UNENV_COMPATIBILITY.md` for technical details about the issue and solution.
