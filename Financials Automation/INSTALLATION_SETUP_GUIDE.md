# Financial Statement Generator - Installation Setup Guide

## Important: Required Setup Steps

After installing the Financial Statement Generator, you **MUST** complete these setup steps before the application will work.

---

## Step 1: Install PostgreSQL Database

The application requires PostgreSQL to be installed and running.

### If You Already Have PostgreSQL Installed

Skip to Step 2.

### If You Need to Install PostgreSQL

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. **Remember the password** you set for the `postgres` user during installation
4. Leave other settings at their defaults
5. Complete the installation

---

## Step 2: Create the Database

1. Open **PGAdmin4** (installed with PostgreSQL)
2. Connect to your PostgreSQL server (it will ask for the password you set during installation)
3. Right-click on **"Databases"** → **"Create"** → **"Database"**
4. Enter database name: **`financialsdb`**
5. Click **"Save"**

---

## Step 3: Configure the Database Connection

You have **THREE options** to configure the database connection. Choose the one that works best for you:

### Option A: Create config.env File (RECOMMENDED - Easiest)

This is the **easiest and most reliable method**.

1. **Open File Explorer**
2. **Navigate to**: `%APPDATA%\Financial Statement Generator`
   - You can copy-paste this path into File Explorer address bar
   - Or manually go to: `C:\Users\YourUsername\AppData\Roaming\Financial Statement Generator`
3. **Create a new text file** named `config.env` (make sure it's NOT `config.env.txt`)
4. **Open config.env** with Notepad and add this line:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb
   ```
   - Replace `YOUR_PASSWORD` with your actual PostgreSQL password
5. **Save the file**
6. **Launch the application**

**Example:**
If your PostgreSQL password is `mypass123`, the line should be:
```
DATABASE_URL=postgresql://postgres:mypass123@localhost:5432/financialsdb
```

### Option B: Use Template File

1. **Open File Explorer**
2. **Navigate to installation folder**:
   - Usually: `C:\Program Files\Financial Statement Generator\resources`
3. **Find** the file `config.env.template`
4. **Copy** this file
5. **Navigate to**: `%APPDATA%\Financial Statement Generator`
6. **Paste** the file and rename it to `config.env`
7. **Edit** the file with Notepad
8. **Update** the `DATABASE_URL` line with your PostgreSQL password
9. **Save** the file
10. **Launch the application**

### Option C: System Environment Variable (Advanced)

**Note:** This method requires administrator privileges and a computer restart.

1. **Open PowerShell as Administrator**
   - Press Windows key
   - Type "PowerShell"
   - Right-click "Windows PowerShell" and select "Run as administrator"

2. **Run this command** (replace `YOUR_PASSWORD` with your PostgreSQL password):
   ```powershell
   [System.Environment]::SetEnvironmentVariable('DATABASE_URL', 'postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb', 'User')
   ```

3. **Restart your computer** (this is required for the environment variable to take effect)

4. **Launch the application**

---

## Step 4: Launch the Application

1. **Close all open instances** of Financial Statement Generator
2. **Launch** the application from:
   - Desktop shortcut, OR
   - Start Menu
3. **Wait 5-10 seconds** for the server to start
4. The application should display the login screen

---

## Troubleshooting

### Error: "DATABASE_URL environment variable is not configured"

This means the application cannot find your database configuration. Follow these steps:

1. **Verify config.env file exists**:
   - Location: `%APPDATA%\Financial Statement Generator\config.env`
   - The file should contain: `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb`

2. **Check the file is named correctly**:
   - It must be `config.env` (NOT `config.env.txt`)
   - Windows may hide file extensions. In File Explorer, go to "View" → check "File name extensions"

3. **Verify PostgreSQL password**:
   - Make sure the password in the DATABASE_URL is correct
   - Try connecting to PostgreSQL using PGAdmin4 with the same password

4. **Check PostgreSQL is running**:
   - Open "Services" (Press Windows + R, type `services.msc`)
   - Look for "postgresql-x64-[version]"
   - Status should be "Running"
   - If not, right-click and select "Start"

### Error: "Server file not found"

This indicates an installation issue. Try:

1. **Uninstall** the application completely
2. **Delete** the installation folder: `C:\Program Files\Financial Statement Generator`
3. **Reinstall** from the installer .exe file
4. Follow setup steps above

### Application Shows Blank Screen

1. **Press Ctrl+Shift+I** to open Developer Tools
2. **Look for errors** in the Console tab
3. **Check** if DATABASE_URL is mentioned in any errors
4. Follow the database configuration steps above

### For Network Database (Advanced Users)

If your PostgreSQL is on a different computer:

1. Edit `config.env` file
2. Change the DATABASE_URL:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@COMPUTER_IP:5432/financialsdb
   ```
   - Replace `COMPUTER_IP` with the IP address of the computer running PostgreSQL
   - Example: `postgresql://postgres:mypass@192.168.1.100:5432/financialsdb`

---

## Additional Help

### Documentation Files

The installation includes these helpful documents in the installation folder:
- `QUICK_START.md` - Quick start guide
- `POSTGRESQL_SETUP_GUIDE.md` - Detailed PostgreSQL setup instructions

**Location**: `C:\Program Files\Financial Statement Generator\resources\`

### Default Login Credentials

After successful setup, use these credentials to log in:
- **Username**: admin
- **Password**: (check the config.env or documentation for the default admin password)

---

## Summary Checklist

Before launching the application, make sure:

- [ ] PostgreSQL is installed and running
- [ ] Database `financialsdb` is created in PostgreSQL
- [ ] `config.env` file exists in `%APPDATA%\Financial Statement Generator\`
- [ ] `config.env` contains correct `DATABASE_URL` with your PostgreSQL password
- [ ] PostgreSQL password in `DATABASE_URL` is correct

If all items are checked, the application should start successfully!

---

**Still having issues?** Open an issue on GitHub with:
1. Screenshot of the error
2. Content of your config.env file (with password masked: `***`)
3. PostgreSQL version
