# GitHub Actions Setup Guide for Windows 10/11 Testing

## Overview

This guide explains how to set up GitHub Actions for automated testing and building of the Financial Statement Generator application on Windows 10/11 systems. GitHub Actions provides a clean, isolated environment where your code can be tested with all dependencies installed automatically, eliminating issues like firewall blocks and environment inconsistencies.

**Reference**: [GitHub Actions Setup Steps](https://gh.io/copilot/actions-setup-steps)

---

## Table of Contents

1. [What is GitHub Actions?](#what-is-github-actions)
2. [Benefits for This Project](#benefits-for-this-project)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
5. [Understanding the Workflow Files](#understanding-the-workflow-files)
6. [Triggering Workflows](#triggering-workflows)
7. [Viewing Workflow Results](#viewing-workflow-results)
8. [Debugging Failed Workflows](#debugging-failed-workflows)
9. [Advanced Configuration](#advanced-configuration)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

---

## What is GitHub Actions?

GitHub Actions is a CI/CD (Continuous Integration/Continuous Deployment) platform that allows you to automate your build, test, and deployment pipeline. When you push code to GitHub, Actions can automatically:

- **Install all dependencies** in a clean environment
- **Build your application** on Windows 10/11
- **Run tests** to verify functionality
- **Generate installers** for distribution
- **Store build artifacts** for download

**Key Advantage**: No firewall blocks, no environment conflicts - just clean, reproducible builds every time.

---

## Benefits for This Project

### 1. **Automated Dependency Installation**
- Automatically installs Node.js, pnpm, and all project dependencies
- No manual setup required after initial configuration
- Consistent environment across all builds

### 2. **Windows 10/11 Testing**
- Tests run on actual Windows Server environments (equivalent to Windows 10/11)
- Validates that your application works on target platform
- Catches Windows-specific issues early

### 3. **Build Verification**
- Automatically builds the application on every commit
- Generates Windows installers (.exe files)
- Stores artifacts for later download and distribution

### 4. **No Firewall Issues**
- GitHub's infrastructure has proper network access
- All dependencies download without firewall blocks
- Database connections can be mocked or configured

### 5. **Faster Debugging**
- See exactly what failed and where
- Download build logs and artifacts
- Re-run failed workflows with one click

---

## Prerequisites

### Required
- **GitHub Account**: Must have access to the repository
- **Repository Access**: Owner or collaborator permissions
- **GitHub Actions Enabled**: Usually enabled by default (free for public repos)

### Optional
- **GitHub Secrets**: For storing sensitive information (database credentials, API keys)
- **Branch Protection**: To require workflow success before merging

---

## Step-by-Step Setup Guide

### Step 1: Verify Repository Structure

The workflow file should already be in your repository at:
```
.github/workflows/windows-build-test.yml
```

If it's not there, you need to create it:

1. Navigate to your repository on GitHub
2. Click on **"Add file"** > **"Create new file"**
3. Name it: `.github/workflows/windows-build-test.yml`
4. Copy the workflow content from this repository's `.github/workflows/windows-build-test.yml` file
5. Click **"Commit changes"**

### Step 2: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click on **"Settings"** tab
3. Click on **"Actions"** in the left sidebar
4. Under **"Actions permissions"**, select:
   - ✅ **"Allow all actions and reusable workflows"**
5. Click **"Save"**

### Step 3: Configure Secrets (If Needed)

For sensitive data like database credentials:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Click **"New repository secret"**
3. Add secrets as needed:
   - `DATABASE_URL`: Your database connection string
   - `JWT_SECRET`: JWT secret key
   - `ADMIN_PASSWORD`: Admin password

**Note**: For initial testing, the workflow uses the `config.env.template` file, so secrets are optional.

### Step 4: Commit and Push

If you created the workflow file locally:

```bash
cd "Financials Automation"
git add .github/workflows/windows-build-test.yml
git commit -m "Add GitHub Actions workflow for Windows testing"
git push origin main
```

### Step 5: Verify Workflow Execution

1. Go to the **"Actions"** tab in your GitHub repository
2. You should see the workflow running automatically
3. Click on the workflow run to see details

---

## Understanding the Workflow Files

### Main Workflow: `windows-build-test.yml`

This workflow has two jobs:

#### Job 1: Build and Test
```yaml
build-and-test:
  runs-on: windows-latest  # Uses Windows Server (like Windows 10/11)
  steps:
    - Checkout code
    - Setup Node.js 18
    - Install pnpm
    - Install dependencies
    - Build application
    - Run tests
    - Upload artifacts
```

**What it does**:
- Sets up a clean Windows environment
- Installs all required tools (Node.js, pnpm, Git)
- Installs project dependencies (`pnpm install`)
- Builds the application (`pnpm run build`)
- Compiles Electron scripts
- Runs diagnostic tests
- Uploads build artifacts

#### Job 2: Build Windows Installer
```yaml
build-windows-installer:
  runs-on: windows-latest
  needs: build-and-test  # Only runs if Job 1 succeeds
  if: github.ref == 'refs/heads/main'  # Only on main branch
  steps:
    - Build complete Windows installer (.exe)
    - Upload installer for download
```

**What it does**:
- Only runs on the `main` branch
- Generates the full Windows installer
- Uploads the `.exe` file for download

### Workflow Triggers

The workflow automatically runs on:
- **Push to `main` or `develop` branches**
- **Pull requests to `main` or `develop` branches**
- **Manual trigger** (via "Run workflow" button)

---

## Triggering Workflows

### Automatic Triggers

Workflows run automatically when you:
- Push commits to `main` or `develop` branches
- Create or update a pull request

### Manual Triggers

To manually run a workflow:

1. Go to **"Actions"** tab
2. Select **"Windows Build and Test"** workflow
3. Click **"Run workflow"** button
4. Select the branch
5. Click **"Run workflow"** (green button)

---

## Viewing Workflow Results

### Accessing Workflow Runs

1. Click on **"Actions"** tab in your repository
2. See list of all workflow runs
3. Click on a specific run to see details

### Understanding the Results

✅ **Green checkmark** = Success  
❌ **Red X** = Failure  
🟡 **Yellow circle** = Running  
⚪ **Gray circle** = Queued  

### Viewing Logs

1. Click on the workflow run
2. Click on a job (e.g., "Build and Test on Windows")
3. Click on a step to expand its logs
4. View detailed output

### Downloading Artifacts

1. Scroll to the bottom of the workflow run page
2. Under **"Artifacts"** section, you'll see:
   - `build-artifacts-windows`: Build output files
   - `windows-installer`: Windows .exe installer (only on main branch)
   - `build-logs-windows`: Error logs (only if build failed)
3. Click to download

---

## Debugging Failed Workflows

### Step 1: Identify the Failed Step

1. Open the failed workflow run
2. Look for the step with a red ❌
3. Click to expand the logs

### Step 2: Read the Error Message

Common errors and solutions:

#### Error: "pnpm install" Failed
```
Error: ENOENT: no such file or directory
```
**Solution**: Check that `pnpm-lock.yaml` exists and is committed

#### Error: "Build Failed"
```
Error: Cannot find module '@prisma/client'
```
**Solution**: Ensure Prisma generates before build (check `prebuild` script)

#### Error: "Electron Build Failed"
```
Error: Cannot find module 'electron/main.js'
```
**Solution**: Verify Electron source files exist in `electron/` directory

### Step 3: Re-run Failed Jobs

1. Click **"Re-run failed jobs"** button (top right)
2. Or click **"Re-run all jobs"** to start fresh

### Step 4: Test Locally

To replicate the CI environment locally:

```bash
cd "Financials Automation"

# 1. Clean install
rm -rf node_modules pnpm-lock.yaml .vinxi .output
pnpm install

# 2. Build
pnpm run build

# 3. Compile Electron
pnpm run build:electron

# 4. Run diagnostics
node diagnostic-test.mjs
```

---

## Advanced Configuration

### Adding More Tests

To add additional test steps, edit the workflow file:

```yaml
- name: Run Unit Tests
  run: pnpm run test
  
- name: Run Integration Tests
  run: pnpm run test:integration
```

### Matrix Testing (Multiple Versions)

Test on multiple Node.js versions:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### Adding Database Testing

Configure PostgreSQL service:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432
```

### Conditional Workflows

Run installer build only on tags:

```yaml
if: startsWith(github.ref, 'refs/tags/v')
```

---

## Troubleshooting

### Issue: Workflow Not Running

**Check**:
1. Is GitHub Actions enabled in repository settings?
2. Is the workflow file in `.github/workflows/` directory?
3. Is the workflow file named with `.yml` or `.yaml` extension?
4. Does the workflow have proper YAML syntax?

**Fix**:
```bash
# Validate YAML syntax
yamllint .github/workflows/windows-build-test.yml
```

### Issue: "Resource not accessible" Error

**Problem**: Insufficient permissions

**Fix**:
1. Go to **Settings** > **Actions** > **General**
2. Under **"Workflow permissions"**, select:
   - ✅ **"Read and write permissions"**
3. Check ✅ **"Allow GitHub Actions to create and approve pull requests"**
4. Click **"Save"**

### Issue: Timeout Errors

**Problem**: Build takes too long

**Fix**: Increase timeout in workflow:
```yaml
- name: Build Application
  run: pnpm run build
  timeout-minutes: 20  # Increase from default
```

### Issue: Out of Storage

**Problem**: Workflow runs out of disk space

**Fix**: Add cleanup step:
```yaml
- name: Clean Up
  run: |
    Remove-Item -Recurse -Force node_modules/.cache
    Remove-Item -Recurse -Force .vinxi/build
```

### Issue: Dependencies Not Installing

**Problem**: pnpm cache issues

**Fix**: Clear cache before install:
```yaml
- name: Install Dependencies
  run: |
    pnpm store prune
    pnpm install --no-frozen-lockfile
```

---

## Best Practices

### 1. Use Caching

Speed up builds by caching dependencies:
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 2. Fail Fast

Stop on first error:
```yaml
strategy:
  fail-fast: true
```

### 3. Use Concurrency

Prevent multiple builds for the same branch:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 4. Pin Action Versions

Use specific versions instead of `@main`:
```yaml
uses: actions/checkout@v4  # ✅ Good
uses: actions/checkout@main  # ❌ Risky
```

### 5. Separate Development and Production

Use different workflows for dev and prod:
- `.github/workflows/ci.yml` - Run on all PRs
- `.github/workflows/release.yml` - Build installers on releases

### 6. Monitor Workflow Costs

For private repositories:
- Check **Settings** > **Billing** for usage
- Optimize workflows to reduce minutes
- Use self-hosted runners for heavy builds

### 7. Secure Secrets

- Never commit secrets to the repository
- Always use GitHub Secrets for sensitive data
- Rotate secrets regularly

---

## Quick Reference

### Essential Commands

```bash
# Local testing to match CI
cd "Financials Automation"
pnpm install
pnpm run build
pnpm run build:electron
node diagnostic-test.mjs

# Generate Windows installer
pnpm run electron:dist:win
```

### Workflow Status Badge

Add to your README.md:
```markdown
![Build Status](https://github.com/gauti2609/SMBC-Financial-Audit-App/workflows/Windows%20Build%20and%20Test/badge.svg)
```

### Useful GitHub Actions

- `actions/checkout@v4` - Checkout repository code
- `actions/setup-node@v4` - Setup Node.js environment
- `actions/cache@v4` - Cache dependencies
- `actions/upload-artifact@v4` - Upload build artifacts
- `actions/download-artifact@v4` - Download artifacts

---

## Frequently Asked Questions

### Q: How much does GitHub Actions cost?

**A**: 
- **Public repositories**: Free unlimited minutes
- **Private repositories**: 2,000 free minutes/month, then $0.008/minute
- **Windows runners**: Count as 2x minutes (1 minute = 2 billable minutes)

### Q: Can I test on actual Windows 10/11?

**A**: GitHub uses Windows Server 2019/2022, which is binary-compatible with Windows 10/11. For most applications, this is equivalent.

### Q: How do I test with a real database?

**A**: You can:
1. Use PostgreSQL service container (shown in Advanced Configuration)
2. Connect to external database (use GitHub Secrets for credentials)
3. Use mock database for unit tests

### Q: Can I access the build machine?

**A**: Not directly, but you can:
1. Add debugging steps to print information
2. Upload files as artifacts for inspection
3. Use `actions/debug` action for interactive debugging

### Q: How long do artifacts persist?

**A**: Default is 90 days, but you can configure:
```yaml
retention-days: 30  # Keep for 30 days
```

### Q: Can I run workflows locally?

**A**: Yes, using [act](https://github.com/nektos/act):
```bash
# Install act
choco install act-cli  # Windows

# Run workflow locally
act -W .github/workflows/windows-build-test.yml
```

---

## Getting Help

### Resources

- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **GitHub Community Forum**: https://github.community/
- **This Repository's Issues**: Create an issue for project-specific help

### Support Channels

1. **Check workflow logs** for detailed error messages
2. **Search GitHub Issues** in this repository
3. **Review documentation** in the `docs/` folder
4. **Contact maintainer** via GitHub issues

---

## Summary Checklist

Use this checklist to ensure proper setup:

- [ ] `.github/workflows/windows-build-test.yml` file exists
- [ ] GitHub Actions is enabled in repository settings
- [ ] Workflow permissions are set to "Read and write"
- [ ] Workflow file has no YAML syntax errors
- [ ] First workflow run has been triggered and viewed
- [ ] Understand how to view logs and download artifacts
- [ ] Know how to re-run failed workflows
- [ ] (Optional) Secrets configured for sensitive data
- [ ] (Optional) Status badge added to README

---

## Next Steps

After setting up GitHub Actions:

1. **Monitor Initial Runs**: Watch the first few workflow runs to ensure everything works
2. **Fix Any Issues**: Address any failures using the debugging guide
3. **Optimize**: Add caching, reduce build times, configure notifications
4. **Document**: Add workflow status badge to README
5. **Share**: Train team members on how to use and interpret workflow results

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintained By**: SMBC Financial Audit App Team

For questions or improvements to this guide, please open an issue on GitHub.
