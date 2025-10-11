# Complete Test Environment Setup Guide

> **Purpose:** This guide provides step-by-step instructions for setting up a test environment to run all tests and builds, matching the CI/CD environment configuration.

**Last Updated:** October 11, 2025  
**Target Audience:** Developers and QA testers  
**Estimated Setup Time:** 15-30 minutes

---

## Table of Contents

1. [Quick Start (Recommended)](#quick-start-recommended)
2. [Docker-Based Setup (All Platforms)](#docker-based-setup-all-platforms)
3. [Native Setup (Linux/Mac/Windows)](#native-setup-linuxmacwindows)
4. [Verification Steps](#verification-steps)
5. [Running Tests](#running-tests)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start (Recommended)

**Best for:** Getting started quickly with an isolated test environment

### Prerequisites
- Docker Desktop (for Windows/Mac) or Docker Engine (for Linux)
- Git

### Steps

```bash
# 1. Clone the repository (if not already done)
git clone https://github.com/gauti2609/SMBC-Financial-Audit-App.git
cd SMBC-Financial-Audit-App/Financials\ Automation

# 2. Setup environment file
cp config.env.template .env

# 3. Start the complete environment
./scripts/docker-compose up

# That's it! The environment will:
# - Install all dependencies
# - Setup PostgreSQL database
# - Generate Prisma client
# - Start the development server
```

---

## Docker-Based Setup (All Platforms)

**Best for:** Consistent environment across all platforms, matches CI/CD configuration

### Step 1: Install Docker

#### Windows
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Run the installer
3. Follow installation wizard (default settings are fine)
4. Restart your computer if prompted
5. Start Docker Desktop

**Verify:**
```bash
docker --version
docker-compose --version
```

Expected output:
```
Docker version 24.x.x or higher
Docker Compose version v2.x.x or higher
```

#### Mac
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Open the `.dmg` file and drag Docker to Applications
3. Open Docker from Applications
4. Grant permissions when prompted

**Verify:**
```bash
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Log out and log back in for group changes to take effect
```

**Verify:**
```bash
docker --version
docker compose version
```

### Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/gauti2609/SMBC-Financial-Audit-App.git

# Navigate to the project directory
cd SMBC-Financial-Audit-App/Financials\ Automation
```

### Step 3: Setup Environment

```bash
# Create .env file from template
cp config.env.template .env

# Optional: Edit .env if you need custom settings
# nano .env  # or use your preferred editor
```

### Step 4: Build and Start Environment

```bash
# Using the convenience scripts
./scripts/docker-compose build

# Start all services (database, app, etc.)
./scripts/docker-compose up
```

**What this does:**
- ✅ Pulls required Docker images (PostgreSQL, Redis, MinIO)
- ✅ Builds the application container
- ✅ Installs Node.js 20
- ✅ Installs pnpm globally
- ✅ Installs all project dependencies
- ✅ Generates Prisma client
- ✅ Starts the development server on port 3000

**Expected Output:**
```
[+] Running 7/7
 ✔ Network financials-automation_default  Created
 ✔ Container postgres                     Started
 ✔ Container redis                        Started
 ✔ Container minio                        Started
 ✔ Container app                          Started
...
Server running at http://localhost:3000
```

### Step 5: Access the Application

Open your browser and navigate to:
- **Application:** http://localhost:3000
- **Database Admin:** http://localhost:8000/adminer
  - Credentials: postgres/postgres
- **MinIO Console:** http://localhost:9001
  - Credentials: admin/[your ADMIN_PASSWORD from .env]

### Step 6: Running Tests in Docker

```bash
# In a new terminal, while containers are running
./scripts/docker-compose exec app bash

# Inside the container, run tests
pnpm run test-features

# Or run specific commands
pnpm run build
pnpm run typecheck
pnpm run lint
```

---

## Native Setup (Linux/Mac/Windows)

**Best for:** Local development without Docker overhead

### Prerequisites Checklist

- [ ] Git installed
- [ ] Node.js 20.x or higher
- [ ] pnpm 8.x or higher
- [ ] PostgreSQL 14+ (optional, for full testing)

### Step 1: Install Node.js

#### Windows
1. Download Node.js LTS from: https://nodejs.org/
2. Run installer with default settings
3. Restart Command Prompt after installation

```bash
# Verify installation
node --version
npm --version
```

Expected: `v20.x.x` or higher

#### Mac
```bash
# Using Homebrew (recommended)
brew install node@20

# Or download from https://nodejs.org/
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

Expected: `v20.x.x` or higher

### Step 2: Install pnpm

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

Expected: `9.x.x` or `10.x.x`

### Step 3: Clone Repository

```bash
# Clone the repository
git clone https://github.com/gauti2609/SMBC-Financial-Audit-App.git

# Navigate to project directory
cd SMBC-Financial-Audit-App/Financials\ Automation
```

### Step 4: Setup Environment

```bash
# Create environment file
cp config.env.template .env
```

**Important:** Edit `.env` and configure:
```env
# Required for database operations
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app

# Required for authentication
JWT_SECRET=your-secret-key-here-change-this-in-production

# Required for admin access
ADMIN_PASSWORD=YourSecurePassword123
```

### Step 5: Install Dependencies

```bash
# Clean install (if you had previous installations)
rm -rf node_modules pnpm-lock.yaml .vinxi .output

# Install all dependencies
pnpm install
```

**Expected Output:**
```
Packages: +1100
+++++++++++++++++++++++++++++++++++++++++
Progress: resolved xxxx, reused xxxx, downloaded xxx, added xxxx

> first-project@ postinstall
> echo 'Generating TanStack Router...' && tsr generate

Generating TanStack Router...

Done in XXs using pnpm vX.X.X
```

**Key Success Indicators:**
- ✅ No error messages at the end
- ✅ "Done in XXs" message appears
- ✅ Exit code is 0

### Step 6: Setup Prisma

```bash
# Generate Prisma client
pnpm run setup
```

**Expected Output:**
```
> first-project@ setup
> node scripts/setup-prisma.js

🔧 Setting up Prisma Client...
✅ @prisma/client package found
⏳ Waiting for package extraction to complete...
🔄 Generating Prisma client...

✔ Generated Prisma Client (v6.8.2, engine=binary) to ./node_modules/@prisma/client in XXXms

✅ Prisma client generated successfully
✅ Prisma client files verified
🎉 Prisma setup completed successfully!
```

### Step 7: Verify Setup

```bash
# Run verification script
pnpm run verify-prisma
```

**Expected Output:**
```
🔍 Verifying Prisma setup...
✅ Prisma schema found
✅ DATABASE_URL configured
✅ Prisma schema is valid
🔄 Generating Prisma client...
✅ Prisma client generated successfully
✅ Prisma client files found
🎉 Prisma setup verification completed successfully!
```

### Step 8: Optional - Setup PostgreSQL

If you need to run database-dependent tests:

#### Using Docker (Easiest)
```bash
# Start only PostgreSQL
docker run -d \
  --name postgres-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=app \
  -p 5432:5432 \
  postgres:16
```

#### Native Installation

**Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run installer, set password to `postgres`
3. Ensure PostgreSQL service is running

**Mac:**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb app
```

**Linux:**
```bash
sudo apt-get install postgresql-16
sudo systemctl start postgresql
sudo -u postgres createdb app
```

---

## Verification Steps

Run these commands to verify your setup is correct:

### 1. Check Versions

```bash
# Node.js version (should be 20+)
node --version

# pnpm version (should be 8+ or 10+)
pnpm --version

# Prisma CLI version
npx prisma --version

# Check Prisma client version matches
pnpm list @prisma/client
```

**Expected Prisma Output:**
```
prisma                  : 6.8.2
@prisma/client          : 6.8.2
```

### 2. Verify Environment File

```bash
# Check .env exists
ls -la .env

# Verify DATABASE_URL is set
grep DATABASE_URL .env
```

### 3. Verify Dependencies

```bash
# Check node_modules exists and is populated
ls node_modules/@prisma/client

# Check generated files
ls node_modules/.prisma/client
```

### 4. Test Prisma Connection (if database is running)

```bash
# Validate Prisma schema
pnpm prisma validate

# Push schema to database (creates tables)
pnpm prisma db push

# Optional: Open Prisma Studio
pnpm db:studio
```

---

## Running Tests

### Development Server

```bash
# Start development server
pnpm run dev
```

**Expected Output:**
```
Starting development server...
✓ Built in X.Xs

Server running at http://localhost:3000
```

### Production Build

```bash
# Build for production
pnpm run build
```

**Expected Output:**
```
> prebuild: prisma generate && verify-prisma
> build: vinxi build

✅ Prisma verification passed
⚙ Built trpc router successfully
⚙ Built debug router successfully  
⚙ Built client router successfully
[success] Nitro Server built
```

### Type Checking

```bash
# Run TypeScript type checking
pnpm run typecheck
```

### Linting

```bash
# Run ESLint
pnpm run lint
```

### Feature Testing

```bash
# Run comprehensive feature tests (requires server running)
# In one terminal:
pnpm run dev

# In another terminal:
pnpm run test-features
```

### Electron Build

```bash
# Build Electron TypeScript files
pnpm run build:electron

# Build Windows installer
pnpm run electron:dist:win

# Build for all platforms
pnpm run electron:dist
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "node is not recognized"
**Platform:** Windows

**Solution:**
1. Restart your computer after Node.js installation
2. Check if Node.js is in PATH:
   ```bash
   echo %PATH%
   ```
3. If not, add manually: `C:\Program Files\nodejs\`

#### Issue: "pnpm is not recognized"
**All Platforms**

**Solution:**
```bash
# Close and reopen terminal
# Then verify:
pnpm --version

# If still not working, reinstall:
npm install -g pnpm
```

#### Issue: "Cannot find module '@prisma/client'"
**All Platforms**

**Solution:**
```bash
# Clean reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run setup
```

#### Issue: "DATABASE_URL environment variable not found"
**All Platforms**

**Solution:**
```bash
# Create .env file
cp config.env.template .env

# Edit .env and set DATABASE_URL
# Example: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
```

#### Issue: "Prisma generation fails"
**All Platforms**

**Solution:**
```bash
# Manually generate Prisma client
pnpm run generate

# Verify setup
pnpm run verify-prisma

# If still fails, check .env file exists and DATABASE_URL is set
```

#### Issue: "Port 3000 already in use"
**All Platforms**

**Solution:**

**Mac/Linux:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Windows:**
```bash
# Find process
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

#### Issue: "Docker build fails with EACCES"
**Linux**

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in
# Or run:
newgrp docker
```

#### Issue: "Out of memory during build"
**All Platforms**

**Solution:**

**Docker:**
```bash
# Increase Docker memory limit
# Docker Desktop -> Settings -> Resources -> Memory: 4GB+
```

**Native:**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm run build
```

#### Issue: "Database connection refused"
**All Platforms**

**Solution:**
```bash
# Check if PostgreSQL is running
# Docker:
docker ps | grep postgres

# Native (Linux/Mac):
pg_isready

# Native (Windows):
# Check Services -> PostgreSQL is Running
```

---

## Environment Comparison

### Docker vs Native

| Aspect | Docker | Native |
|--------|--------|--------|
| Setup Time | 5-10 min | 15-30 min |
| Isolation | ✅ Complete | ❌ Shares system |
| Consistency | ✅ Identical to CI | ⚠️ May vary |
| Performance | ⚠️ Slight overhead | ✅ Native speed |
| Database | ✅ Included | ❌ Manual setup |
| Best For | Testing, CI/CD match | Daily development |

---

## CI/CD Environment Match

This setup matches the CI/CD environment which uses:

- ✅ Debian 12 base image
- ✅ Node.js 20.x
- ✅ pnpm package manager
- ✅ PostgreSQL 16
- ✅ Prisma 6.8.2
- ✅ Binary engine configuration

---

## Next Steps

After successful setup:

1. **For Development:**
   ```bash
   pnpm run dev
   ```

2. **For Testing:**
   ```bash
   pnpm run build
   pnpm run typecheck
   pnpm run lint
   ```

3. **For Deployment:**
   ```bash
   pnpm run electron:dist:win  # Windows installer
   ```

4. **Documentation:**
   - [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) - User installation guide
   - [VERIFICATION_AND_TROUBLESHOOTING.md](./VERIFICATION_AND_TROUBLESHOOTING.md) - Build verification
   - [PRISMA_RESOLVED.md](./PRISMA_RESOLVED.md) - Prisma setup details

---

## Success Checklist

After completing this guide, verify:

- [ ] Node.js 20+ installed and verified
- [ ] pnpm installed and verified
- [ ] Project directory located
- [ ] .env file created and configured
- [ ] Dependencies installed (`pnpm install` completed)
- [ ] Prisma setup completed (`pnpm run setup` succeeded)
- [ ] Verification passed (`pnpm run verify-prisma` succeeded)
- [ ] Development server starts (`pnpm run dev` works)
- [ ] Production build succeeds (`pnpm run build` works)
- [ ] Can access http://localhost:3000 in browser

---

## Getting Help

If you encounter issues not covered here:

1. **Check Documentation:**
   - Review [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
   - Check [VERIFICATION_AND_TROUBLESHOOTING.md](./VERIFICATION_AND_TROUBLESHOOTING.md)

2. **Verify Environment:**
   ```bash
   node --version  # Should be v20.x.x+
   pnpm --version  # Should be 8.x.x+ or 10.x.x
   npx prisma --version  # Should be 6.8.2
   ```

3. **Clean Reinstall:**
   ```bash
   rm -rf node_modules pnpm-lock.yaml .vinxi .output
   pnpm install
   pnpm run setup
   ```

4. **Create GitHub Issue:**
   - Title: "Test Environment Setup Error"
   - Include:
     - Operating system and version
     - Node.js version
     - Error message
     - Step where error occurred

---

**Last Updated:** October 11, 2025  
**Tested On:** Debian 12, Ubuntu 22.04, macOS 14, Windows 11  
**Test Environment Version:** 1.0
