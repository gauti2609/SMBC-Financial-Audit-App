# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Financial Statement Generator application.

## Available Workflows

### 🪟 Windows Build and Test (`windows-build-test.yml`)

**Purpose**: Automated building and testing on Windows 10/11 environment

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via "Run workflow" button

**What it does**:
1. **Build and Test Job** (Runs on all triggers):
   - Sets up Windows environment with Node.js 18 and pnpm
   - Installs all project dependencies
   - Verifies Prisma client generation
   - Runs TypeScript type checking
   - Runs ESLint code linting
   - Builds the application
   - Compiles Electron scripts
   - Runs diagnostic tests
   - Uploads build artifacts

2. **Build Windows Installer Job** (Runs only on `main` branch):
   - Generates Windows installer (.exe)
   - Creates portable executable
   - Uploads installer files for download

**Artifacts**:
- `build-artifacts-windows`: Compiled application files
- `windows-installer`: Windows .exe installer (main branch only)
- `build-logs-windows`: Error logs (only if build fails)

## Quick Start

### View Workflows
1. Go to the **Actions** tab in GitHub
2. See all workflow runs and their status

### Trigger Manually
1. Go to **Actions** → **Windows Build and Test**
2. Click **"Run workflow"**
3. Select branch and click **"Run workflow"**

### Download Build Artifacts
1. Open a completed workflow run
2. Scroll to the bottom
3. Click on artifact name to download

## Documentation

For detailed setup and troubleshooting:

- **Quick Setup**: See `Financials Automation/GITHUB_ACTIONS_QUICK_START.md`
- **Complete Guide**: See `Financials Automation/GITHUB_ACTIONS_SETUP_GUIDE.md`
- **Troubleshooting**: See `Financials Automation/GITHUB_ACTIONS_TROUBLESHOOTING.md`

## Modifying Workflows

To modify workflows:

1. Edit `.yml` files in this directory
2. Test syntax: `yamllint windows-build-test.yml`
3. Commit and push changes
4. Monitor the workflow run to verify changes

## Common Issues

### Workflow Not Running
- Check if GitHub Actions is enabled (Settings → Actions)
- Verify file is in `.github/workflows/` directory
- Ensure branch matches workflow triggers

### Build Failing
- Check workflow logs for error details
- Test commands locally first
- Verify all files are committed

### Permission Errors
- Go to Settings → Actions → General
- Set permissions to "Read and write"
- Enable "Allow GitHub Actions to create and approve pull requests"

## Support

For help:
1. Check workflow logs for error messages
2. Review troubleshooting guide
3. Open an issue with workflow run link

---

**Last Updated**: January 2025
