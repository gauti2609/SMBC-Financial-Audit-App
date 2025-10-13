# ⚠️ IMPORTANT: About the Windows .exe Installer

## Quick Answer: Where is the .exe installer?

**The .exe installer is NOT stored in this repository.** This is normal and intentional.

## 📥 How to Get the Installer

### For End Users:
1. Go to [GitHub Releases](https://github.com/gauti2609/SMBC/releases)
2. Download the latest `Financial Statement Generator-Setup-*.exe`
3. Run the installer
4. See [HOW_TO_GET_INSTALLER.md](./HOW_TO_GET_INSTALLER.md) for details

### For Developers:
Build it yourself:
```bash
cd "Financials Automation"
pnpm install
pnpm run build
pnpm run build:electron
pnpm run electron:dist:win
```

Output will be in: `Financials Automation/dist-electron/`

## ❓ Why Isn't the .exe in the Repo?

1. **Size**: Installer is 200-400MB - too large for Git
2. **Best Practice**: Build artifacts go to Releases, not version control
3. **Efficiency**: Source code (small) stays in repo, builds (large) go to Releases

## 📋 What Was Added in PR #23?

PR #23 successfully added:
- ✅ Complete source code
- ✅ Build configuration files
- ✅ Electron setup
- ✅ Build instructions
- ✅ Documentation

It did NOT add (by design):
- ❌ The actual .exe installer
- ❌ Build artifacts (dist-electron/)

## 🚀 Creating a Release (for Maintainers)

### Automated via GitHub Actions:
```bash
git tag v1.0.0
git push origin v1.0.0
```
The workflow automatically builds and uploads the installer.

### Manual:
1. Build locally (see above)
2. Go to [Releases](https://github.com/gauti2609/SMBC/releases)
3. Draft new release
4. Upload .exe files from `dist-electron/`
5. Publish

## 📚 Full Documentation

- [HOW_TO_GET_INSTALLER.md](./HOW_TO_GET_INSTALLER.md) - Complete user guide
- [Financials Automation/README_EXE_LOCATION.md](./Financials%20Automation/README_EXE_LOCATION.md) - Technical details
- [Financials Automation/EXE Instructions.md](./Financials%20Automation/EXE%20Instructions.md) - Build & install guide

## 🔄 GitHub Actions Workflow

This repository now includes:
- `.github/workflows/build-windows-installer.yml`
- Automatically builds installer on tagged releases
- Can be triggered manually
- Uploads artifacts to GitHub Releases

## 💡 Summary

Think of it like this:
- **Repository** = Recipe (source code) 📝
- **Releases** = Restaurant (ready-to-eat meals) 🍽️

You don't store meals in recipe books - you make them when needed!

---

**Need Help?** See the documentation links above or open an issue.
