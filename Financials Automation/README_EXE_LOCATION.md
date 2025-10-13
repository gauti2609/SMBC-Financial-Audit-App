# Windows .exe Installer - Important Information

## ⚠️ The .exe Installer is NOT in this Repository

This is **intentional** and follows software development best practices.

## Why?

1. **File Size**: The .exe installer is 200-400MB, too large for Git version control
2. **Build Artifact**: The installer is a generated file, not source code
3. **Best Practice**: Build artifacts should be distributed via releases, not stored in Git

## How to Get the Installer

### ✅ Option 1: Download from GitHub Releases (Recommended for Users)

1. Go to: [https://github.com/gauti2609/SMBC/releases](https://github.com/gauti2609/SMBC/releases)
2. Download the latest installer file
3. See detailed instructions in [HOW_TO_GET_INSTALLER.md](../HOW_TO_GET_INSTALLER.md)

### ✅ Option 2: Build It Yourself (For Developers)

Follow the build instructions in [EXE Instructions.md](./EXE%20Instructions.md):

```bash
cd "Financials Automation"
pnpm install
pnpm run build
pnpm run build:electron
pnpm run electron:dist:win
```

The installer will be created in `dist-electron/` directory.

### ✅ Option 3: Automated Build via GitHub Actions

The repository now includes a GitHub Actions workflow that automatically builds the installer:

- **Trigger**: Create a Git tag (e.g., `v1.0.0`)
- **Output**: Installer is automatically uploaded to GitHub Releases
- **Workflow**: See `.github/workflows/build-windows-installer.yml`

## What Changed in PR #23

PR #23 added:
- ✅ Complete application source code
- ✅ Build configuration (electron-builder.config.js)
- ✅ Build instructions (EXE Instructions.md)
- ✅ All dependencies and setup files
- ❌ NOT the actual .exe installer (by design)

## Creating a Release

For repository maintainers to create a release with the installer:

1. **Tag the release**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **GitHub Actions will automatically**:
   - Build the Windows installer
   - Create a GitHub Release
   - Attach the .exe files to the release

3. **Users can then download** the installer from the Releases page

## Alternative: Manual Release

If you've already built the installer locally:

1. Go to: https://github.com/gauti2609/SMBC/releases
2. Click "Draft a new release"
3. Create a tag (e.g., `v1.0.0`)
4. Upload the .exe files from `dist-electron/`
5. Publish the release

## Documentation

- [HOW_TO_GET_INSTALLER.md](../HOW_TO_GET_INSTALLER.md) - Complete guide for users
- [EXE Instructions.md](./EXE%20Instructions.md) - Detailed build and installation instructions
- [README.md](./README.md) - Application overview

## Questions?

This is a standard practice in software development. Think of it like:
- GitHub stores the "recipe" (source code)
- GitHub Releases stores the "meal" (built installer)

You wouldn't store millions of copies of the same meal in your recipe book - you'd make it when needed!
