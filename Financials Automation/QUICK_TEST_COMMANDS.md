# Quick Test Commands Reference

> Quick reference for running tests and builds after environment setup. See [TEST_ENVIRONMENT_SETUP.md](./TEST_ENVIRONMENT_SETUP.md) for complete setup instructions.

## Prerequisites Check

```bash
# Verify all prerequisites are installed
node --version        # Should be v20.x.x+
pnpm --version        # Should be 8.x.x+ or 10.x.x
npx prisma --version  # Should be 6.8.2
ls .env              # Should exist
```

## Environment Setup

```bash
# Docker environment (recommended for testing)
./scripts/docker-compose up

# Native environment
pnpm install
pnpm run setup
```

## Development Commands

```bash
# Start development server
pnpm run dev

# Access at: http://localhost:3000
```

## Build Commands

```bash
# Production build
pnpm run build

# Electron TypeScript build
pnpm run build:electron

# Windows installer
pnpm run electron:dist:win
```

## Verification Commands

```bash
# Verify Prisma setup
pnpm run verify-prisma

# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Format code
pnpm run format
```

## Database Commands

```bash
# Validate Prisma schema
pnpm prisma validate

# Push schema to database
pnpm prisma db push

# Generate Prisma client
pnpm run generate

# Open Prisma Studio
pnpm db:studio
```

## Test Commands

```bash
# Feature tests (requires server running)
pnpm run test-features

# Run all verifications
pnpm run verify-prisma && pnpm run typecheck && pnpm run lint
```

## Docker Commands

```bash
# Start environment
./scripts/docker-compose up

# Start in background
./scripts/docker-compose up -d

# Stop environment
./scripts/docker-compose down

# View logs
./scripts/docker-compose logs -f

# Execute command in container
./scripts/docker-compose exec app bash

# Rebuild containers
./scripts/docker-compose build --no-cache
```

## Cleanup Commands

```bash
# Clean build artifacts
rm -rf .vinxi .output node_modules/.vinxi

# Clean dependencies (for fresh install)
rm -rf node_modules pnpm-lock.yaml

# Complete cleanup
rm -rf node_modules pnpm-lock.yaml .vinxi .output
pnpm install
pnpm run setup
```

## Common Workflows

### Fresh Install
```bash
rm -rf node_modules pnpm-lock.yaml
cp config.env.template .env  # if .env doesn't exist
pnpm install
pnpm run setup
pnpm run verify-prisma
```

### Before Commit
```bash
pnpm run typecheck
pnpm run lint
pnpm run build
```

### Full Test Suite
```bash
# Terminal 1: Start server
pnpm run dev

# Terminal 2: Run tests
pnpm run verify-prisma
pnpm run typecheck
pnpm run lint
pnpm run test-features
pnpm run build
```

### Docker Full Test
```bash
./scripts/docker-compose up -d
./scripts/docker-compose exec app bash -c "pnpm run verify-prisma && pnpm run typecheck && pnpm run lint && pnpm run build"
./scripts/docker-compose down
```

## Troubleshooting Quick Fixes

### Prisma Issues
```bash
pnpm run generate
pnpm run verify-prisma
```

### Build Issues
```bash
rm -rf .vinxi .output
pnpm run build
```

### Dependency Issues
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run setup
```

### Port Conflicts
```bash
# Linux/Mac
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Environment Variables

### Required in .env
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
JWT_SECRET=your-secret-key-here
ADMIN_PASSWORD=YourSecurePassword123
```

### Optional
```env
NODE_ENV=development
PORT=3000
LISTEN_IP=127.0.0.1
```

## File Locations

```
Financials Automation/
├── .env                          # Environment config (create from template)
├── config.env.template           # Environment template
├── package.json                  # npm scripts and dependencies
├── prisma/schema.prisma          # Database schema
├── scripts/
│   ├── setup-prisma.js          # Prisma setup script
│   ├── verify-prisma            # Prisma verification script
│   ├── docker-compose           # Docker compose wrapper
│   └── test-all-features        # Feature test script
├── docker/
│   ├── Dockerfile               # Docker image definition
│   └── compose.yaml             # Docker services config
└── TEST_ENVIRONMENT_SETUP.md    # Complete setup guide
```

## Help & Documentation

- **Setup Guide:** [TEST_ENVIRONMENT_SETUP.md](./TEST_ENVIRONMENT_SETUP.md)
- **Installation:** [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
- **Troubleshooting:** [VERIFICATION_AND_TROUBLESHOOTING.md](./VERIFICATION_AND_TROUBLESHOOTING.md)
- **Prisma Details:** [PRISMA_RESOLVED.md](./PRISMA_RESOLVED.md)

---

**Last Updated:** October 11, 2025  
**Quick Reference Version:** 1.0
