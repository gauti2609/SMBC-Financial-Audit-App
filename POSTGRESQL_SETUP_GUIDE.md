# PostgreSQL Database Setup Guide

## Overview

The Financial Statement Generator requires a PostgreSQL database to store financial data, user accounts, and configuration. This guide will help you set up PostgreSQL for the application.

## Prerequisites

You mentioned you already have **PGAdmin4** installed, which is perfect! This means PostgreSQL is likely already installed on your system.

## Step-by-Step Setup Instructions

### Step 1: Verify PostgreSQL is Running

1. **Open PGAdmin4** from your Start Menu
2. When PGAdmin4 opens, you should see a server listed (usually named "PostgreSQL [version number]")
3. Click on the server to connect
4. If prompted, enter your PostgreSQL password (the one you set during PostgreSQL installation)

### Step 2: Note Your PostgreSQL Credentials

You'll need the following information:
- **Host**: `localhost` (if running on the same machine) or the IP address of the testing machine
- **Port**: Usually `5432` (default PostgreSQL port)
- **Username**: Usually `postgres` (default superuser)
- **Password**: The password you set during PostgreSQL installation

### Step 3: Create the Database

1. In PGAdmin4, **right-click on "Databases"** (under your PostgreSQL server)
2. Select **Create > Database...**
3. In the dialog that appears:
   - **Database name**: `financialsdb`
   - **Owner**: Select `postgres` (or your PostgreSQL username)
   - Click **Save**

### Step 4: Configure the Application

The application needs to know how to connect to your database. You have two options:

#### Option A: Configure via Environment Variable (Recommended for Testing)

Before running the installed application, you need to set the `DATABASE_URL` environment variable:

1. **Open PowerShell as Administrator**
2. Run this command (replace the password with your actual PostgreSQL password):

```powershell
[System.Environment]::SetEnvironmentVariable('DATABASE_URL', 'postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb', 'User')
```

For example, if your PostgreSQL password is `MyPass123`:
```powershell
[System.Environment]::SetEnvironmentVariable('DATABASE_URL', 'postgresql://postgres:MyPass123@localhost:5432/financialsdb', 'User')
```

3. **Restart your computer** for the environment variable to take effect
4. Run the Financial Statement Generator application

#### Option B: Create a Configuration File (Alternative)

If you're testing on a different machine with a different password, you'll need to update the connection string.

The format of the DATABASE_URL is:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

**Examples:**

For local installation (same machine):
```
postgresql://postgres:YourPassword@localhost:5432/financialsdb
```

For remote testing machine:
```
postgresql://postgres:TestMachinePassword@192.168.1.100:5432/financialsdb
```

### Step 5: Test the Connection

1. In PGAdmin4, expand your server tree:
   - PostgreSQL [version]
   - Databases
   - financialsdb
   - Schemas
   - Tables

2. You should see the `financialsdb` database listed

### Step 6: Initialize the Database Schema

The application uses Prisma to manage the database schema. When you first run the application, it will automatically create all the necessary tables.

**However**, you may need to run migrations manually if the app doesn't have permissions:

1. Open a Command Prompt or PowerShell
2. Navigate to the installation directory:
   ```
   cd "C:\Program Files\Financial Statement Generator"
   ```
3. If you have the source code, you can run migrations from there instead

## Troubleshooting

### Error: "Database connection failed"

**Check the following:**

1. **Is PostgreSQL running?**
   - Open Services (Win+R, type `services.msc`)
   - Look for "postgresql-x64-[version]"
   - Ensure it's "Running"
   - If not, right-click and select "Start"

2. **Is the password correct?**
   - Try connecting through PGAdmin4 with the same credentials
   - If PGAdmin4 can connect, the credentials are correct

3. **Is the port correct?**
   - Default is 5432
   - Check in PGAdmin4: Right-click server > Properties > Connection > Port

4. **Firewall blocking connection?**
   - If using a remote database, ensure Windows Firewall allows PostgreSQL
   - Default port 5432 should be open

### Error: "Port 3000 already in use"

Another application is using port 3000. Either:
- Close the other application, OR
- The app will need to be modified to use a different port

### Connection String Examples

**For your testing machine scenario:**

If your main machine is at IP `192.168.1.29` and testing machine is `192.168.1.50`:

On the testing machine, use:
```
postgresql://postgres:TestMachinePassword@localhost:5432/financialsdb
```

Or if you want to connect to the database on the main machine from the testing machine:
```
postgresql://postgres:MainMachinePassword@192.168.1.29:5432/financialsdb
```

**Important**: If connecting to a remote PostgreSQL server, you must:
1. Edit `pg_hba.conf` on the database server to allow remote connections
2. Edit `postgresql.conf` to set `listen_addresses = '*'`
3. Restart PostgreSQL service
4. Open port 5432 in Windows Firewall on the database server

## Recommended Setup for Desktop Application

For a desktop application like this, the **recommended approach** is:

1. **Install PostgreSQL locally** on each machine that runs the app
2. Each installation has its own local database
3. Use `localhost` in the connection string
4. Each user has their own data

This is simpler and doesn't require network configuration.

## Setting Up PostgreSQL on the Testing Machine

If PostgreSQL is not installed on your testing machine:

1. **Download PostgreSQL**:
   - Go to: https://www.postgresql.org/download/windows/
   - Download the installer (latest version)

2. **Run the installer**:
   - Accept default installation directory
   - **Remember the password you set** for the postgres user
   - Default port: 5432
   - Default locale: Your system default

3. **Launch PGAdmin4** (included with PostgreSQL)

4. **Create the database** as described in Step 3 above

## Quick Reference

**Default Connection String** (change the password):
```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb
```

**Database Name**: `financialsdb`

**Default Port**: `5432`

**Default User**: `postgres`

## Need More Help?

If you're still having issues, please provide:
1. PostgreSQL version (from PGAdmin4: Help > About)
2. Error message from the application
3. Can you connect to the database using PGAdmin4?
4. Are you trying to connect to a local or remote database?

## Summary Checklist

- [ ] PostgreSQL is installed
- [ ] PostgreSQL service is running
- [ ] Database `financialsdb` is created
- [ ] You know your PostgreSQL password
- [ ] DATABASE_URL environment variable is set (or connection configured)
- [ ] Application can start and connect to database

Once all these are checked, the application should start successfully!
