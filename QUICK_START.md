# Quick Start - First Time Setup

## Before Running the Application

The Financial Statement Generator needs PostgreSQL database to work.

### Step 1: Ensure PostgreSQL is Running

1. Press `Win + R`, type `services.msc`, press Enter
2. Find "postgresql-x64-[version]" in the list
3. Make sure Status shows "Running"
4. If not running, right-click and select "Start"

### Step 2: Set Database Connection

You need to tell the app how to connect to your database.

**Option 1: Using PowerShell (Recommended)**

1. Right-click Start Menu, select "PowerShell (Admin)"
2. Copy and paste this command (replace `YOUR_PASSWORD` with your PostgreSQL password):

```powershell
[System.Environment]::SetEnvironmentVariable('DATABASE_URL', 'postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb', 'User')
```

3. Restart your computer
4. Run the application

**Option 2: Create .env File**

1. Go to installation folder: `C:\Program Files\Financial Statement Generator`
2. Create a file named `.env` (note the dot at the beginning)
3. Add this line (replace `YOUR_PASSWORD`):
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb
```
4. Save and run the application

### Step 3: Create the Database

1. Open PGAdmin4
2. Right-click "Databases" → Create → Database
3. Name it: `financialsdb`
4. Click Save

### Step 4: Run the Application

The application should now start successfully!

## Common Issues

**Error: "Database connection failed"**
- Check PostgreSQL is running (Step 1)
- Verify your password is correct
- Ensure database `financialsdb` exists

**Error: "Server file not found"**
- The installer may not have copied all files
- Rebuild the installer with the latest code

**Error: "Port 3000 in use"**
- Another app is using port 3000
- Close other applications and try again

## Need Detailed Instructions?

See `POSTGRESQL_SETUP_GUIDE.md` for comprehensive setup instructions.

## Quick Connection String Format

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

Example:
```
postgresql://postgres:MyPassword123@localhost:5432/financialsdb
```
