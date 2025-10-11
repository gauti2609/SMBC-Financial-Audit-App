# EXE Instructions

**⚠️ IMPORTANT: Backend Integration Update**

The Electron app now includes an **integrated backend server** that enables:
- ✅ User authentication and login functionality
- ✅ Local database storage (SQLite)
- ✅ Full API access for all features

**For technical details about the backend integration**, see [ELECTRON_BACKEND_INTEGRATION.md](./ELECTRON_BACKEND_INTEGRATION.md).

---

This document provides step-by-step instructions for building, installing, and setting up the "Financial Statement Generator" application as a `.exe` file for Windows 10/11 systems. These instructions are designed for users with no coding experience and include detailed guidance for every step.

## Table of Contents
1. [Developer Build Instructions](#developer-build-instructions)
2. [System Requirements](#system-requirements)
3. [End-User Installation Instructions](#end-user-installation-instructions)
4. [Database Setup and Configuration](#database-setup-and-configuration)
5. [First-Time Application Setup](#first-time-application-setup)
6. [Troubleshooting](#troubleshooting)
7. [Uninstallation Instructions](#uninstallation-instructions)

---

## Developer Build Instructions

This section is for developers who need to build the Windows installer (`.exe`) from the project source code.

### Prerequisites for Building

Before you begin, ensure your development environment has the following:

#### 1. Node.js (Version 18.x or later)
- **How to check**: Open **Command Prompt** (press `Windows + R`, type `cmd`, press Enter) and type:
  ```cmd
  node -v
  ```
- **If not installed**: Download and install from [nodejs.org](https://nodejs.org/)
- **Installation note**: Choose the "LTS" (Long Term Support) version
- **Run as**: Normal user (no administrator privileges required)

#### 2. pnpm Package Manager
- **How to check**: In Command Prompt, type:
  ```cmd
  pnpm -v
  ```
- **If not installed**: Install globally using npm:
  ```cmd
  npm install -g pnpm
  ```
- **Run as**: Normal user (no administrator privileges required)

#### 3. Git Version Control
- **How to check**: In Command Prompt, type:
  ```cmd
  git --version
  ```
- **If not installed**: Download from [git-scm.com](https://git-scm.com/)

#### 4. System Requirements for Building
- **Operating System**: Windows 10 or Windows 11 (64-bit)
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: At least 5GB free space for build artifacts
- **Internet Connection**: Required for downloading dependencies

### Build Steps

Follow these steps in exact sequence to build the application and generate the Windows installer:

#### Step 1: Clone the Repository
1. **Open Command Prompt**:
   - Press `Windows + R`
   - Type `cmd` and press Enter
   - **Do not run as administrator**

2. **Navigate to your development directory**:
   ```cmd
   cd C:\dev
   ```
   (Create this directory if it doesn't exist: `mkdir C:\dev`)

3. **Clone the project repository**:
   ```cmd
   git clone <repository-url>
   cd <repository-name>
   ```
   **Note**: Replace `<repository-url>` with the actual Git repository URL and `<repository-name>` with the cloned directory name.

#### Step 2: Install Project Dependencies
1. **Ensure you're in the project's root directory**:
   ```cmd
   dir
   ```
   You should see files like `package.json`, `electron-builder.config.js`, etc.

2. **Install all dependencies**:
   ```cmd
   pnpm install
   ```
   - **Expected duration**: 3-10 minutes depending on internet speed
   - **What happens**: Downloads all required packages and automatically runs `prisma generate` and `tsr generate`
   - **Troubleshooting**: If this fails, try `npm install` instead

#### Step 3: Build the Web Application
1. **Build the frontend and server assets**:
   ```cmd
   pnpm run build
   ```
   - **Expected duration**: 2-5 minutes
   - **What happens**: Compiles React frontend, TypeScript backend, and prepares assets for packaging
   - **Output**: Creates a `dist` folder with compiled application files

#### Step 4: Compile Electron Scripts
1. **Compile Electron main and preload scripts**:
   ```cmd
   pnpm run build:electron
   ```
   - **Expected duration**: 30 seconds - 1 minute
   - **What happens**: Converts TypeScript files (`electron/main.ts`, `electron/preload.ts`) to JavaScript
   - **Output**: Creates `electron/main.js` and `electron/preload.js`

#### Step 5: Generate Windows Installer
1. **Create the Windows .exe installer**:
   ```cmd
   pnpm run electron:dist:win
   ```
   - **Expected duration**: 3-8 minutes
   - **What happens**: Uses electron-builder to package the application into a Windows installer
   - **Output location**: `dist-electron` folder
   - **Files created**:
     - `Financial Statement Generator-Setup-1.0.0.exe` (main installer)
     - `Financial Statement Generator-1.0.0-Portable.exe` (portable version)

#### Step 6: Verify Build Success
1. **Check the output directory**:
   ```cmd
   dir dist-electron
   ```
   You should see the installer files listed above.

2. **File sizes**: The installer should be approximately 200-400MB depending on dependencies.

---

## System Requirements

### For End-User Installation

#### Minimum System Requirements
- **Operating System**: Windows 10 (version 1909 or later) or Windows 11
- **Architecture**: 64-bit only (x64)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for application installation, additional space for data
- **Network**: Internet connection required for database connectivity and updates

#### Pre-Installation Verification
The installer will automatically check these requirements:
- **Windows Version Check**: Installer will abort if Windows version is older than Windows 10
- **Architecture Check**: Installer will abort if system is 32-bit
- **Disk Space Check**: Installer will abort if less than 500MB free space available
- **Administrator Rights**: Installer will request elevation for system-level integration

---

## End-User Installation Instructions

This section is for end-users who have received the `Financial Statement Generator-Setup-X.X.X.exe` file.

### Installation Process

#### Step 1: Locate the Installer
1. Find the installer file (e.g., `Financial Statement Generator-Setup-1.0.0.exe`)
2. **File location**: Usually in your Downloads folder or shared network location
3. **File size**: Approximately 200-400MB

#### Step 2: Run the Installer
1. **Double-click** the installer file
2. **Windows Security Warning**: 
   - If Windows shows "Windows protected your PC", click "More info" then "Run anyway"
   - This is normal for new applications without digital signatures
3. **User Account Control (UAC)**:
   - Windows will ask "Do you want to allow this app to make changes to your device?"
   - Click **"Yes"** (Administrator privileges are required for system integration)

#### Step 3: Installation Wizard
1. **Welcome Screen**:
   - Click **"Next"** to continue

2. **License Agreement**:
   - Read the license terms
   - Select **"I Agree"** if you accept the terms
   - Click **"Next"**

3. **Component Selection** (if shown):
   - Default selection: "Core application files, templates, and Windows 10/11 integration components"
   - **Recommended**: Keep default selection
   - Click **"Next"**

4. **Choose Installation Directory**:
   - **Default location**: `C:\Program Files\Financial Statement Generator`
   - **Recommendation**: Use default location for optimal Windows 10/11 integration
   - **To change**: Click "Browse...", select new folder, click "OK"
   - Click **"Install"**

#### Step 4: Installation Progress
1. **Progress Bar**: Shows installation status
2. **What's happening**:
   - Copying application files
   - Creating application data directories
   - Registering file associations (.xlsx, .csv, .json)
   - Setting up Windows 10/11 integration
   - Adding Windows Defender exclusions
   - Creating desktop and Start Menu shortcuts

#### Step 5: Installation Complete
1. **Completion Screen Options**:
   - ☑️ **"Launch Financial Statement Generator now"** - Recommended for first-time setup
   - ☑️ **"View Getting Started Guide"** - Opens helpful documentation
2. Click **"Finish"**

### Post-Installation Verification

#### Shortcuts Created
- **Desktop**: "Financial Statement Generator" icon
- **Start Menu**: Under "Financial Tools" folder
  - Financial Statement Generator
  - Uninstall Financial Statement Generator
  - Financial Exports Folder (quick access to output directory)

#### File Associations
The application is now associated with:
- **Excel files** (.xlsx) - Custom Excel icon in File Explorer
- **CSV files** (.csv) - Custom CSV icon in File Explorer
- **JSON files** (.json) - Available in "Open With" menu

#### Directory Structure Created
```
%APPDATA%\Financial Statement Generator\
├── exports\
├── imports\
├── templates\
├── backups\
└── logs\

%LOCALAPPDATA%\Financial Statement Generator\
├── cache\
└── temp\

%USERPROFILE%\Documents\Financial Exports\
├── Balance Sheets\
├── P&L Statements\
├── Cash Flow\
├── Notes\
└── Getting Started.txt
```

---

## Database Setup and Configuration

The Financial Statement Generator requires a PostgreSQL database connection. The application is designed to connect to a **remote PostgreSQL server** for multi-user environments.

### Database Server Requirements

#### PostgreSQL Server Setup
1. **PostgreSQL Version**: 12.x or later recommended
2. **Server Configuration**:
   - Port: 5432 (default)
   - Remote connections enabled
   - Authentication method: Password (md5 or scram-sha-256)
3. **Database Creation**:
   ```sql
   CREATE DATABASE financialsdb;
   CREATE USER SMBC WITH PASSWORD 'Smbc@2025';
   GRANT ALL PRIVILEGES ON DATABASE financialsdb TO SMBC;
   ```

#### Network Configuration
1. **Firewall**: Ensure port 5432 is open for incoming connections
2. **PostgreSQL Configuration** (`postgresql.conf`):
   ```
   listen_addresses = '*'
   port = 5432
   ```
3. **Client Authentication** (`pg_hba.conf`):
   ```
   host    financialsdb    SMBC    192.168.0.0/24    md5
   ```

### Application Database Configuration

#### First-Time Database Setup
1. **Launch the Application**:
   - Use desktop shortcut or Start Menu
   - Application will attempt to connect to default database

2. **Database Connection Required**:
   - If connection fails, you'll see a "Database Connection Required" message
   - The "Database Configuration" modal may open automatically

3. **Configure Database Connection**:
   - Click **"Configure Database"** button if modal doesn't open automatically
   - Located near the "Database Connection Status" in the sidebar

#### Database Configuration Parameters

**Required Information** (obtain from your database administrator):
- **Host/Server IP**: IP address of your PostgreSQL server (e.g., `192.168.0.13`)
- **Port**: Database port number (usually `5432`)
- **Username**: Database username (e.g., `SMBC`)
- **Password**: Database password (e.g., `Smbc@2025`)
- **Database Name**: Database name (e.g., `financialsdb`)

#### Configuration Steps
1. **Open Database Configuration Modal**:
   - Click the gear icon (⚙️) next to "Database Connection Status"

2. **Enter Connection Details**:
   ```
   Server IP/Host: 192.168.0.13
   Port: 5432
   Username: SMBC
   Password: Smbc@2025
   Database Name: financialsdb
   ```

3. **Test Connection**:
   - Click **"Test Connection"** button
   - Wait for "Connection successful!" message
   - **If test fails**: Verify server IP, credentials, and network connectivity

4. **Save Configuration**:
   - Click **"Save & Connect"**
   - Configuration is saved locally for future sessions

#### Automatic Database Initialization
Once connected, the application will automatically:
1. **Create required tables** using Prisma migrations
2. **Seed default data**:
   - Major heads (34 standard accounting heads)
   - Groupings (80+ standard groupings)
   - Note selections (60+ default notes for compliance)
3. **Create Minio buckets** for file storage

---

## First-Time Application Setup

### Initial Configuration

#### Step 1: License Validation (if applicable)
1. **Navigate to License Page**:
   - Use sidebar navigation: "License"
2. **Enter License Key**:
   - Input provided license key
   - Click "Validate License"
3. **Verify License Information**:
   - Check company name, expiration date, user limits

#### Step 2: Company Setup
1. **Create First Company**:
   - Navigate to company management
   - Click "Add Company"
   - Enter company details:
     - Company Name
     - Display Name
     - Description
2. **Select Active Company**:
   - Choose from company dropdown in header

#### Step 3: Basic Data Setup
1. **Common Control Configuration**:
   - Enter entity information
   - Set financial year dates
   - Configure display preferences

2. **Upload Trial Balance**:
   - Navigate to "Trial Balance"
   - Click "Upload File" or "Add Entry"
   - Map ledger accounts to major heads

### Application Features Overview

#### Financial Statements
- **Balance Sheet**: Automatically generated from trial balance
- **Profit & Loss Statement**: Income and expense categorization
- **Cash Flow Statement**: Operating, investing, financing activities
- **Notes to Accounts**: Schedule III compliant disclosures

#### Schedules and Disclosures
- **PPE Schedule**: Property, plant, and equipment movements
- **Share Capital**: Equity structure and shareholding pattern
- **Related Party Transactions**: AS 18 compliant disclosures
- **Contingent Liabilities**: AS 29 commitments and contingencies

#### Compliance Features
- **Aging Schedules**: Receivables and payables aging analysis
- **Ratio Analysis**: Financial ratios with variance explanations
- **Deferred Tax**: AS 22 deferred tax calculations

---

## Troubleshooting

### Common Installation Issues

#### Issue 1: "Windows protected your PC" Warning
**Symptoms**: Blue screen with "Microsoft Defender SmartScreen prevented an unrecognized app from starting"
**Solution**:
1. Click "More info"
2. Click "Run anyway"
**Cause**: Application lacks digital signature (normal for internal distribution)

#### Issue 2: Installation Fails with "Insufficient Privileges"
**Symptoms**: Installation aborts with permission error
**Solution**:
1. Right-click installer file
2. Select "Run as administrator"
3. Click "Yes" when prompted by UAC

#### Issue 3: "Disk Space Insufficient" Error
**Symptoms**: Installer aborts during space check
**Solution**:
1. Free up disk space (minimum 500MB required)
2. Run Disk Cleanup: `Windows + R`, type `cleanmgr`, press Enter
3. Restart installer

#### Issue 4: Antivirus Blocking Installation
**Symptoms**: Antivirus software quarantines installer or blocks execution
**Solution**:
1. Temporarily disable real-time protection
2. Add installer to antivirus exclusions
3. Run installer
4. Re-enable antivirus protection

### Database Connection Issues

#### Issue 1: "Could not resolve host" Error
**Symptoms**: Database connection test fails with host resolution error
**Diagnosis**: Network connectivity or incorrect IP address
**Solutions**:
1. **Verify IP Address**: Ping the database server
   ```cmd
   ping 192.168.0.13
   ```
2. **Check Network Connection**: Ensure both machines are on same network
3. **Update IP Address**: Server IP may have changed (DHCP)

#### Issue 2: "Connection refused" Error
**Symptoms**: Connection test fails with "Connection refused to [IP]:5432"
**Diagnosis**: PostgreSQL server not running or firewall blocking
**Solutions**:
1. **Verify PostgreSQL Service**: Check if PostgreSQL is running on server
2. **Firewall Configuration**: Ensure port 5432 is open
3. **PostgreSQL Configuration**: Check `listen_addresses` in postgresql.conf

#### Issue 3: "Password authentication failed"
**Symptoms**: Connection test fails with authentication error
**Diagnosis**: Incorrect username or password
**Solutions**:
1. **Verify Credentials**: Double-check username and password
2. **Check User Permissions**: Ensure user has database access
3. **Reset Password**: Contact database administrator

#### Issue 4: "Database does not exist"
**Symptoms**: Connection test fails with database not found
**Solutions**:
1. **Create Database**: Ask administrator to create `financialsdb`
2. **Verify Database Name**: Check spelling of database name
3. **Check User Permissions**: Ensure user can access the database

### Application Runtime Issues

#### Issue 1: Slow Application Performance
**Solutions**:
1. **Check System Resources**: Task Manager → Performance tab
2. **Database Optimization**: Ensure database server has adequate resources
3. **Network Latency**: Test network speed to database server
4. **Clear Cache**: Delete contents of `%LOCALAPPDATA%\Financial Statement Generator\cache`

#### Issue 2: File Export Failures
**Solutions**:
1. **Check Permissions**: Ensure write access to Documents\Financial Exports
2. **Disk Space**: Verify sufficient space for export files
3. **Antivirus Exclusion**: Add export directory to antivirus exclusions

#### Issue 3: Application Won't Start
**Solutions**:
1. **Check Event Logs**: Windows Event Viewer → Application logs
2. **Reset Configuration**: Delete `%APPDATA%\Financial Statement Generator\preferences.json`
3. **Reinstall Application**: Uninstall and reinstall

### Getting Help

#### Log Files Location
- **Application Logs**: `%APPDATA%\Financial Statement Generator\logs\`
- **Database Logs**: Check with database administrator
- **Windows Event Logs**: Event Viewer → Windows Logs → Application

#### Support Information
- **Documentation**: `%USERPROFILE%\Documents\Financial Exports\Getting Started.txt`
- **Version Information**: Help → About in application menu
- **System Information**: `Windows + R`, type `msinfo32`, press Enter

---

## Uninstallation Instructions

### Standard Uninstallation

#### Method 1: Windows Settings (Windows 10/11)
1. **Open Settings**:
   - Press `Windows + I`
   - Click "Apps"
2. **Find Application**:
   - Search for "Financial Statement Generator"
   - Click on the application
3. **Uninstall**:
   - Click "Uninstall"
   - Click "Uninstall" again to confirm
4. **Follow Uninstaller**:
   - UAC prompt: Click "Yes"
   - Follow uninstallation wizard

#### Method 2: Control Panel (All Windows Versions)
1. **Open Control Panel**:
   - Press `Windows + R`
   - Type `appwiz.cpl`
   - Press Enter
2. **Select Application**:
   - Find "Financial Statement Generator"
   - Click to select
3. **Uninstall**:
   - Click "Uninstall/Change"
   - Follow uninstallation wizard

### Uninstallation Process

#### Step 1: Uninstaller Welcome
1. Click "Next" to proceed with uninstallation

#### Step 2: Data Removal Option
**Important Decision**: The uninstaller will ask:
> "Do you want to remove all application data including your settings, exports, and backups?"

**Option A - Keep Data** (Recommended):
- Select **"No"**
- Preserves:
  - Financial exports in Documents folder
  - Application settings and preferences
  - Database configurations
  - Backup files and logs
- **Use when**: Planning to reinstall or want to keep financial data

**Option B - Remove All Data**:
- Select **"Yes"**
- **Permanently deletes**:
  - All financial exports
  - Application settings
  - Database configurations
  - Backup files and logs
- **Use when**: Permanent removal from system

#### Step 3: Uninstallation Progress
- Progress bar shows removal status
- **Items removed**:
  - Application files from Program Files
  - Desktop and Start Menu shortcuts
  - File associations (.xlsx, .csv, .json)
  - Registry entries
  - Windows Defender exclusions

#### Step 4: Completion
1. Click "Finish" when complete
2. **Restart recommended** for complete cleanup

### Manual Cleanup (if needed)

If automatic uninstallation fails, manually remove:

#### Remaining Files
```
C:\Program Files\Financial Statement Generator\
%APPDATA%\Financial Statement Generator\
%LOCALAPPDATA%\Financial Statement Generator\
%USERPROFILE%\Documents\Financial Exports\
```

#### Registry Entries
**⚠️ Warning**: Only edit registry if you're experienced with Windows administration
- `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Financial Statement Generator`
- `HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings\Financial Statement Generator`

#### Shortcuts
- Desktop: "Financial Statement Generator.lnk"
- Start Menu: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Financial Tools\`

### Post-Uninstallation Verification

#### Confirm Removal
1. **Check Program Files**: Verify folder is deleted
2. **Check Start Menu**: Shortcuts should be removed
3. **Check File Associations**: .xlsx files should open with Excel again
4. **Check Desktop**: Application icon should be removed

#### Data Preservation Check
If you chose to keep data:
- **Financial Exports**: `%USERPROFILE%\Documents\Financial Exports\` should remain
- **Settings**: Can be imported during reinstallation

---

## Environment Variables Reference

### Client Application Environment Variables

When deploying the `.exe` in a network environment, the following environment variables may need to be configured:

#### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
  - **Format**: `postgresql://username:password@host:port/database`
  - **Example**: `postgresql://SMBC:Smbc@2025@192.168.0.13:5432/financialsdb`
  - **Current Value**: `postgresql://postgres:postgres@postgres:5432/app` (development default)
  - **Must Change**: Yes, for production deployment

#### Optional Variables
- `NODE_ENV`: Application environment
  - **Current Value**: `production` (set by installer)
  - **Must Change**: No, correct for deployed application

- `JWT_SECRET`: JSON Web Token signing secret
  - **Current Value**: `bNreLecdncbIC1jEPdtvwm57VNM0T3iQ0qHfE7xIQyk=`
  - **Must Change**: No for standalone deployment, Yes for network deployment

- `ADMIN_PASSWORD`: Administrative password
  - **Current Value**: `WkRnL4JjkM4rMoZnXGgqG4`
  - **Must Change**: Yes, for security in production

### Setting Environment Variables for Deployed Application

#### Method 1: System Environment Variables
1. Press `Windows + R`, type `sysdm.cpl`, press Enter
2. Click "Environment Variables"
3. Under "System Variables", click "New"
4. Add variable name and value
5. Restart application

#### Method 2: Application Configuration File
Create `config.env` in application installation directory:
```
DATABASE_URL=postgresql://SMBC:Smbc@2025@192.168.0.13:5432/financialsdb
NODE_ENV=production
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Compatible With**: Windows 10 (1909+), Windows 11  
**Application Version**: 1.0.0
