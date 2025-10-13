# Quick Start Guide: Creating Your First Release with Windows Installer

## For Repository Maintainers

This guide will help you create the first release of the Financial Statement Generator with the Windows .exe installer.

## Option A: Automated Build via GitHub Actions (Recommended)

This is the easiest method - GitHub will build the installer for you automatically.

### Steps:

1. **Ensure all changes are committed and pushed**
   ```bash
   git status  # Should show clean working directory
   ```

2. **Create and push a version tag**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0 - Initial Windows installer"
   git push origin v1.0.0
   ```

3. **Monitor the build**
   - Go to: https://github.com/gauti2609/SMBC/actions
   - You should see "Build Windows Installer" workflow running
   - Wait 10-15 minutes for the build to complete

4. **Check the release**
   - Go to: https://github.com/gauti2609/SMBC/releases
   - Your release should be automatically created with the .exe files attached

### What Gets Built:
- `Financial Statement Generator-Setup-1.0.0.exe` - Full installer
- `Financial Statement Generator-1.0.0-windows-x64.exe` - Portable version
- `latest.yml` - Update configuration file

## Option B: Manual Build and Upload

If you prefer to build locally and upload manually:

### Prerequisites Check:
1. Run the environment checker:
   ```cmd
   check-build-environment.bat
   ```
   - This will verify Node.js, pnpm, and Git are installed

2. If any prerequisites are missing, install them:
   - Node.js: https://nodejs.org/ (v18+)
   - pnpm: `npm install -g pnpm`
   - Git: https://git-scm.com/

### Build Steps:

1. **Navigate to the project directory**
   ```cmd
   cd "Financials Automation"
   ```

2. **Install dependencies** (first time only or after updates)
   ```cmd
   pnpm install
   ```
   - Expected time: 3-10 minutes
   - This automatically runs `prisma generate` and `tsr generate`

3. **Build the web application**
   ```cmd
   pnpm run build
   ```
   - Expected time: 2-5 minutes
   - Creates the `dist/` folder

4. **Build Electron scripts**
   ```cmd
   pnpm run build:electron
   ```
   - Expected time: 30-60 seconds
   - Creates `electron/main.js` and `electron/preload.js`

5. **Build the Windows installer**
   ```cmd
   pnpm run electron:dist:win
   ```
   - Expected time: 3-8 minutes
   - Creates files in `dist-electron/` folder

6. **Verify the build**
   ```cmd
   dir dist-electron
   ```
   You should see:
   - `Financial Statement Generator-Setup-1.0.0.exe` (~200-400MB)
   - `Financial Statement Generator-1.0.0-Portable.exe`
   - `latest.yml`

### Upload to GitHub Releases:

1. **Go to the Releases page**
   - Navigate to: https://github.com/gauti2609/SMBC/releases

2. **Draft a new release**
   - Click "Draft a new release"

3. **Create a tag**
   - Tag version: `v1.0.0`
   - Target: `main` branch

4. **Fill in release details**
   - Release title: `Version 1.0.0 - Windows Installer`
   - Description:
     ```markdown
     ## Financial Statement Generator v1.0.0
     
     ### Installation Files:
     - **Setup Installer**: For permanent installation
     - **Portable Version**: No installation required
     
     ### System Requirements:
     - Windows 10 (1909+) or Windows 11
     - 64-bit architecture
     - 4GB RAM minimum
     - 500MB disk space
     
     ### Documentation:
     - [Installation Guide](https://github.com/gauti2609/SMBC/blob/main/Financials%20Automation/EXE%20Instructions.md)
     - [How to Get Installer](https://github.com/gauti2609/SMBC/blob/main/HOW_TO_GET_INSTALLER.md)
     ```

5. **Upload the installer files**
   - Drag and drop or click "Attach binaries"
   - Upload these files from `Financials Automation/dist-electron/`:
     - `Financial Statement Generator-Setup-1.0.0.exe`
     - `Financial Statement Generator-1.0.0-Portable.exe`
     - `latest.yml` (optional, for auto-updates)

6. **Publish the release**
   - Click "Publish release"

## Sharing with Users

Once published, share this link with your users:
```
https://github.com/gauti2609/SMBC/releases/latest
```

They can download the installer and follow the instructions in [EXE Instructions.md](./Financials%20Automation/EXE%20Instructions.md).

## Future Releases

### For subsequent releases:

1. **Update version numbers** in:
   - `Financials Automation/package.json` (version field)
   - Any hardcoded version references

2. **Create new tag** with incremented version:
   ```bash
   git tag -a v1.0.1 -m "Release version 1.0.1 - Bug fixes"
   git push origin v1.0.1
   ```

3. **GitHub Actions will automatically**:
   - Build the new version
   - Create a new release
   - Attach the installer files

## Troubleshooting

### Build Fails with "Prisma Not Generated"
```cmd
cd "Financials Automation"
pnpm prisma generate
```

### Build Fails with "TSR Not Generated"  
```cmd
cd "Financials Automation"
pnpm tsr generate
```

### "electron-builder not found"
```cmd
cd "Financials Automation"
pnpm install --force
```

### Build is Very Slow
- Ensure you have a stable internet connection
- First build takes longer (downloads dependencies)
- Subsequent builds are faster (uses cache)

### Antivirus Blocks the Build
- Add project directory to antivirus exclusions
- Particularly important for `node_modules` and `dist-electron`

## Testing the Installer

Before publishing, test the installer:

1. **Copy the installer** to a clean Windows machine (or VM)
2. **Run the installer** and follow the wizard
3. **Launch the application** and verify it works
4. **Check the uninstaller** works correctly

## Need Help?

- [Build Fixes Summary](./Financials%20Automation/BUILD_FIXES_SUMMARY.md)
- [Complete Build Solution](./Financials%20Automation/COMPLETE_BUILD_SOLUTION.md)
- [Database Setup Guide](./Financials%20Automation/DATABASE_SETUP_GUIDE.md)

## Checklist for First Release

- [ ] Verify build environment (run `check-build-environment.bat`)
- [ ] Build installer locally OR push tag for automated build
- [ ] Test installer on clean Windows machine
- [ ] Create GitHub release
- [ ] Upload installer files (if manual)
- [ ] Update documentation with release link
- [ ] Share release link with users

---

**Current Status**: The repository now has everything needed to build and distribute the installer. Just follow Option A or B above to create your first release!
