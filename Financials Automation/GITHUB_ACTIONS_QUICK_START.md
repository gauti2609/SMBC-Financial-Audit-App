# GitHub Actions Quick Start - 5 Minute Setup

This is a condensed version of the full GitHub Actions Setup Guide. Follow these steps to get automated Windows 10/11 testing running in 5 minutes.

## What You'll Get

✅ Automatic testing on every commit  
✅ Windows 10/11 compatible builds  
✅ No firewall or network issues  
✅ All dependencies installed automatically  
✅ Downloadable Windows installers  

---

## 5-Step Setup

### Step 1: Verify Workflow File Exists (30 seconds)

Check if this file exists in your repository:
```
.github/workflows/windows-build-test.yml
```

✅ **Exists**: Skip to Step 2  
❌ **Missing**: Copy the file from this branch and commit it

### Step 2: Enable GitHub Actions (1 minute)

1. Go to your repository on GitHub
2. Click **Settings** → **Actions** → **General**
3. Select **"Allow all actions and reusable workflows"**
4. Under **Workflow permissions**, select **"Read and write permissions"**
5. Click **Save**

### Step 3: Push Code (30 seconds)

```bash
cd "Financials Automation"
git add .github/workflows/windows-build-test.yml
git commit -m "Add GitHub Actions workflow"
git push origin main
```

### Step 4: Watch It Run (2 minutes)

1. Go to the **Actions** tab on GitHub
2. You'll see "Windows Build and Test" running
3. Click on it to watch progress

### Step 5: View Results (1 minute)

After ~5-10 minutes:
- ✅ Green checkmark = Build successful
- ❌ Red X = Build failed (click to see logs)
- Download artifacts at the bottom of the run page

---

## That's It! 🎉

Your repository now has automated Windows testing. Every time you push code:

1. GitHub Actions automatically starts
2. Sets up a clean Windows environment
3. Installs all dependencies
4. Builds your application
5. Runs tests
6. Uploads build artifacts

---

## What Runs Automatically

Every push to `main` or `develop` triggers:

1. **Install Dependencies**: `pnpm install`
2. **Verify Prisma**: `pnpm run verify-prisma`
3. **Type Check**: `pnpm run typecheck`
4. **Lint**: `pnpm run lint`
5. **Build**: `pnpm run build`
6. **Compile Electron**: `pnpm run build:electron`
7. **Run Diagnostics**: `node diagnostic-test.mjs`

On `main` branch only:
8. **Generate Windows Installer**: `pnpm run electron:dist:win`

---

## Common Questions

### Q: Where do I see the results?
**A**: Click the **Actions** tab in your GitHub repository

### Q: How do I download the Windows installer?
**A**: 
1. Go to Actions → Select a workflow run on `main` branch
2. Scroll to bottom → "Artifacts" section
3. Click "windows-installer" to download

### Q: What if the build fails?
**A**: 
1. Click on the failed run
2. Click on the failed step (red X)
3. Read the error message
4. Fix the issue and push again

### Q: Can I run it manually?
**A**: Yes! 
1. Go to Actions → "Windows Build and Test"
2. Click "Run workflow" button
3. Select branch and click "Run workflow"

### Q: Does this cost money?
**A**: 
- Public repos: **Free unlimited**
- Private repos: **2,000 free minutes/month**

---

## Troubleshooting

### Workflow Not Running?

Check:
1. Is GitHub Actions enabled? (Settings → Actions)
2. Is the workflow file in `.github/workflows/`?
3. Did you push to `main` or `develop` branch?

### Build Failing?

Common fixes:
```bash
# Locally test the same commands
cd "Financials Automation"
pnpm install
pnpm run build
pnpm run build:electron
```

If it works locally but fails on GitHub:
- Check if all files are committed
- Verify `.env.template` exists
- Ensure `pnpm-lock.yaml` is committed

---

## Next Steps

✅ **Monitor a few runs** to ensure stability  
✅ **Add status badge** to README (optional)  
✅ **Review full guide** at `GITHUB_ACTIONS_SETUP_GUIDE.md`  
✅ **Configure notifications** in GitHub settings  

---

## View Full Documentation

For advanced features and detailed troubleshooting, see:
- **Full Guide**: `GITHUB_ACTIONS_SETUP_GUIDE.md`
- **Windows Deployment**: `WINDOWS_DEPLOYMENT_CHECKLIST.md`
- **Build Instructions**: `EXE Instructions.md`

---

**Need Help?** Open an issue on GitHub with:
- Link to failed workflow run
- Error message from logs
- What you were trying to do

---

**Setup Time**: 5 minutes  
**First Build Time**: 5-10 minutes  
**Subsequent Builds**: 3-7 minutes (with caching)
