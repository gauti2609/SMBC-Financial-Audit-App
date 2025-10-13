# Financial Statement Generator - Complete User Guide

## Table of Contents
1. [Running the Windows .exe Installer](#1-running-the-windows-exe-installer)
2. [PostgreSQL Database Setup](#2-postgresql-database-setup)
3. [VBA Functionalities Included](#3-vba-functionalities-included)
4. [Enhanced Features from app.trysolid.com](#4-enhanced-features-from-apptrysolidcom)
5. [Web App Instructions for Network Deployment](#5-web-app-instructions-for-network-deployment)

---

## 1. Running the Windows .exe Installer

### Prerequisites
- **Operating System:** Windows 10 (version 1909+) or Windows 11
- **Architecture:** 64-bit system
- **Disk Space:** ~150 MB free space
- **Administrator Rights:** For installation

### Installation Steps

#### Step 1: Download the Installer
- **File:** `Financial Statement Generator-Setup-1.0.0.exe`
- **Location:** `Financials Automation/dist-electron/`
- **Size:** 185 KB (compressed), expands to ~118 MB during installation

#### Step 2: Run the Installer
1. **Navigate** to the download location
2. **Double-click** `Financial Statement Generator-Setup-1.0.0.exe`

3. **Windows SmartScreen Warning (Expected)**
   - You will see: "Windows protected your PC"
   - **Reason:** The installer is not digitally code-signed
   - **Action:** 
     - Click **"More info"**
     - Click **"Run anyway"**
   - This is safe if you downloaded from the official repository

#### Step 3: Installation Wizard
1. **Welcome Screen**
   - Click **"Next"**

2. **License Agreement**
   - Read the MIT License
   - Click **"I Agree"**

3. **Installation Location**
   - Default: `C:\Program Files\Financial Statement Generator\`
   - You can change if needed
   - Click **"Next"**

4. **Installation Options**
   - ☑ Create Desktop Shortcut (Recommended)
   - ☑ Create Start Menu Entry
   - Click **"Install"**

5. **Installation Progress**
   - Wait 1-2 minutes while files are extracted and installed

6. **Completion**
   - ☑ Launch Financial Statement Generator
   - Click **"Finish"**

### System Requirements

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows 10 (1909+) or Windows 11 |
| **CPU** | Intel Core i3 or equivalent |
| **RAM** | 4 GB minimum, 8 GB recommended |
| **Storage** | 150 MB for application |
| **Display** | 1366x768 minimum, 1920x1080 recommended |
| **Database** | PostgreSQL 16+ required |
| **Network** | Required for network deployment only |

### Troubleshooting Installation

#### Issue: "This app can't run on your PC"
**Solution:** Ensure you're running 64-bit Windows. Check: Settings → System → About → System type

#### Issue: Installation fails with "Access Denied"
**Solution:** 
1. Right-click the installer
2. Select "Run as administrator"
3. Approve UAC prompt

#### Issue: Antivirus blocks installation
**Solution:**
1. Temporarily disable antivirus
2. Install the application
3. Re-enable antivirus
4. Add Financial Statement Generator to whitelist

---

## 2. PostgreSQL Database Setup

### Why PostgreSQL is Required
The application uses PostgreSQL for:
- **Data Persistence:** Storing trial balance, financial data
- **Multi-Company Support:** Managing multiple companies in one database
- **User Management:** Authentication and authorization
- **License Management:** Network deployment tracking
- **Audit Trail:** Recording all data changes

### Installation Options

#### Option A: Local Database (Single User)
Best for: Individual use, offline operation

#### Option B: Network Database (Multi-User)
Best for: Teams, departments, shared access across network

---

### PostgreSQL Installation - Step by Step

#### Step 1: Download PostgreSQL

1. Visit: **https://www.postgresql.org/download/windows/**
2. Click **"Download the installer"**
3. Choose **PostgreSQL 16.x** (latest stable version)
4. Download the Windows x86-64 installer

#### Step 2: Run PostgreSQL Installer

1. **Double-click** the downloaded `.exe` file
2. **Setup Wizard**
   - Click **"Next"** through welcome screen

3. **Installation Directory**
   - Default: `C:\Program Files\PostgreSQL\16`
   - Click **"Next"**

4. **Select Components**
   - ☑ PostgreSQL Server (Required)
   - ☑ pgAdmin 4 (Recommended - GUI tool)
   - ☑ Stack Builder (Optional)
   - ☑ Command Line Tools (Recommended)
   - Click **"Next"**

5. **Data Directory**
   - Default: `C:\Program Files\PostgreSQL\16\data`
   - Click **"Next"**

6. **Password** (IMPORTANT)
   - Enter a strong password for the `postgres` superuser
   - **Example:** `YourSecurePassword123!`
   - **Write this down!** You'll need it later
   - Re-enter to confirm
   - Click **"Next"**

7. **Port**
   - Default: **5432**
   - Leave as default unless you have a conflict
   - Click **"Next"**

8. **Locale**
   - Default: [Default locale]
   - Click **"Next"**

9. **Pre-Installation Summary**
   - Review settings
   - Click **"Next"**

10. **Installation**
    - Wait 5-10 minutes
    - Click **"Finish"**
    - Uncheck "Launch Stack Builder" for now

#### Step 3: Verify PostgreSQL is Running

**Method 1: Services**
1. Press `Windows + R`
2. Type `services.msc`, press Enter
3. Find "postgresql-x64-16"
4. Status should show **"Running"**

**Method 2: pgAdmin**
1. Open **pgAdmin 4** from Start Menu
2. Enter the master password (first time only)
3. Expand "Servers" → "PostgreSQL 16"
4. Enter the postgres password you set
5. If connected successfully, PostgreSQL is working

#### Step 4: Create Application Database

**Option A: Using pgAdmin 4 (Easier)**

1. **Open pgAdmin 4**
2. Connect to PostgreSQL 16 (enter password)
3. **Right-click** on "Databases"
4. Select **"Create" → "Database..."**
5. **Database Name:** `financialsdb`
6. **Owner:** postgres
7. Click **"Save"**

**Option B: Using Command Line**

1. Open **Command Prompt**
2. Navigate to PostgreSQL bin:
   ```cmd
   cd "C:\Program Files\PostgreSQL\16\bin"
   ```
3. Connect to PostgreSQL:
   ```cmd
   psql -U postgres
   ```
4. Enter your postgres password
5. Create database:
   ```sql
   CREATE DATABASE financialsdb;
   ```
6. Verify:
   ```sql
   \l
   ```
   You should see `financialsdb` in the list
7. Exit:
   ```sql
   \q
   ```

#### Step 5: Create Application User (Optional but Recommended)

For better security, create a dedicated user:

```sql
-- Connect to PostgreSQL (psql -U postgres)

-- Create user
CREATE USER smbc_app WITH PASSWORD 'AppPassword123!';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE financialsdb TO smbc_app;

-- Connect to the database
\c financialsdb

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO smbc_app;
```

---

### Configuring the Application

#### First Launch Configuration

1. **Launch** Financial Statement Generator
2. You'll see: **"Database Configuration Required"**
3. **Enter Database Details:**

   | Field | Value | Example |
   |-------|-------|---------|
   | **Host** | Server address | `localhost` (for local) or `192.168.1.100` (for network) |
   | **Port** | Database port | `5432` |
   | **Username** | Database user | `postgres` or `smbc_app` |
   | **Password** | User password | Your PostgreSQL password |
   | **Database** | Database name | `financialsdb` |

4. **Click "Test Connection"**
   - Should show: "✓ Connection Successful"
   - If error, verify password and database name

5. **Click "Save & Connect"**
   - Application will initialize database schema
   - Creates all necessary tables automatically
   - Takes 10-30 seconds on first run

#### Updating .env File (Alternative Method)

If you prefer to configure via file:

1. Navigate to installation directory
2. Open `.env` file in Notepad
3. Update the DATABASE_URL:
   ```env
   DATABASE_URL=******your_password@localhost:5432/financialsdb
   ```
4. Save and restart the application

---

### Network Deployment Database Setup

#### Server Setup

1. **Install PostgreSQL** on a central server
2. **Configure for Network Access:**

   Edit `postgresql.conf`:
   ```
   # Location: C:\Program Files\PostgreSQL\16\data\postgresql.conf
   listen_addresses = '*'    # Listen on all network interfaces
   ```

   Edit `pg_hba.conf`:
   ```
   # Location: C:\Program Files\PostgreSQL\16\data\pg_hba.conf
   # Add at the end:
   host    financialsdb    all    192.168.1.0/24    md5
   ```
   Replace `192.168.1.0/24` with your network range

3. **Configure Windows Firewall:**
   - Allow inbound connections on port 5432
   - Windows Firewall → Inbound Rules → New Rule
   - Port: TCP 5432
   - Allow the connection

4. **Restart PostgreSQL** service

#### Client Configuration

On each user's machine:
1. Install Financial Statement Generator
2. Enter server IP address in Host field
   - Example: `192.168.1.100`
3. Test connection before saving

---

## 3. VBA Functionalities Included

All VBA features from `VBA_Module1.bas` have been implemented in the web application with enhanced functionality:

### ✅ Core VBA Features Implemented

#### 1. **Trial Balance Management**
- **VBA:** Setup_InputTrialBalanceSheet, data validation
- **Web App:** 
  - ✅ Excel/CSV import with drag-drop
  - ✅ Real-time validation
  - ✅ Auto-mapping to Major Heads, Minor Heads, Grouping
  - ✅ Conditional formatting for invalid entries
  - ✅ Bulk edit capabilities

#### 2. **Common Control Setup**
- **VBA:** Setup_CommonControlSheet, entity information
- **Web App:**
  - ✅ Entity profile management
  - ✅ Financial year configuration
  - ✅ Currency and unit selection
  - ✅ Custom formatting preferences
  - ✅ Signature setup for reports

#### 3. **Schedule Management**
##### Property, Plant & Equipment (PPE)
- **VBA:** Setup_InputPPEScheduleSheet
- **Web App:**
  - ✅ Asset addition, disposal, depreciation
  - ✅ WDV and SLM methods
  - ✅ CWIP (Capital Work in Progress) tracking
  - ✅ Excel import for bulk data

##### Intangible Assets
- **VBA:** Setup_InputIntangibleScheduleSheet
- **Web App:**
  - ✅ Intangible asset lifecycle management
  - ✅ Amortization calculations
  - ✅ Impairment tracking

##### Investments
- **VBA:** Setup_InputInvestmentsSheet
- **Web App:**
  - ✅ Current and non-current investments
  - ✅ Fair value tracking
  - ✅ Investment income calculation

##### Share Capital
- **VBA:** Setup_InputShareCapitalSheet
- **Web App:**
  - ✅ Authorized, issued, subscribed capital
  - ✅ Share class management
  - ✅ Changes during the year tracking

#### 4. **Related Party Transactions**
- **VBA:** Setup_InputRelatedPartiesSheet with dropdowns
- **Web App:**
  - ✅ Relationship type classification
  - ✅ Transaction type tracking
  - ✅ Disclosure generation
  - ✅ Excel import support

#### 5. **Contingent Liabilities**
- **VBA:** Setup_InputContingentLiabilitiesSheet
- **Web App:**
  - ✅ Nature and amount tracking
  - ✅ Status monitoring
  - ✅ Disclosure notes

#### 6. **Employee Benefits**
- **VBA:** Setup_InputEmployeeBenefitsSheet
- **Web App:**
  - ✅ Gratuity, leave encashment, PF
  - ✅ Actuarial calculations
  - ✅ Disclosure requirements

#### 7. **Tax Management**
- **VBA:** Tax computation sheets
- **Web App:**
  - ✅ Current tax calculation
  - ✅ Deferred tax entries
  - ✅ MAT credit tracking
  - ✅ Effective tax rate computation

#### 8. **Receivables & Payables Aging**
- **VBA:** Setup_InputLedgerSheets with formulas
- **Web App:**
  - ✅ Aging analysis (0-30, 31-60, 61-90, 90+ days)
  - ✅ Debtor and creditor classification
  - ✅ Auto-calculation of aging buckets
  - ✅ Excel import for ledger data

#### 9. **Financial Statement Generation**
- **VBA:** Refresh_Financials, Generate_IndAS_Layout
- **Web App:**
  - ✅ Balance Sheet (Schedule III format)
  - ✅ Profit & Loss Statement
  - ✅ Cash Flow Statement (indirect method)
  - ✅ Notes to Accounts (auto-generated)
  - ✅ Significant Accounting Policies
  - ✅ Ratio Analysis
  - ✅ All schedules (1-19)

#### 10. **Excel Export with Formulas**
- **VBA:** Export with cell formatting and formulas
- **Web App:**
  - ✅ Professional Excel export
  - ✅ Live formulas (calculations update when you change values)
  - ✅ Advanced formatting (colors, borders, fonts)
  - ✅ Multiple sheets in single workbook
  - ✅ Print-ready layouts

#### 11. **Data Validation & Conditional Formatting**
- **VBA:** Apply_Conditional_Formatting, Validate_Trial_Balance_Data
- **Web App:**
  - ✅ Real-time validation on all inputs
  - ✅ Color-coded error highlighting
  - ✅ Dropdown lists for controlled inputs
  - ✅ Auto-completion for repeated entries

#### 12. **Accounting Policies**
- **VBA:** Template-based policy generation
- **Web App:**
  - ✅ Policy template library
  - ✅ Customizable policy text
  - ✅ Industry-specific policies
  - ✅ Auto-insertion in financial statements

### ✅ Additional VBA-Style Features

#### 13. **One-Click Setup**
- **VBA:** Final_Setup_And_Button_Creation
- **Web App:**
  - ✅ Guided setup wizard
  - ✅ Step-by-step configuration
  - ✅ Default templates
  - ✅ Quick start options

#### 14. **Data Persistence**
- **VBA:** Excel file storage
- **Web App:**
  - ✅ PostgreSQL database storage
  - ✅ Auto-save on every change
  - ✅ Version history
  - ✅ Backup and restore

#### 15. **Error Handling & Debugging**
- **VBA:** Debug.Print statements, error handlers
- **Web App:**
  - ✅ Comprehensive error messages
  - ✅ Validation feedback
  - ✅ Help tooltips
  - ✅ System logs for admins

---

## 4. Enhanced Features from app.trysolid.com

Beyond VBA functionality, the web application includes advanced enterprise features:

### 4.i) Server-Style Database Setup

#### Centralized Database Architecture
- **PostgreSQL Server:** Central data repository
- **Benefits:**
  - Single source of truth
  - Real-time data sync across all clients
  - Concurrent user access
  - Professional backup strategies
  - Scalable to 100+ users

#### Network Deployment Options

**Option 1: LAN Deployment**
```
Server (Database)          Client Machines
192.168.1.100:5432    →    Financial App (User 1)
                      →    Financial App (User 2)
                      →    Financial App (User 3)
```

**Option 2: Cloud Deployment**
```
AWS/Azure PostgreSQL  →    Any location with internet
                      →    Remote users
                      →    Branch offices
```

**Option 3: Hybrid**
```
Local Server          →    Office LAN users
     ↓
Cloud Sync            →    Remote users via internet
```

#### Database Connection Configuration

Each client connects via:
```
Host: 192.168.1.100 (or database.company.com)
Port: 5432
Database: financialsdb
User: Company-specific credentials
SSL: Optional but recommended
```

#### Advantages Over VBA
| Feature | VBA | Web App |
|---------|-----|---------|
| Data Location | Excel file (local) | PostgreSQL (server) |
| Concurrent Users | No | Yes (unlimited) |
| Real-time Sync | No | Yes |
| Backup | Manual | Automated |
| Security | File-based | User authentication + encryption |
| Audit Trail | No | Yes (all changes logged) |

---

### 4.ii) License Access from Server for Network Use

#### License Management System

The application includes a sophisticated licensing system for network deployment:

#### License Features

1. **Centralized License Server**
   - Licenses stored in database
   - Real-time validation
   - Usage tracking
   - Remote activation/deactivation

2. **License Types**
   - **Single User:** 1 user, 1 company
   - **Team:** 5 users, 3 companies
   - **Department:** 20 users, 10 companies
   - **Enterprise:** Unlimited users, unlimited companies
   - **Trial:** 30 days, limited features

3. **Network License Controls**
   - **IP Address Restrictions:** Only authorized IPs can connect
   - **Concurrent User Limits:** Max users logged in simultaneously
   - **Company Limits:** Max companies per license
   - **Feature Flags:** Enable/disable specific features per license

4. **License Validation Flow**
   ```
   Client Launch → License Key Check → Server Validation
                                    ↓
                            Valid? → Allow Access
                            Invalid → Deny + Show Message
                            Expired → Renewal Prompt
   ```

#### How It Works

**First Time Setup:**
1. Admin purchases license
2. Receives license key: `SMBC-XXXX-XXXX-XXXX-XXXX`
3. Enters key in admin panel
4. System validates with license server
5. License activates for network

**User Connection:**
1. User opens application
2. App checks license status
3. Validates:
   - License is active
   - Not expired
   - User count within limit
   - IP address authorized (if restricted)
4. Grants access if all checks pass

**License Database Schema:**
```sql
License {
  licenseKey: "SMBC-1234-5678-9012"
  companyName: "ABC Ltd"
  maxUsers: 10
  maxCompanies: 5
  expiresAt: 2025-12-31
  isActive: true
  allowedIPs: ["192.168.1.0/24"]
  activeUsers: 3 (real-time count)
  activeCompanies: 2 (real-time count)
}
```

#### License Management Features

**For Administrators:**
- View license status
- See active users count
- Monitor company usage
- Extend license expiry
- Add/remove IP restrictions
- Generate usage reports

**For Users:**
- Automatic license validation
- Grace period for expired licenses (3 days)
- Renewal reminders
- License status indicator in UI

**API Endpoints:**
- `validateLicense()` - Check license validity
- `getLicenseInfo()` - Get license details
- `updateLicenseUsage()` - Track active users/companies

#### Network Deployment Scenario

**Example: ABC Company with 50 employees**

1. **Purchase License:**
   - Enterprise license for 50 users, 20 companies
   - License key: `SMBC-ENT-ABC-2025`

2. **Server Setup:**
   - Install PostgreSQL on server (192.168.0.10)
   - Install Financial Statement Generator web app
   - Configure license in admin panel

3. **Client Setup:**
   - Install Financial Statement Generator on 50 PCs
   - Each PC connects to 192.168.0.10:5432
   - Users log in with individual credentials
   - License validates automatically

4. **Usage:**
   - All 50 users can work simultaneously
   - Data saved to central database
   - Real-time sync across all machines
   - License tracks active sessions

5. **Renewal:**
   - Expiry notification 30 days before
   - Admin renews online
   - New license key applied
   - No downtime for users

---

### 4.iii) Multi-Company Support

#### Enterprise-Grade Multi-Company Architecture

The application supports unlimited companies in a single installation:

#### How Multi-Company Works

**1. Company Structure**
```
Database
├── Company A (ABC Manufacturing Ltd)
│   ├── Users (5 employees)
│   ├── Trial Balance (FY 2023-24)
│   ├── Financial Statements
│   └── All Schedules
├── Company B (XYZ Traders Ltd)
│   ├── Users (3 employees)
│   ├── Trial Balance (FY 2023-24)
│   └── Financial Statements
└── Company C (DEF Services Ltd)
    └── ...
```

**2. Data Isolation**
- Each company's data is completely separate
- Users can't see other companies' data (unless given permission)
- Financial statements are company-specific
- Audit trails maintained per company

**3. User Access Control**
```
User Permissions:
├── Admin: Can manage all companies
├── Manager: Can access assigned companies (e.g., Company A, B)
└── Accountant: Can access only one company (e.g., Company A)
```

#### Multi-Company Features

**Company Management:**
- Create unlimited companies
- Each with unique:
  - Company name
  - Registration details (CIN, PAN, etc.)
  - Financial year
  - Chart of accounts
  - User assignments

**Company Switching:**
- Dropdown menu in application header
- Select company → All data changes instantly
- Last selected company remembered
- Recently used companies quick-access

**Consolidated Reporting:**
- Generate reports for multiple companies
- Compare financial metrics across companies
- Group-level consolidated statements
- Inter-company transaction tracking

#### Use Cases

**Use Case 1: Accounting Firm**
- Manages 50 client companies
- Each client is a separate company in the system
- Staff assigned to specific clients
- Consolidated billing and reporting

**Use Case 2: Group of Companies**
- Holding company with 5 subsidiaries
- All subsidiaries in one system
- Parent company can view all
- Each subsidiary manages own data

**Use Case 3: Multi-Branch Operation**
- Each branch treated as a company
- Head office consolidates all branches
- Branch managers see only their data
- Automated inter-branch reconciliation

#### Technical Implementation

**Database Design:**
```sql
Company Table
├── id (unique)
├── name
├── displayName
├── userId (owner)
└── ...

Trial Balance (linked to company)
├── companyId → Company.id
├── majorHead
├── amount
└── ...

User Access
├── userId → User.id
├── companyId → Company.id
├── role (viewer, editor, admin)
└── ...
```

**API Design:**
```typescript
// All API calls are company-scoped
getTrialBalance({ companyId: "abc123" })
generateBalanceSheet({ companyId: "abc123" })
exportToExcel({ companyId: "abc123" })
```

#### Advantages Over VBA

| Feature | VBA (Excel) | Web App |
|---------|-------------|---------|
| Multiple Companies | Separate Excel files | Single database |
| Switching | Open different files | Dropdown selection |
| Data Consistency | Manual sync | Automatic |
| User Access | File sharing | Role-based permissions |
| Backup | Each file separately | Single database backup |
| Reporting | Manual consolidation | Automated |

---

### Additional Enhanced Features

#### 5. User Authentication & Authorization
- **VBA:** File-based access
- **Web App:**
  - Secure login (username/password)
  - Password encryption (bcrypt)
  - Session management (JWT tokens)
  - Role-based permissions (admin, manager, user)
  - Two-factor authentication (optional)

#### 6. Audit Trail & Version History
- **VBA:** No audit trail
- **Web App:**
  - All changes logged with timestamp
  - User who made changes recorded
  - Previous versions can be restored
  - Compliance-ready audit reports

#### 7. Collaboration Features
- **VBA:** Single user at a time
- **Web App:**
  - Multiple users simultaneously
  - Real-time updates
  - Comment/notes on entries
  - Approval workflows

#### 8. Automated Backups
- **VBA:** Manual file copying
- **Web App:**
  - Scheduled automatic backups
  - Point-in-time recovery
  - Cloud backup options
  - Disaster recovery ready

#### 9. Advanced Reporting
- **VBA:** Fixed reports
- **Web App:**
  - Customizable report templates
  - Dynamic filters and grouping
  - Chart visualizations
  - Export to multiple formats (PDF, Excel, CSV)

#### 10. Mobile Access (Future)
- **VBA:** Desktop only
- **Web App:**
  - Responsive design
  - Works on tablets
  - Mobile-optimized views
  - Approve transactions on-the-go

---

## 5. Web App Instructions for Network Deployment

### Overview

The Financial Statement Generator can be deployed as a web application accessible across your local network:

```
[Database Server] ← → [Web Server] ← → [Client Browsers]
PostgreSQL                              Chrome, Edge, Firefox
```

### Deployment Architectures

#### Architecture 1: Single Server (Simple)
```
Server Machine (192.168.1.100)
├── PostgreSQL (Database)
├── Node.js (Web Server)
└── Financial Statement Generator App

Client Machines
├── Open browser
└── Navigate to http://192.168.1.100:3000
```

**Best for:** Small offices (5-20 users), simple setup

#### Architecture 2: Separate Database Server (Recommended)
```
Database Server (192.168.1.100)
└── PostgreSQL

Web Server (192.168.1.101)
└── Financial Statement Generator App

Client Machines
└── Browser → http://192.168.1.101:3000
```

**Best for:** Medium to large offices (20+ users), better performance

#### Architecture 3: Cloud Deployment
```
Cloud Provider (AWS/Azure/GCP)
├── Database: Managed PostgreSQL
└── Web Server: Cloud compute instance

Users
└── Any location → https://finance.company.com
```

**Best for:** Remote teams, multi-location access

---

### Web App Deployment - Step by Step

#### Prerequisites
- Windows Server 2016+ or Windows 10/11 Pro
- Node.js 20+ installed
- PostgreSQL 16+ installed
- Static IP address for server
- Network access for client machines

#### Step 1: Server Setup

**1.1 Install Node.js**
1. Download from https://nodejs.org/
2. Run installer, choose LTS version
3. Verify: Open Command Prompt
   ```cmd
   node -v
   npm -v
   ```

**1.2 Install PostgreSQL**
- Follow Section 2 of this guide
- Configure for network access (listen_addresses = '*')

**1.3 Prepare Application Files**
1. Copy `Financials Automation` folder to server
2. Place in: `C:\inetpub\FinancialApp\`

#### Step 2: Application Configuration

**2.1 Configure Environment**

Create/edit `.env` file:
```env
# Server Configuration
NODE_ENV=production
PORT=3000
BASE_URL=http://192.168.1.100:3000

# Database Configuration
DATABASE_URL=******5432/financialsdb

# Security
JWT_SECRET=your_random_64_character_secret_here
ADMIN_PASSWORD=YourSecureAdminPassword123!

# License Server (if applicable)
LICENSE_SERVER_URL=http://192.168.1.100:3000
```

**2.2 Install Dependencies**

Open Command Prompt as Administrator:
```cmd
cd C:\inetpub\FinancialApp

# Install pnpm
npm install -g pnpm

# Install application dependencies
pnpm install

# Initialize database
pnpm prisma migrate deploy
pnpm prisma generate
```

#### Step 3: Build for Production

```cmd
# Build the application
pnpm run build

# This creates optimized production files
```

#### Step 4: Start the Web Server

**Option A: Manual Start (for testing)**
```cmd
pnpm run start
```
Application runs at: http://localhost:3000

**Option B: Windows Service (for production)**

Install as Windows Service using NSSM:

1. Download NSSM from https://nssm.cc/download
2. Extract to `C:\nssm\`
3. Open Command Prompt as Administrator:
   ```cmd
   cd C:\nssm\win64
   
   nssm install FinancialStatementGenerator
   ```
4. Configure service:
   - **Path:** `C:\Program Files\nodejs\node.exe`
   - **Startup directory:** `C:\inetpub\FinancialApp`
   - **Arguments:** `.output/server/index.mjs`
   - **Service name:** Financial Statement Generator
5. Click "Install service"
6. Start service:
   ```cmd
   nssm start FinancialStatementGenerator
   ```

#### Step 5: Configure Windows Firewall

Allow inbound connections:
1. Open Windows Firewall with Advanced Security
2. **Inbound Rules** → **New Rule**
3. **Port** → **Next**
4. **TCP, Specific ports:** 3000
5. **Allow the connection**
6. **Domain, Private, Public** (select as needed)
7. **Name:** Financial Statement Generator Web
8. **Finish**

#### Step 6: Test Server Access

**From Server Machine:**
1. Open browser
2. Navigate to: `http://localhost:3000`
3. Should see login screen

**From Client Machine:**
1. Open browser
2. Navigate to: `http://192.168.1.100:3000`
   (Replace with your server's IP)
3. Should see login screen

---

### Client Setup Instructions

#### For End Users

**What Users Need:**
- Modern web browser (Chrome, Edge, Firefox)
- Network access to server
- User credentials (username/password)

**How to Access:**

1. **Open Browser**
   - Launch Chrome, Edge, or Firefox

2. **Navigate to Application**
   - Enter server address in URL bar
   - Example: `http://192.168.1.100:3000`
   - Bookmark for easy access

3. **Login**
   - Enter username
   - Enter password
   - Click "Sign In"

4. **Select Company**
   - Choose company from dropdown (if multiple)
   - Start working!

**Bookmark Instructions:**
- Press `Ctrl + D` to bookmark
- Name: "Financial Statement Generator"
- Save in Favorites Bar for quick access

#### Browser Requirements

| Browser | Minimum Version | Recommended |
|---------|-----------------|-------------|
| **Google Chrome** | 90+ | Latest |
| **Microsoft Edge** | 90+ | Latest |
| **Firefox** | 88+ | Latest |
| **Safari** | 14+ | Latest |

**Not Supported:**
- Internet Explorer (any version)
- Very old browsers (pre-2020)

---

### Network Configuration

#### IP Address Planning

**Server:**
- Assign static IP (e.g., 192.168.1.100)
- Configure in Windows Network Settings
- Document for users

**Clients:**
- Can use DHCP (automatic)
- Must be on same network or have route to server

#### DNS Configuration (Optional but Recommended)

Instead of IP address, use friendly name:

1. **Configure DNS Server**
   - Add A record: `finance.company.local` → `192.168.1.100`

2. **Users Access Via:**
   - `http://finance.company.local:3000`
   - Easier to remember than IP

#### Load Balancing (Advanced)

For high availability:
```
Load Balancer (192.168.1.99)
├── Web Server 1 (192.168.1.101)
├── Web Server 2 (192.168.1.102)
└── Web Server 3 (192.168.1.103)
     ↓
Database Server (192.168.1.100)
```

---

### Maintenance & Administration

#### Starting/Stopping the Service

**Via Services:**
1. Press `Windows + R`
2. Type `services.msc`
3. Find "Financial Statement Generator"
4. Right-click → Start/Stop/Restart

**Via Command Line:**
```cmd
# Start
net start FinancialStatementGenerator

# Stop
net stop FinancialStatementGenerator

# Restart
net stop FinancialStatementGenerator && net start FinancialStatementGenerator
```

#### Updating the Application

1. **Stop service**
2. **Backup database**
   ```cmd
   pg_dump -U postgres financialsdb > backup.sql
   ```
3. **Update application files**
4. **Run migrations**
   ```cmd
   pnpm prisma migrate deploy
   ```
5. **Rebuild**
   ```cmd
   pnpm run build
   ```
6. **Start service**

#### Monitoring

**Check Application Logs:**
- Location: `C:\inetpub\FinancialApp\logs\`
- View latest: `type app.log | more`

**Check Database:**
- Use pgAdmin 4
- Monitor active connections
- Review query performance

**Performance Monitoring:**
- Task Manager → Performance
- Monitor CPU, RAM, Disk usage
- PostgreSQL should use < 50% CPU normally

---

### Troubleshooting Network Access

#### Issue: Can't access from client machines

**Check 1: Server is running**
```cmd
netstat -an | findstr :3000
```
Should show: `0.0.0.0:3000` or `LISTENING`

**Check 2: Firewall allows connections**
- Windows Firewall → Inbound Rules
- Verify rule exists for port 3000

**Check 3: Network connectivity**
From client machine:
```cmd
ping 192.168.1.100
```
Should receive replies

**Check 4: Port is accessible**
From client machine:
```cmd
telnet 192.168.1.100 3000
```
If connects, port is open

#### Issue: Slow performance

**Solutions:**
1. **Database tuning** (see DATABASE_SETUP_GUIDE.md)
2. **Add more RAM** to server
3. **Use SSD** instead of HDD
4. **Separate database** to another server
5. **Enable caching** in application config

#### Issue: Users disconnected frequently

**Solutions:**
1. Check network stability
2. Increase session timeout:
   ```env
   SESSION_TIMEOUT_MINUTES=1440  # 24 hours
   ```
3. Use wired connection instead of WiFi
4. Check server load

---

### Security Best Practices

#### 1. Use HTTPS (Recommended for Production)

Configure SSL certificate:
1. Obtain SSL certificate
2. Configure in application
3. Use port 443 instead of 3000
4. Clients access via: `https://finance.company.com`

#### 2. Restrict Database Access

In `pg_hba.conf`:
```
# Only allow application server
host    financialsdb    smbc_app    192.168.1.101/32    md5

# Deny all others
host    all             all         0.0.0.0/0           reject
```

#### 3. Use Strong Passwords

- Database passwords: 16+ characters
- User passwords: Enforce complexity
- JWT secret: 64+ random characters

#### 4. Regular Backups

Automated daily backup script:
```cmd
@echo off
set BACKUP_DIR=D:\Backups\Financial
set DATE=%DATE:~-4%%DATE:~3,2%%DATE:~0,2%

"C:\Program Files\PostgreSQL\16\bin\pg_dump" -U postgres -F c financialsdb > "%BACKUP_DIR%\backup_%DATE%.dump"
```

Schedule via Task Scheduler

#### 5. Update Regularly

- Keep Node.js updated
- Update npm packages monthly
- Apply Windows updates
- Update PostgreSQL

---

### Performance Optimization

#### For 50+ Concurrent Users

**Server Hardware:**
- CPU: 8+ cores
- RAM: 16 GB minimum, 32 GB recommended
- Storage: SSD (500+ MB/s)
- Network: Gigabit Ethernet

**Database Optimization:**
```sql
-- In postgresql.conf
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 512MB
max_connections = 100
```

**Application Caching:**
Configure in `.env`:
```env
ENABLE_CACHE=true
CACHE_TTL=3600  # 1 hour
```

---

### Comparison: Desktop .exe vs Web App

| Feature | Desktop (.exe) | Web App (Network) |
|---------|---------------|-------------------|
| **Installation** | Per PC | One server only |
| **Updates** | Each PC separately | Server only, all users updated |
| **Access** | Desktop app icon | Browser URL |
| **Database** | Shared server | Shared server |
| **Concurrent Users** | Unlimited | Unlimited |
| **Offline Mode** | Yes | No (needs network) |
| **Mobile Access** | No | Yes (responsive) |
| **Maintenance** | Per PC | Server only |
| **Resource Use** | Local PC resources | Server resources |
| **Best For** | Power users, offline work | Teams, remote access |

### Recommendation

**Use Desktop .exe when:**
- Users work offline
- Each user needs full control
- Desktop app performance critical

**Use Web App when:**
- Multiple users need concurrent access
- Centralized management preferred
- Remote/mobile access needed
- Easier updates important

**Hybrid Approach (Best of Both):**
- Primary users: Desktop .exe
- Remote/mobile users: Web app
- Both connect to same database
- All data synchronized

---

## Summary

This guide covers:
1. ✅ **Running the .exe installer** - Complete installation steps with troubleshooting
2. ✅ **PostgreSQL setup** - Detailed database installation for local and network
3. ✅ **VBA functionalities** - All VBA features implemented and enhanced
4. ✅ **Enhanced features** - Server database, licensing, multi-company support
5. ✅ **Web app deployment** - Full network deployment instructions

For additional support:
- Review specific guide sections above
- Check README.md for quick reference
- See DATABASE_SETUP_GUIDE.md for database details
- Contact support for enterprise deployment assistance

---

**Document Version:** 1.0  
**Last Updated:** October 2025  
**Covers:** Windows .exe v1.0.0, Web App v1.0.0
