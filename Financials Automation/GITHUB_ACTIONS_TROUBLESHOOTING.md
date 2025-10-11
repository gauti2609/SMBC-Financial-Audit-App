# GitHub Actions Troubleshooting Guide

This guide helps you diagnose and fix common issues when using GitHub Actions for Windows 10/11 builds.

## Table of Contents

1. [Workflow Not Running](#workflow-not-running)
2. [Permission Errors](#permission-errors)
3. [Dependency Installation Failures](#dependency-installation-failures)
4. [Build Failures](#build-failures)
5. [Timeout Issues](#timeout-issues)
6. [Artifact Upload/Download Issues](#artifact-uploaddownload-issues)
7. [Network and Firewall Issues](#network-and-firewall-issues)
8. [Environment Variable Issues](#environment-variable-issues)
9. [Prisma-Specific Issues](#prisma-specific-issues)
10. [Electron Build Issues](#electron-build-issues)

---

## Workflow Not Running

### Symptom
Workflow doesn't appear in the Actions tab after pushing code.

### Possible Causes & Solutions

#### 1. GitHub Actions Not Enabled

**Check**:
```
Settings → Actions → General → Actions permissions
```

**Fix**:
- Select "Allow all actions and reusable workflows"
- Click Save

#### 2. Workflow File Not in Correct Location

**Check**:
```bash
# Verify file exists
ls -la .github/workflows/windows-build-test.yml
```

**Fix**:
```bash
# Create directory if missing
mkdir -p .github/workflows

# Move or create workflow file
mv windows-build-test.yml .github/workflows/
```

#### 3. Workflow File Has Syntax Errors

**Check**:
```bash
# Install yamllint
pip install yamllint

# Validate YAML
yamllint .github/workflows/windows-build-test.yml
```

**Fix**:
- Use online YAML validator
- Check indentation (must use spaces, not tabs)
- Verify no special characters

#### 4. Branch Doesn't Match Trigger

**Check**: Workflow triggers in `.github/workflows/windows-build-test.yml`:
```yaml
on:
  push:
    branches: [ main, develop ]  # Only runs on these branches
```

**Fix**: Either:
- Push to `main` or `develop` branch
- OR modify workflow to include your branch:
```yaml
on:
  push:
    branches: [ main, develop, your-branch-name ]
```

#### 5. Workflow Disabled

**Check**:
```
Actions tab → Select workflow → Three dots (•••) → Check if "Disable workflow" is selected
```

**Fix**:
- Click "Enable workflow"

---

## Permission Errors

### Symptom
```
Error: Resource not accessible by integration
Error: Permission denied
```

### Solutions

#### 1. Insufficient Workflow Permissions

**Fix**:
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select:
   - ✅ **"Read and write permissions"**
3. Check: ✅ **"Allow GitHub Actions to create and approve pull requests"**
4. Click **Save**

#### 2. Token Issues

**Check**: If using `GITHUB_TOKEN`:
```yaml
env:
  GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Fix**: Ensure token has required scopes:
```yaml
permissions:
  contents: write
  packages: write
```

#### 3. Branch Protection Rules

**Check**: Settings → Branches → Branch protection rules

**Fix**: 
- Temporarily disable protection
- Or add GitHub Actions to allowed actors

---

## Dependency Installation Failures

### Symptom
```
Error: Command failed: pnpm install
ENOENT: no such file or directory
```

### Solutions

#### 1. Missing pnpm-lock.yaml

**Check**:
```bash
ls -la pnpm-lock.yaml
```

**Fix**:
```bash
# Generate lock file
pnpm install
git add pnpm-lock.yaml
git commit -m "Add pnpm lock file"
git push
```

#### 2. Node Version Mismatch

**Check**: Workflow file:
```yaml
env:
  NODE_VERSION: '18'  # Check this matches your local version
```

**Fix**: Update to match your development environment:
```yaml
env:
  NODE_VERSION: '20'  # Or 18, 22, etc.
```

#### 3. Registry/Network Issues

**Symptom**:
```
ERR_PNPM_FETCH_404
```

**Fix**: Add retry logic:
```yaml
- name: Install Dependencies
  run: pnpm install --no-frozen-lockfile
  timeout-minutes: 10
  continue-on-error: false
```

#### 4. Cache Corruption

**Fix**: Clear cache by re-running workflow:
1. Go to Actions → Failed run
2. Click "Re-run all jobs"
3. Or add cache clearing step:
```yaml
- name: Clear pnpm Cache
  run: pnpm store prune
```

---

## Build Failures

### Symptom
```
Error: Build failed with errors
```

### Solutions

#### 1. Missing Environment Variables

**Check**: Workflow needs `.env` file:
```yaml
- name: Setup Environment Variables
  run: |
    if (!(Test-Path .env)) {
      Copy-Item config.env.template .env
    }
```

**Fix**: Ensure `config.env.template` exists and is committed

#### 2. Prisma Client Not Generated

**Check**: `prebuild` script in `package.json`:
```json
"prebuild": "npm run generate && npm run verify-prisma"
```

**Fix**: Ensure this runs before build:
```yaml
- name: Generate Prisma Client
  run: pnpm run generate

- name: Verify Prisma
  run: pnpm run verify-prisma
```

#### 3. TypeScript Errors

**Symptom**:
```
Error: Type 'X' is not assignable to type 'Y'
```

**Fix**: 
```bash
# Check locally first
pnpm run typecheck

# If passing locally, check tsconfig.json is committed
git status
```

#### 4. Missing Build Dependencies

**Symptom**:
```
Error: Cannot find module 'X'
```

**Fix**: Ensure all dependencies in `package.json`:
```bash
# Check if module is installed
pnpm list <module-name>

# Add if missing
pnpm add <module-name>
```

#### 5. Out of Memory

**Symptom**:
```
FATAL ERROR: Reached heap limit
JavaScript heap out of memory
```

**Fix**: Increase Node memory:
```yaml
- name: Build Application
  run: pnpm run build
  env:
    NODE_OPTIONS: --max-old-space-size=4096
```

---

## Timeout Issues

### Symptom
```
Error: The operation was canceled
```

### Solutions

#### 1. Increase Timeout

**Default**: 360 minutes (6 hours) for entire job

**Fix**: Adjust step timeout:
```yaml
- name: Install Dependencies
  run: pnpm install
  timeout-minutes: 15  # Increase from default 360
```

#### 2. Optimize Build Process

**Add caching**:
```yaml
- name: Cache Dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      node_modules
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

#### 3. Parallel Builds

If building takes too long:
```yaml
- name: Build Application
  run: pnpm run build --parallel
```

---

## Artifact Upload/Download Issues

### Symptom
```
Error: Unable to upload artifact
Error: Artifact not found
```

### Solutions

#### 1. Path Not Found

**Fix**: Verify paths exist:
```yaml
- name: Check Build Output
  run: |
    if (Test-Path .output) {
      echo "Build output exists"
    } else {
      echo "Build output missing"
      exit 1
    }
  shell: pwsh

- name: Upload Artifacts
  uses: actions/upload-artifact@v4
  with:
    path: Financials Automation/.output
    if-no-files-found: error  # Fail if missing
```

#### 2. Size Limits

**GitHub Limits**:
- Single file: 8 GB
- Total artifacts per workflow: 10 GB

**Fix**: Compress large files:
```yaml
- name: Compress Artifacts
  run: Compress-Archive -Path .output -DestinationPath build.zip
  shell: pwsh

- name: Upload Compressed
  uses: actions/upload-artifact@v4
  with:
    name: build-compressed
    path: build.zip
```

#### 3. Retention Period

**Default**: 90 days

**Fix**: Adjust as needed:
```yaml
- name: Upload Artifacts
  uses: actions/upload-artifact@v4
  with:
    retention-days: 30  # Keep for 30 days
```

---

## Network and Firewall Issues

### Symptom
```
Error: connect ETIMEDOUT
Error: Firewall blocked connection
```

### Solutions

#### 1. GitHub-Hosted Runners

**Good News**: GitHub Actions runners have proper network access, unlike local development environments.

**If still blocked**: Check if accessing custom registry:
```yaml
- name: Configure Registry
  run: |
    npm config set registry https://registry.npmjs.org/
    pnpm config set registry https://registry.npmjs.org/
```

#### 2. Proxy Configuration

If your organization uses a proxy:
```yaml
- name: Configure Proxy
  run: |
    npm config set proxy http://proxy.company.com:8080
    npm config set https-proxy http://proxy.company.com:8080
```

#### 3. Custom Domain Dependencies

If pulling from custom domains:
```yaml
- name: Add Custom Host
  run: |
    echo "192.168.1.100 custom.domain.com" | Out-File -Append -Encoding ASCII $env:windir\System32\drivers\etc\hosts
  shell: pwsh
```

---

## Environment Variable Issues

### Symptom
```
Error: DATABASE_URL is not defined
Error: Missing environment variable
```

### Solutions

#### 1. Use GitHub Secrets

**Setup**:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add secret (e.g., `DATABASE_URL`)

**Usage**:
```yaml
- name: Set Environment
  run: echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> $GITHUB_ENV
```

#### 2. Use config.env.template

**Workflow**:
```yaml
- name: Setup Environment
  run: |
    Copy-Item config.env.template .env
    # Optionally override with secrets
    echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> .env
  shell: pwsh
```

#### 3. Pass as Environment Variables

```yaml
- name: Build Application
  run: pnpm run build
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    NODE_ENV: production
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## Prisma-Specific Issues

### Symptom
```
Error: Cannot find module '@prisma/client'
Error: Prisma Client has not been generated
```

### Solutions

#### 1. Ensure Prisma Generates

**Check** `package.json`:
```json
{
  "scripts": {
    "predev": "npm run generate",
    "prebuild": "npm run generate && npm run verify-prisma",
    "generate": "prisma generate"
  }
}
```

**Fix**: Add explicit step:
```yaml
- name: Generate Prisma Client
  run: pnpm exec prisma generate
  
- name: Verify Prisma
  run: node scripts/verify-prisma.js
```

#### 2. Schema Location

**Check**: `prisma/schema.prisma` exists and is committed

**Fix**:
```bash
git add prisma/schema.prisma
git commit -m "Add Prisma schema"
git push
```

#### 3. Binary Download Issues

**Symptom**:
```
Error: Prisma binary download failed
```

**Fix**: Use pre-generated client:
```yaml
- name: Generate Prisma Client
  run: pnpm exec prisma generate
  env:
    PRISMA_CLI_BINARY_TARGETS: windows
```

---

## Electron Build Issues

### Symptom
```
Error: Application entry file "electron/main.js" does not exist
Error: electron-builder failed
```

### Solutions

#### 1. Compile TypeScript First

**Fix**: Ensure compilation step runs:
```yaml
- name: Compile Electron Scripts
  run: pnpm run build:electron
```

**Check** `package.json`:
```json
{
  "scripts": {
    "build:electron": "tsc --project tsconfig.electron.json"
  }
}
```

#### 2. Missing Assets

**Check**: Required files exist:
- `electron/assets/icon.png`
- `electron/main.js` (or `main.ts` before compilation)

**Fix**: Ensure all electron files are committed:
```bash
git add electron/
git commit -m "Add Electron files"
```

#### 3. electron-builder Configuration

**Check**: `electron-builder.config.js` exists

**Fix**: Verify configuration:
```javascript
module.exports = {
  appId: 'com.financialstatement.generator',
  productName: 'Financial Statement Generator',
  directories: {
    output: 'dist-electron'
  },
  win: {
    target: ['nsis', 'portable'],
    icon: 'electron/assets/icon.png'
  }
}
```

---

## Quick Diagnostic Commands

Run these locally to match CI environment:

```bash
# Navigate to project
cd "Financials Automation"

# 1. Clean state
rm -rf node_modules pnpm-lock.yaml .vinxi .output dist-electron

# 2. Install dependencies
pnpm install

# 3. Generate Prisma
pnpm run generate

# 4. Verify Prisma
pnpm run verify-prisma

# 5. Type check
pnpm run typecheck

# 6. Lint
pnpm run lint

# 7. Build
pnpm run build

# 8. Compile Electron
pnpm run build:electron

# 9. Run diagnostics
node diagnostic-test.mjs

# 10. Generate installer (optional)
pnpm run electron:dist:win
```

If all commands pass locally but fail on GitHub Actions:
1. Verify all files are committed: `git status`
2. Check workflow file syntax
3. Review GitHub Actions logs carefully
4. Compare local and CI environment versions

---

## Getting More Help

### View Detailed Logs

1. Go to Actions tab
2. Click on failed run
3. Click on failed job
4. Expand each step to see full output

### Enable Debug Logging

Add to workflow:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

### Download Artifacts

Even if build fails, partial artifacts might be uploaded:
1. Scroll to bottom of workflow run
2. Check "Artifacts" section
3. Download available artifacts

### Re-run with SSH (Advanced)

Use `action-upterm` for interactive debugging:
```yaml
- name: Setup upterm session
  uses: lhotari/action-upterm@v1
  if: failure()
```

---

## Checklist for Debugging

When workflow fails, check:

- [ ] All files committed and pushed
- [ ] Workflow file has no YAML syntax errors
- [ ] GitHub Actions enabled in repository
- [ ] Workflow permissions set to "Read and write"
- [ ] Node.js version matches local environment
- [ ] pnpm-lock.yaml is committed
- [ ] config.env.template exists
- [ ] Prisma schema is committed
- [ ] All dependencies in package.json
- [ ] Environment variables configured
- [ ] Branch matches workflow trigger

---

**Last Updated**: January 2025  
**Need More Help?** Open an issue with:
- Link to failed workflow run
- Full error message
- Steps already tried
