# GitHub Actions - Quick Reference Card

## 🎯 What Is This?

GitHub Actions provides **automated Windows 10/11 testing** for your Financial Statement Generator application, solving firewall and dependency issues.

---

## ⚡ Quick Links

| What You Need | File to Read |
|--------------|-------------|
| **5-minute setup** | [GITHUB_ACTIONS_QUICK_START.md](./GITHUB_ACTIONS_QUICK_START.md) |
| **Complete guide** | [GITHUB_ACTIONS_SETUP_GUIDE.md](./GITHUB_ACTIONS_SETUP_GUIDE.md) |
| **Visual walkthrough** | [GITHUB_ACTIONS_VISUAL_GUIDE.md](./GITHUB_ACTIONS_VISUAL_GUIDE.md) |
| **Troubleshooting** | [GITHUB_ACTIONS_TROUBLESHOOTING.md](./GITHUB_ACTIONS_TROUBLESHOOTING.md) |
| **What was added** | [GITHUB_ACTIONS_SETUP_COMPLETE.md](./GITHUB_ACTIONS_SETUP_COMPLETE.md) |

---

## 🚀 How to Enable (3 Steps)

### Step 1: Enable in Settings (1 minute)
```
GitHub Repository → Settings → Actions → General
  ✅ Allow all actions and reusable workflows
  ✅ Read and write permissions
  ✅ Allow GitHub Actions to create PRs
```

### Step 2: Verify Workflow Exists
```
Check: .github/workflows/windows-build-test.yml
(This file should already be in your repository)
```

### Step 3: Push Code
```bash
git push origin main
# OR
git push origin develop
```

**That's it!** GitHub Actions will automatically start.

---

## 📊 What Happens Automatically

Every time you push code to `main` or `develop`:

1. ✅ **Sets up Windows 10/11 environment**
2. ✅ **Installs Node.js 18 and pnpm**
3. ✅ **Installs all dependencies** (no firewall blocks!)
4. ✅ **Generates Prisma client**
5. ✅ **Type checks TypeScript**
6. ✅ **Runs ESLint**
7. ✅ **Builds application** (`pnpm run build`)
8. ✅ **Compiles Electron scripts**
9. ✅ **Runs diagnostic tests**
10. ✅ **Uploads build artifacts**
11. ✅ **Generates Windows installer** (main branch only)

**Duration**: ~5-10 minutes

---

## 👀 How to View Results

### Option 1: GitHub Website
```
1. Go to your repository on GitHub
2. Click "Actions" tab
3. See all workflow runs
4. Click any run for details
```

### Option 2: Status Indicators
- ✅ Green checkmark = Success
- ❌ Red X = Failed
- 🟡 Yellow dot = Running
- ⚪ Gray dot = Queued

---

## 📥 How to Download Build Artifacts

### Windows Installer (.exe)
```
1. Go to Actions tab
2. Click on a workflow run (from main branch)
3. Scroll to bottom
4. Find "windows-installer" artifact
5. Click to download
```

**Contains:**
- `Financial Statement Generator-1.0.0-windows-x64.exe` (Full installer)
- `Financial Statement Generator-1.0.0-Portable.exe` (Portable version)

### Build Artifacts
```
Artifact: build-artifacts-windows
Contains: Compiled application files (.output, .vinxi)
Retention: 7 days
```

---

## 🔧 How to Manually Trigger

```
1. Go to Actions tab
2. Click "Windows Build and Test" workflow
3. Click "Run workflow" button (top right)
4. Select branch
5. Click "Run workflow"
```

---

## ❌ What to Do If Build Fails

### Step 1: View Error
```
1. Click on the failed workflow run
2. Click on the failed job (red X)
3. Click on the failed step
4. Read the error message
```

### Step 2: Common Fixes

**Error: "pnpm install failed"**
- Fix: Ensure `pnpm-lock.yaml` is committed

**Error: "Cannot find module '@prisma/client'"**
- Fix: Ensure `prebuild` script runs Prisma generate

**Error: "electron-builder failed"**
- Fix: Ensure all Electron files are committed

**Error: "Permission denied"**
- Fix: Set workflow permissions to "Read and write"

### Step 3: Re-run
```
Click "Re-run failed jobs" button (top right)
```

---

## 💰 Cost

### Public Repositories
- ✅ **FREE unlimited minutes**

### Private Repositories
- ✅ **2,000 free minutes per month**
- Windows builds count as 2x minutes
- After free tier: $0.008/minute

