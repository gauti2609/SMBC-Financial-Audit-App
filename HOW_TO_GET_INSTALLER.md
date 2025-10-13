# How to Get the Windows .exe Installer

## Overview

The Windows .exe installer for the **Financial Statement Generator** application is built automatically using GitHub Actions and is available through GitHub Releases.

## Why the .exe is Not in the Repository

The .exe installer files are **build artifacts** that are:
- Large in size (200-400MB)
- Generated from source code during the build process
- Best distributed through GitHub Releases rather than version control

This is a standard software development practice to keep repositories clean and focused on source code.

## Option 1: Download Pre-Built Installer (Recommended)

### For End Users - Download from GitHub Releases:

1. **Navigate to the Releases page**:
   - Go to: https://github.com/gauti2609/SMBC/releases
   - Or click on "Releases" in the right sidebar of the GitHub repository

2. **Select the Latest Release**:
   - Look for the most recent version (e.g., `v1.0.0`)
   - Click on the release to view details

3. **Download the Installer**:
   - Under "Assets", you'll find:
     - `Financial Statement Generator-Setup-X.X.X.exe` - Full installer (recommended)
     - `Financial Statement Generator-X.X.X-Portable.exe` - Portable version
   - Click to download your preferred version

4. **Install the Application**:
   - Run the downloaded .exe file
   - Follow the installation wizard
   - See [EXE Instructions.md](./Financials%20Automation/EXE%20Instructions.md) for detailed installation steps

## Option 2: Build the Installer Yourself

### For Developers - Build from Source:

If you need to customize the application or build a custom version, follow these steps:

### Prerequisites:

1. **Node.js** (v18 or later)
   - Download from: https://nodejs.org/
   
2. **pnpm** package manager
   ```cmd
   npm install -g pnpm
   ```

3. **Git**
   - Download from: https://git-scm.com/

### Build Steps:

1. **Clone the Repository**:
   ```cmd
   git clone https://github.com/gauti2609/SMBC.git
   cd SMBC/Financials Automation
   ```

2. **Install Dependencies**:
   ```cmd
   pnpm install
   ```
   This will automatically run `prisma generate` and `tsr generate`

3. **Build the Web Application**:
   ```cmd
   pnpm run build
   ```

4. **Build Electron Scripts**:
   ```cmd
   pnpm run build:electron
   ```

5. **Generate Windows Installer**:
   ```cmd
   pnpm run electron:dist:win
   ```

6. **Find Your Build**:
   - Location: `Financials Automation/dist-electron/`
   - Files created:
     - `Financial Statement Generator-Setup-1.0.0.exe`
     - `Financial Statement Generator-1.0.0-Portable.exe`

### Build Time:
- Full build process: 10-15 minutes
- Requires stable internet connection for downloading dependencies

## Option 3: Automated GitHub Actions Build

### For Repository Contributors:

The repository includes a GitHub Actions workflow that automatically builds the installer when:

1. **Creating a Release Tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   - This triggers the build workflow
   - Installer is automatically attached to the GitHub Release

2. **Manual Workflow Trigger**:
   - Go to: https://github.com/gauti2609/SMBC/actions
   - Select "Build Windows Installer" workflow
   - Click "Run workflow"
   - The built installer will be available as a workflow artifact

## System Requirements

### For Installation:
- **OS**: Windows 10 (version 1909+) or Windows 11
- **Architecture**: 64-bit (x64)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for application

### For Building:
- **OS**: Windows 10/11, macOS, or Linux (with Windows cross-compilation tools)
- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 5GB for build tools and artifacts

## Troubleshooting

### "I can't find any releases"
- The releases may not have been created yet
- Contact the repository maintainer to create a release
- Or build the installer yourself using Option 2

### "The installer is not signed"
- Windows may show a security warning
- Click "More info" then "Run anyway"
- This is normal for applications without a code signing certificate

### "Build failed with errors"
- Ensure all prerequisites are installed
- Check that you have a stable internet connection
- Delete `node_modules` and run `pnpm install` again
- Check the [Build Fixes Summary](./Financials%20Automation/BUILD_FIXES_SUMMARY.md)

## Getting Help

For detailed installation and setup instructions, refer to:
- [EXE Instructions.md](./Financials%20Automation/EXE%20Instructions.md) - Complete installation guide
- [README.md](./Financials%20Automation/README.md) - Application overview
- [DATABASE_SETUP_GUIDE.md](./Financials%20Automation/DATABASE_SETUP_GUIDE.md) - Database configuration

## Contributing

If you'd like to contribute to the project or improve the build process:
1. Fork the repository
2. Make your changes
3. Submit a pull request
4. The automated build will run on your changes

## License

See [LICENSE](./Financials%20Automation/LICENSE) file for details.
