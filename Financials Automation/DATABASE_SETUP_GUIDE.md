# Database Setup Guide for Financial Statement Generator

## Overview
The Financial Statement Generator requires a PostgreSQL database to store financial data, user information, and application settings. This guide provides step-by-step instructions for setting up the database for different deployment scenarios.

## Deployment Scenarios

### Scenario 1: Single User on Windows (Recommended for Testing)
- **Database**: PostgreSQL installed locally on the same machine
- **Best For**: Individual users, testing, development
- **Setup Time**: 15-30 minutes

### Scenario 2: Multi-User Network Deployment
- **Database**: PostgreSQL installed on a central server
- **Best For**: Teams, departments, organizations
- **Setup Time**: 30-60 minutes

### Scenario 3: Standalone with Embedded Database (Future Enhancement)
- **Database**: SQLite embedded in the application
- **Best For**: Truly standalone operation without external dependencies
- **Status**: Requires code modifications (not currently available)

## Scenario 1: Local PostgreSQL Setup (Recommended)

### Step 1: Download and Install PostgreSQL

#### 1.1 Download PostgreSQL
1. Visit: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Choose the latest version (16.x recommended)
4. Select Windows x86-64 installer

#### 1.2 Run the Installer
1. **Double-click** the downloaded .exe file
2. **Click "Next"** through the welcome screen
3. **Installation Directory**: Keep default `C:\Program Files\PostgreSQL\16`
4. **Select Components**: Keep all selected:
   - ☑ PostgreSQL Server
   - ☑ pgAdmin 4 (database management tool)
   - ☑ Stack Builder (for additional tools)
   - ☑ Command Line Tools
5. **Data Directory**: Keep default `C:\Program Files\PostgreSQL\16\data`
6. **Password**: 
   - Enter a strong password for the postgres superuser
   - **IMPORTANT**: Remember this password! You'll need it later.
   - Example: `Smbc@2025` (use your own secure password)
7. **Port**: Keep default `5432`
8. **Locale**: Keep default
9. **Pre-Installation Summary**: Review and click "Next"
10. **Install**: Wait for installation to complete (5-10 minutes)
11. **Finish**: Uncheck "Launch Stack Builder" for now

### Step 2: Verify PostgreSQL Installation

#### 2.1 Check PostgreSQL Service
1. Press `Windows + R`
2. Type `services.msc` and press Enter
3. Look for "postgresql-x64-16" in the list
4. Verify it's "Running"
5. If not running, right-click → Start

#### 2.2 Test Database Connection
1. Open **Command Prompt**
2. Navigate to PostgreSQL bin directory:
   ```cmd
   cd "C:\Program Files\PostgreSQL\16\bin"
   ```
3. Connect to PostgreSQL:
   ```cmd
   psql -U postgres
   ```
4. Enter the password you set during installation
5. If successful, you'll see the psql prompt: `postgres=#`
6. Type `\q` to exit

### Step 3: Create Application Database

#### 3.1 Using Command Line (Recommended)
1. Open **Command Prompt** as Administrator
2. Navigate to PostgreSQL bin:
   ```cmd
   cd "C:\Program Files\PostgreSQL\16\bin"
   ```
3. Connect to PostgreSQL:
   ```cmd
   psql -U postgres
   ```
4. Create database:
   ```sql
   CREATE DATABASE financialsdb;
   ```
5. Verify creation:
   ```sql
   \l
   ```
   (You should see `financialsdb` in the list)
6. Connect to the new database:
   ```sql
   \c financialsdb
   ```
7. Create application user (optional but recommended):
   ```sql
   CREATE USER smbc WITH PASSWORD 'Smbc@2025';
   GRANT ALL PRIVILEGES ON DATABASE financialsdb TO smbc;
   ```
8. Exit psql:
   ```sql
   \q
   ```

#### 3.2 Using pgAdmin 4 (Graphical Interface)
1. **Open pgAdmin 4** from Start Menu
2. **Expand** Servers → PostgreSQL 16 → Databases
3. **Right-click** Databases → Create → Database
4. **Database Name**: `financialsdb`
5. **Owner**: postgres
6. **Click Save**

