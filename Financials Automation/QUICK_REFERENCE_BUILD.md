# Quick Reference - Build & Development

## ✅ Current Status
Both `pnpm run dev` and `pnpm run build` are **working correctly**.

## 🚀 Quick Start

```bash
# First time setup
pnpm install
cp config.env.template .env
pnpm run dev

# That's it! The setup is automatic.
```

## 📋 Common Commands

| Command | Description | Auto-runs Prisma? |
|---------|-------------|-------------------|
| `pnpm install` | Install all dependencies | No |
| `pnpm run setup` | Setup Prisma with safeguards | Yes |
| `pnpm run generate` | Generate Prisma client | Yes |
| `pnpm run verify-prisma` | Verify Prisma setup | No |
| `pnpm run dev` | Start development server | Yes (via predev) |
| `pnpm run build` | Build for production | Yes (via prebuild) |

## 🔧 Troubleshooting One-Liners

```bash
# Issue: "pnpm: command not found"
npm install -g pnpm

# Issue: "Cannot find module '@prisma/client'"
pnpm run setup

# Issue: Build errors
rm -rf node_modules pnpm-lock.yaml && pnpm install && pnpm run setup

# Issue: DATABASE_URL not found
cp config.env.template .env

# Issue: Port 3000 in use
lsof -ti:3000 | xargs kill -9  # Unix/Mac
```

## 📊 Build Process Flow

```
pnpm run dev:
  └─ predev hook → prisma generate
  └─ vinxi dev → Start dev server on :3000

pnpm run build:
  └─ prebuild hook → prisma generate + verify
  └─ vinxi build → Build all routers
     └─ trpc router (SSR)
     └─ debug router (SSR)
     └─ client router (SPA)
     └─ Nitro server
```

## ✨ Key Features

- ✅ **Automatic Prisma generation** - No manual setup needed
- ✅ **Binary engines** - Stable and fast
- ✅ **Pre-hooks** - Auto-generates before dev/build
- ✅ **Verification** - Auto-verifies before build
- ✅ **Hot reload** - Fast development experience

## 📝 Notes

- Prisma generation happens automatically before dev/build
- No need to run `pnpm run setup` unless you have issues
- Binary engines (not WASM) for better stability
- `.env` file required for database connection

## 🆘 Still Having Issues?

See detailed guide: `VERIFICATION_AND_TROUBLESHOOTING.md`

## 📅 Last Verified
October 10, 2025 - All systems operational ✅