**For this project:**
- Each build: ~5-10 minutes = 10-20 billable minutes
- Free tier allows: ~100-200 builds/month

---

## 🎁 Benefits

### Before (Local Build)
- ❌ Firewall blocks dependency downloads
- ❌ "Cannot connect to address" errors
- ❌ Manual environment setup
- ❌ Inconsistent builds

### After (GitHub Actions)
- ✅ No firewall issues
- ✅ All dependencies install automatically
- ✅ Clean environment every time
- ✅ Consistent builds
- ✅ Easy debugging
- ✅ Automatic testing

---

## 📝 Workflow File Location

```
.github/workflows/windows-build-test.yml
```

**Do NOT delete this file!**

---

## 🔐 Adding Secrets (Optional)

For sensitive data like database credentials:

```
1. Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add secret:
   Name: DATABASE_URL
   Value: postgresql://user:pass@host:5432/db
4. Click "Add secret"
```

**Use in workflow:**
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 📧 Notifications

You'll receive email when:
- ✅ Build completes successfully
- ❌ Build fails

**Configure:**
```
Your GitHub Settings → Notifications → Actions
  ☑️ Email notifications for workflow runs
```

---

## 🔍 Status Badge (Optional)

Add to your README.md:

```markdown
![Build Status](https://github.com/gauti2609/SMBC-Financial-Audit-App/workflows/Windows%20Build%20and%20Test/badge.svg)
```

Shows build status on repository home page.

---

## 📞 Getting Help

### 1. Check Documentation
- Quick Start: `GITHUB_ACTIONS_QUICK_START.md`
- Complete Guide: `GITHUB_ACTIONS_SETUP_GUIDE.md`
- Troubleshooting: `GITHUB_ACTIONS_TROUBLESHOOTING.md`

### 2. Check Workflow Logs
- Actions tab → Click workflow run → View logs

### 3. Test Locally
```bash
cd "Financials Automation"
pnpm install
pnpm run build
pnpm run build:electron
```

### 4. Open Issue
Include:
- Link to failed workflow run
- Error message from logs
- What you tried already

---

## ⚡ Commands Cheat Sheet

### View Workflow Status
```bash
# Via GitHub CLI (if installed)
gh workflow list
gh run list
gh run view <run-id>
```

### Local Testing
```bash
cd "Financials Automation"

# Clean install
rm -rf node_modules pnpm-lock.yaml .vinxi .output
pnpm install

# Build (same as CI)
pnpm run build
pnpm run build:electron

# Generate installer
pnpm run electron:dist:win
```

---

## 📅 Workflow Schedule

### Automatic Triggers
- Push to `main` branch → Full build + installer
- Push to `develop` branch → Build + test only
- Pull request to `main`/`develop` → Build + test only

### Manual Trigger
- Anytime via "Run workflow" button

---

## ✅ Success Checklist

Your GitHub Actions setup is working when:

- [ ] Workflow appears in Actions tab after push
- [ ] Build completes successfully (green checkmark)
- [ ] Build artifacts are available for download
- [ ] Windows installer generated on main branch
- [ ] Failed builds show clear error messages
- [ ] Re-running workflows works
- [ ] Team can download and test installers

---

## 🎯 One-Minute Summary

**What**: Automated Windows 10/11 testing and building  
**Where**: GitHub Actions tab  
**When**: Every push to main/develop  
**Why**: No firewall issues, automatic dependencies  
**How**: Already set up! Just push code  
**Cost**: Free for public repos  
**Duration**: ~5-10 minutes per build  

---

## 📖 Full Documentation

For complete details, see:
- 📘 **Complete Guide** (15,000 words): `GITHUB_ACTIONS_SETUP_GUIDE.md`
- 🎨 **Visual Guide** (ASCII diagrams): `GITHUB_ACTIONS_VISUAL_GUIDE.md`
- 🔧 **Troubleshooting** (Common issues): `GITHUB_ACTIONS_TROUBLESHOOTING.md`
- 🎉 **Summary** (What was added): `GITHUB_ACTIONS_SETUP_COMPLETE.md`

---

**Last Updated**: January 2025  
**Quick Help**: See `GITHUB_ACTIONS_QUICK_START.md`  
**Full Help**: See `GITHUB_ACTIONS_SETUP_GUIDE.md`

**Your automated Windows testing is ready! Just push code and let GitHub Actions do the work. 🚀**