### Step 4: Configure Application Database Connection

#### 4.1 Update .env File
1. Navigate to the application folder
2. Open `.env` file in a text editor
3. Update the DATABASE_URL:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb
   ```
   Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation
   
   Example:
   ```env
   DATABASE_URL=postgresql://postgres:Smbc@2025@localhost:5432/financialsdb
   ```

#### 4.2 Alternative: Configure in Application
Many users prefer to configure the database connection through the application interface:
1. Launch the Financial Statement Generator
2. On first launch, you'll see "Database Configuration Required"
3. Enter connection details:
   - **Host**: localhost
   - **Port**: 5432
   - **Username**: postgres (or smbc if you created that user)
   - **Password**: (your PostgreSQL password)
   - **Database**: financialsdb
4. Click **"Test Connection"**
5. If successful, click **"Save & Connect"**

### Step 5: Initialize Database Schema

#### 5.1 Automatic Migration (Recommended)
The application will automatically create all necessary tables on first connection.

#### 5.2 Manual Migration (if needed)
If automatic migration fails:
1. Open Command Prompt in the application folder
2. Run Prisma migrations:
   ```cmd
   pnpm prisma migrate deploy
   ```
3. If errors occur, try:
   ```cmd
   pnpm prisma generate
   pnpm prisma db push
   ```

### Step 6: Verify Database Setup

#### 6.1 Check Tables Created
1. Open pgAdmin 4
2. Navigate to: Servers → PostgreSQL 16 → Databases → financialsdb → Schemas → public → Tables
3. You should see tables like:
   - User
   - Company
   - TrialBalanceEntry
   - CommonControl
   - And many more...

#### 6.2 Test in Application
1. Launch the Financial Statement Generator
2. Database connection indicator should show "Connected"
3. Try creating a test company:
   - Go to Company Management
   - Add new company
   - Save
4. If successful, database setup is complete!

## Scenario 2: Network Deployment Setup

### Step 1: Choose Database Server
Select a machine to host the PostgreSQL server:
- **Requirements**:
  - Windows Server 2016+ or Windows 10/11 Pro
  - Minimum 8GB RAM (16GB recommended)
  - Fast storage (SSD recommended)
  - Static IP address
  - Always-on (or scheduled availability)

### Step 2: Install PostgreSQL on Server
Follow Steps 1-3 from Scenario 1, but with these changes:

#### Additional Configuration for Network Access

1. **Edit postgresql.conf**:
   - Location: `C:\Program Files\PostgreSQL\16\data\postgresql.conf`
   - Open in text editor as Administrator
   - Find and modify:
     ```
     listen_addresses = '*'    # Listen on all network interfaces
     ```
   - Save and close

2. **Edit pg_hba.conf**:
   - Location: `C:\Program Files\PostgreSQL\16\data\pg_hba.conf`
   - Open in text editor as Administrator
   - Add at the end:
     ```
     # Allow connections from local network
     host    financialsdb    all    192.168.0.0/24    md5
     ```
   - Replace `192.168.0.0/24` with your actual network range
   - Save and close

3. **Restart PostgreSQL**:
   - Open Services (services.msc)
   - Find "postgresql-x64-16"
   - Right-click → Restart

4. **Configure Windows Firewall**:
   - Open Windows Firewall with Advanced Security
   - Create new Inbound Rule
   - Rule Type: Port
   - Port: 5432, TCP
   - Action: Allow the connection
   - Profile: Domain, Private, Public (select appropriate)
   - Name: "PostgreSQL Database Server"

### Step 3: Configure Client Applications
On each user's machine:
1. Install Financial Statement Generator
2. During first launch, configure database:
   - **Host**: (server IP address, e.g., 192.168.0.13)
   - **Port**: 5432
   - **Username**: postgres (or created user)
   - **Password**: (database password)
   - **Database**: financialsdb

### Step 4: Network Testing
From a client machine:
1. Open Command Prompt
2. Test connectivity:
   ```cmd
   psql -h 192.168.0.13 -U postgres -d financialsdb
   ```
3. If connection successful, network setup is complete!

## Common Issues and Solutions

### Issue 1: "Could not connect to server"
**Causes**:
- PostgreSQL service not running
- Firewall blocking port 5432
- Incorrect connection details

**Solutions**:
1. Check service: `services.msc` → postgresql-x64-16
2. Test locally first: `psql -U postgres -d financialsdb`
3. Check firewall rules
4. Verify port 5432 is not used by another application

### Issue 2: "Password authentication failed"
**Causes**:
- Incorrect password
- User doesn't have database access

**Solutions**:
1. Verify password is correct
2. Reset password if needed:
   ```sql
   ALTER USER postgres WITH PASSWORD 'new_password';
   ```
3. Check user permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE financialsdb TO postgres;
   ```

