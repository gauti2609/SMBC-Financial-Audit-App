# GitHub Actions Visual Setup Guide

This visual guide shows you exactly what you'll see and where to click when setting up GitHub Actions for automated Windows 10/11 testing.

---

## 📋 Table of Contents

1. [Enabling GitHub Actions](#1-enabling-github-actions)
2. [Viewing Your First Workflow Run](#2-viewing-your-first-workflow-run)
3. [Understanding Workflow Status](#3-understanding-workflow-status)
4. [Downloading Build Artifacts](#4-downloading-build-artifacts)
5. [Manual Workflow Trigger](#5-manual-workflow-trigger)
6. [Debugging Failed Workflows](#6-debugging-failed-workflows)

---

## 1. Enabling GitHub Actions

### Step 1: Navigate to Settings

```
Repository Home → Settings (tab at top) → Actions (left sidebar) → General
```

**What you'll see:**
```
┌─────────────────────────────────────────────────────────┐
│ GitHub Repository                                        │
├─────────────────────────────────────────────────────────┤
│ < > Code  Issues  Pull requests  Actions  Settings     │
│                                            ^^^^^^^^      │
│                                            Click here    │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Enable Actions

**Location:** Actions permissions section

**Select:**
```
⚪ Disable Actions
⚪ Allow [organization] actions and reusable workflows
🔘 Allow all actions and reusable workflows  ← SELECT THIS
```

### Step 3: Set Permissions

**Location:** Workflow permissions section

**Select:**
```
⚪ Read repository contents and packages permissions
🔘 Read and write permissions  ← SELECT THIS

☑️ Allow GitHub Actions to create and approve pull requests  ← CHECK THIS
```

### Step 4: Save

```
┌──────────┐
│   Save   │  ← Click this button
└──────────┘
```

---

## 2. Viewing Your First Workflow Run

### After Pushing Code

**Navigate to:**
```
Repository Home → Actions (tab)
```

**What you'll see:**

```
┌─────────────────────────────────────────────────────────────────┐
│ All workflows                                                    │
├─────────────────────────────────────────────────────────────────┤
│ 🔄 Windows Build and Test                                       │
│    ↳ Add GitHub Actions workflow                                │
│      main  #1  🟡 In progress  •  Started 1 minute ago         │
│                                                                  │
│ Click on this row to see details ↑                             │
└─────────────────────────────────────────────────────────────────┘
```

### Status Indicators

```
🟡 Yellow dot  = Running
✅ Green check = Success
❌ Red X      = Failed
⚪ Gray dot   = Queued
```

---

## 3. Understanding Workflow Status

### Workflow Run Details Page

```
┌───────────────────────────────────────────────────────────────┐
│ Windows Build and Test                                         │
│ #1: Add GitHub Actions workflow                               │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│ Jobs                                                           │
│ ├─ ✅ Build and Test on Windows  (5m 32s)                    │
│ └─ 🟡 Build Windows Installer     (Running...)                │
│                                                                │
│ Click on a job name to see its logs ↑                        │
└───────────────────────────────────────────────────────────────┘
```

### Job Details View

```
┌───────────────────────────────────────────────────────────────┐
│ Build and Test on Windows                                     │
├───────────────────────────────────────────────────────────────┤
│ ✅ Set up job                               0s                │
│ ✅ Checkout Repository                      2s                │
│ ✅ Setup Node.js                           15s                │
│ ✅ Install pnpm                            3s                 │
│ ✅ Verify Environment                      1s                 │
│ ✅ Setup Environment Variables             0s                 │
│ ✅ Install Dependencies                   2m 15s              │
│ ✅ Verify Prisma Setup                     2s                 │
│ ✅ Run TypeScript Type Check              18s                 │
│ ✅ Run Linting                            12s                 │
│ ✅ Build Application                      1m 45s              │
│ ✅ Compile Electron Scripts               8s                  │
│ ✅ Run Diagnostic Tests                   5s                  │
│ ✅ Check Build Artifacts                  1s                  │
│ ✅ Upload Build Artifacts                 22s                 │
│                                                                │
│ Click on any step to see its output ↑                        │
└───────────────────────────────────────────────────────────────┘
```

### Step Log Example

When you click on a step, you see:

```
┌───────────────────────────────────────────────────────────────┐
│ > Install Dependencies                                         │
├───────────────────────────────────────────────────────────────┤
│ Run pnpm install                                              │
│                                                                │
│ Scope: all 1144 workspace projects                            │
│ Lockfile is up to date, resolution step is skipped            │
│ Progress: resolved 1144, reused 1088, downloaded 56           │
│ Packages: +1144                                               │
│ ++++++++++++++++++++++++++++++++++++++++++++++++              │
│ Progress: resolved 1144, reused 1144, downloaded 0            │
│ Done in 2m 15s                                                │
│                                                                │
│ ✅ Success!                                                   │
└───────────────────────────────────────────────────────────────┘
```

---

## 4. Downloading Build Artifacts

### Location

Scroll to the bottom of any workflow run page.

**What you'll see:**

```
┌───────────────────────────────────────────────────────────────┐
│ Artifacts                                                      │
│ Produced during runtime                                       │
├───────────────────────────────────────────────────────────────┤
│ 📦 build-artifacts-windows                                    │
│    Expires in 7 days                                Size: 45MB│
│    [Download]                                                  │
│                                                                │
│ 📦 windows-installer                                          │
│    Expires in 30 days                              Size: 125MB│
│    [Download]                                                  │
│                                                                │
│ Click [Download] to get the files ↑                          │
└───────────────────────────────────────────────────────────────┘
```

### What's Inside

After downloading and extracting:

**build-artifacts-windows.zip:**
```
build-artifacts-windows/
├── .output/
│   ├── server/
│   └── public/
└── .vinxi/
    └── build/
```

**windows-installer.zip:**
```
windows-installer/
├── Financial Statement Generator-1.0.0-windows-x64.exe  ← Full installer
├── Financial Statement Generator-1.0.0-Portable.exe     ← Portable version
└── latest.yml                                            ← Update metadata
```

---

## 5. Manual Workflow Trigger

### Step 1: Navigate to Actions

```
Repository Home → Actions → Windows Build and Test (click workflow name)
```

### Step 2: Run Workflow Button

**Location:** Top right of the page

```
┌───────────────────────────────────────────────────────────────┐
│ Windows Build and Test                                         │
│                                       [Run workflow ▼]         │
│                                        ^^^^^^^^^^^^ Click here │
└───────────────────────────────────────────────────────────────┘
```

### Step 3: Select Branch

**After clicking:**

```
┌───────────────────────────────────┐
│ Run workflow                      │
├───────────────────────────────────┤
│ Use workflow from:                │
│ Branch: [main           ▼]       │
│                                   │
│         [Run workflow]            │
│          ^^^^^^^^^^^^             │
│          Click to start           │
└───────────────────────────────────┘
```

### Step 4: Monitor Progress

```
┌───────────────────────────────────────────────────────────────┐
│ 🟡 Windows Build and Test #5                                  │
│    Manually triggered by your-username                         │
│    Running... (2m 30s elapsed)                                │
└───────────────────────────────────────────────────────────────┘
```

---

## 6. Debugging Failed Workflows

### Failed Run View

```
┌───────────────────────────────────────────────────────────────┐
│ ❌ Windows Build and Test #3                                  │
│    Fix dependency issues                                       │
│    main • Failed after 3m 45s                                 │
├───────────────────────────────────────────────────────────────┤
│ Jobs                                                           │
│ ├─ ✅ Build and Test on Windows  (3m 12s)                    │
│ └─ ❌ Build Windows Installer     (33s)                       │
│    └─ ❌ Generate Windows Installer  ← Failed step           │
│                                                                │
│ [Re-run failed jobs]  [Re-run all jobs]                      │
│  ^^^^^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^                      │
│  Try these buttons                                            │
└───────────────────────────────────────────────────────────────┘
```

### Failed Step Log

```
┌───────────────────────────────────────────────────────────────┐
│ ❌ Generate Windows Installer                                 │
├───────────────────────────────────────────────────────────────┤
│ Run pnpm run electron:dist:win                                │
│                                                                │
│ > first-project@1.0.0 electron:dist:win                      │
│ > npm run build && electron-builder --win                     │
│                                                                │
│ • electron-builder  version=24.6.4 os=10.0.20348             │
│ • loaded configuration  file=electron-builder.config.js       │
│ • description is missed in the package.json                   │
│   ⨯ Cannot compute electron arch from installer arch: x64    │
│                                                                │
│ Error: Cannot find module 'electron/main.js'                  │
│        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^                       │
│        This is the error message to investigate              │
│                                                                │
│ ##[error]Process completed with exit code 1.                 │
└───────────────────────────────────────────────────────────────┘
```

### Re-running Jobs

**Button Options:**

```
┌────────────────────┐  ┌───────────────────┐
│ Re-run failed jobs │  │ Re-run all jobs  │
└────────────────────┘  └───────────────────┘
     ↑                         ↑
     │                         │
     Only re-runs             Starts everything
     failed steps             from scratch
```

---

## 7. Notifications

### Email Notifications

After workflow completes, you'll receive email:

```
┌───────────────────────────────────────────────────────────────┐
│ From: GitHub <noreply@github.com>                             │
│ Subject: [owner/repo] Run failed: Windows Build and Test      │
├───────────────────────────────────────────────────────────────┤
│ Windows Build and Test #3 failed                              │
│                                                                │
│ View workflow run:                                            │
│ https://github.com/owner/repo/actions/runs/12345             │
│                                                                │
│ Failed jobs:                                                  │
│ • Build Windows Installer                                     │
│                                                                │
│ [View on GitHub]                                              │
└───────────────────────────────────────────────────────────────┘
```

### Configuring Notifications

**Navigate to:**
```
GitHub Settings (your profile) → Notifications → Actions
```

**Options:**
```
☑️ Email notifications for workflow runs
☑️ Send notifications for failed workflows only
☐ Send notifications for all workflows
```

---

## 8. Status Badges

### Adding to README

Add this to your `README.md`:

```markdown
![Build Status](https://github.com/owner/repo/workflows/Windows%20Build%20and%20Test/badge.svg)
```

**How it looks:**

When passing: ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
When failing: ![Build Status](https://img.shields.io/badge/build-failing-red)

---

## 9. Timeline View

### All Workflow Runs

```
┌───────────────────────────────────────────────────────────────┐
│ Windows Build and Test                                         │
├───────────────────────────────────────────────────────────────┤
│ ✅ #7 Add new feature               main    2h ago   5m 23s   │
│ ✅ #6 Fix styling issues            main    4h ago   4m 58s   │
│ ❌ #5 Update dependencies           main    1d ago   3m 12s   │
│ ✅ #4 Merge pull request #123       main    2d ago   6m 45s   │
│ ✅ #3 Initial commit                main    3d ago   5m 31s   │
│                                                                │
│ Filter: [All] [Success] [Failure] [Cancelled]                │
└───────────────────────────────────────────────────────────────┘
```

---

## 10. Secrets Configuration

### Adding Secrets

**Navigate to:**
```
Repository Settings → Secrets and variables → Actions
```

**What you'll see:**

```
┌───────────────────────────────────────────────────────────────┐
│ Actions secrets                                                │
├───────────────────────────────────────────────────────────────┤
│ Secrets are encrypted and allow you to store sensitive        │
│ information for use in GitHub Actions workflows.              │
│                                                                │
│ [New repository secret]  ← Click to add                       │
│                                                                │
│ Current secrets:                                              │
│ • DATABASE_URL        Updated 2 days ago  [Update] [Remove]  │
│ • JWT_SECRET          Updated 1 week ago  [Update] [Remove]  │
│ • ADMIN_PASSWORD      Updated 2 weeks ago [Update] [Remove]  │
└───────────────────────────────────────────────────────────────┘
```

### Adding a New Secret

```
┌───────────────────────────────────────────────────────────────┐
│ New secret                                                     │
├───────────────────────────────────────────────────────────────┤
│ Name *                                                         │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ DATABASE_URL                                            │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ Secret *                                                       │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ postgresql://user:pass@host:5432/db                     │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│                                    [Add secret]                │
└───────────────────────────────────────────────────────────────┘
```

---

## Quick Reference Card

### Common Views and What They Mean

| Icon | Status | Meaning |
|------|--------|---------|
| ✅ | Success | All steps completed successfully |
| ❌ | Failed | One or more steps failed |
| 🟡 | Running | Workflow is currently executing |
| ⚪ | Queued | Waiting to start |
| 🚫 | Cancelled | Manually stopped |
| ⏭️ | Skipped | Step was skipped (conditional) |

### Common Actions

| Action | Where to Click |
|--------|---------------|
| View all workflows | Actions tab |
| See workflow details | Click on workflow run |
| View step logs | Click on job → Click on step |
| Download artifacts | Scroll to bottom of run |
| Re-run workflow | "Re-run" button (top right) |
| Manual trigger | Actions → Select workflow → "Run workflow" |
| Add secrets | Settings → Secrets and variables → Actions |

---

## Troubleshooting Visual Guide

### "Workflow not found"

**You're here:**
```
┌───────────────────────────────────────┐
│ Actions                                │
├───────────────────────────────────────┤
│ Get started with GitHub Actions       │
│ No workflows found                     │
└───────────────────────────────────────┘
```

**Fix:** Check if `.github/workflows/windows-build-test.yml` exists in repository

---

### "Permission denied"

**You see:**
```
❌ Resource not accessible by integration
```

**Fix:** 
1. Settings → Actions → General
2. Workflow permissions → "Read and write"
3. Check "Allow GitHub Actions to create and approve pull requests"

---

## Summary Flow Chart

```
Push Code
    ↓
GitHub Detects .github/workflows/windows-build-test.yml
    ↓
Starts Windows Runner
    ↓
Executes Steps:
    ├─ Setup environment
    ├─ Install dependencies
    ├─ Build application
    ├─ Run tests
    └─ Upload artifacts
    ↓
Send Notification
    ↓
You View Results in Actions Tab
    ↓
Download Artifacts (if needed)
```

---

**Last Updated**: January 2025  
**For More Help**: See `GITHUB_ACTIONS_TROUBLESHOOTING.md`