### Issue 3: "Database does not exist"
**Causes**:
- Database not created
- Connected to wrong server

**Solutions**:
1. List databases: `\l` in psql
2. Create database:
   ```sql
   CREATE DATABASE financialsdb;
   ```
3. Verify server address is correct

### Issue 4: Network connection timeout
**Causes**:
- Server firewall blocking
- Network routing issues
- postgresql.conf not configured for network

**Solutions**:
1. Ping server: `ping 192.168.0.13`
2. Test port: `telnet 192.168.0.13 5432`
3. Check listen_addresses in postgresql.conf
4. Check pg_hba.conf has correct network range
5. Restart PostgreSQL after config changes

### Issue 5: Application crashes on database operations
**Causes**:
- Prisma client not generated
- Database schema outdated

**Solutions**:
1. Regenerate Prisma client:
   ```cmd
   pnpm prisma generate
   ```
2. Update database schema:
   ```cmd
   pnpm prisma db push
   ```
3. Check application logs for specific errors

## Backup and Maintenance

### Regular Backups
**Daily Backup Script** (save as `backup-database.bat`):
```batch
@echo off
set PGPASSWORD=YOUR_PASSWORD
set BACKUP_DIR=C:\DatabaseBackups\Financials
set DATE=%DATE:~-4%%DATE:~3,2%%DATE:~0,2%

mkdir %BACKUP_DIR% 2>nul

"C:\Program Files\PostgreSQL\16\bin\pg_dump" -U postgres -F c -b -v -f "%BACKUP_DIR%\financialsdb_backup_%DATE%.dump" financialsdb

echo Backup completed: %BACKUP_DIR%\financialsdb_backup_%DATE%.dump
```

**Schedule via Task Scheduler**:
1. Open Task Scheduler
2. Create Basic Task
3. Name: "Financial DB Backup"
4. Trigger: Daily, 2:00 AM
5. Action: Start a program
6. Program: Path to backup-database.bat
7. Finish

### Restore from Backup
```cmd
cd "C:\Program Files\PostgreSQL\16\bin"
pg_restore -U postgres -d financialsdb -v C:\DatabaseBackups\Financials\financialsdb_backup_YYYYMMDD.dump
```

## Security Best Practices

1. **Use Strong Passwords**:
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols

2. **Limit Network Access**:
   - Use specific IP ranges in pg_hba.conf
   - Don't use `0.0.0.0/0` (allows all IPs)

3. **Regular Updates**:
   - Keep PostgreSQL updated
   - Apply security patches

4. **SSL Connections** (for sensitive environments):
   - Configure SSL in postgresql.conf
   - Require SSL in pg_hba.conf

5. **Separate Database Users**:
   - Create application-specific user with limited permissions
   - Don't use postgres superuser in production

## Performance Tuning

### For Better Performance
Edit `postgresql.conf`:
```conf
shared_buffers = 256MB        # 25% of RAM
effective_cache_size = 1GB    # 50-75% of RAM
work_mem = 16MB               # Per operation
maintenance_work_mem = 128MB  # For maintenance tasks
```

Restart PostgreSQL after changes.

## Support and Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **pgAdmin Documentation**: https://www.pgadmin.org/docs/
- **Prisma Documentation**: https://www.prisma.io/docs/

---

**Last Updated**: October 2025  
**PostgreSQL Version**: 16.x  
**Tested On**: Windows 10, Windows 11, Windows Server 2019/2022
