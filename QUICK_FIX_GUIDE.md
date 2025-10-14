# Quick Visual Guide: How to Fix the Installation Issue

## Before (The Problem)

```
User installs application
    ↓
Sets system environment variable via PowerShell (Admin):
[System.Environment]::SetEnvironmentVariable('DATABASE_URL', '...', 'User')
    ↓
Launches application
    ↓
❌ ERROR: "Server file not found"
(Because computer wasn't restarted - env var not active)
```

## After (The Solution)

```
User installs application
    ↓
Sees post-install message with instructions
    ↓
Creates config.env file:
  Location: %APPDATA%\Financial Statement Generator\config.env
  Content:  DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/financialsdb
    ↓
Launches application
    ↓
✅ SUCCESS: Login screen appears!
(Works immediately - no restart needed)
```

## Side-by-Side Comparison

| Old Method (Still Works) | New Method (Recommended) |
|--------------------------|--------------------------|
| Set system environment variable | Create config.env file |
| Requires PowerShell Admin | No admin needed |
| Requires computer restart | Works immediately |
| Hard to verify/troubleshoot | Easy to view/edit |
| Error: "Server file not found" | Error: "DATABASE_URL not configured" with instructions |

## File Location

The magic file that makes everything work:

```
C:\Users\YourUsername\AppData\Roaming\Financial Statement Generator\config.env
```

Or use the shortcut: `%APPDATA%\Financial Statement Generator\config.env`

## File Content (Example)

```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/financialsdb
```

That's it! Just one line.

## What Happens Under the Hood

```
Application starts
    ↓
loadEnvironmentVariables() runs
    ↓
Checks for environment variables in this order:
  1. System environment variables (if set)
  2. %APPDATA%\Financial Statement Generator\config.env (NEW!)
  3. Installation folder\resources\config.env
  4. Installation folder\resources\.env
    ↓
Loads DATABASE_URL
    ↓
Validates DATABASE_URL is set
    ↓
Starts backend server
    ↓
Shows login screen
```

## Error Messages - Before vs After

### Before
```
ERROR: Server file not found at: C:\Program Files\...\index.mjs
[This was confusing - the server file EXISTS, but DATABASE_URL was missing]
```

### After  
```
ERROR: DATABASE_URL environment variable is not configured.

Please configure the database connection using one of these methods:

1. Create a config.env file in the application data folder:
   Location: C:\Users\...\AppData\Roaming\Financial Statement Generator\config.env
   Content: DATABASE_URL=postgresql://username:password@host:port/database

2. Set a system environment variable:
   PowerShell (Admin): [System.Environment]::SetEnvironmentVariable(...)
   Then restart your computer.

3. Copy config.env.template from installation folder

See INSTALLATION_SETUP_GUIDE.md for detailed instructions.
```

## Quick Setup Checklist

After installing the new version:

- [ ] PostgreSQL is installed and running
- [ ] Database 'financialsdb' created in PGAdmin4
- [ ] config.env file created in: `%APPDATA%\Financial Statement Generator\`
- [ ] config.env contains: `DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/financialsdb`
- [ ] PostgreSQL password in DATABASE_URL is correct
- [ ] Launched the application

If all checked: ✅ Application should show login screen!

## Documentation Included

After installation, find these guides in:
`C:\Program Files\Financial Statement Generator\resources\`

- **INSTALLATION_SETUP_GUIDE.md** - Complete step-by-step instructions
- **QUICK_START.md** - Quick reference guide  
- **POSTGRESQL_SETUP_GUIDE.md** - Database setup details
- **config.env.template** - Template you can copy and edit

## Desktop Shortcut

After installation, you'll find a shortcut on your desktop:
**"Setup Instructions - Financial Statement Generator"**

Click it to open the comprehensive setup guide!

## Still Need Help?

1. Check if config.env file exists (Windows may hide .env extension)
2. Verify the DATABASE_URL line is correct (no typos)
3. Test PostgreSQL password in PGAdmin4
4. Check if PostgreSQL service is running (Services → postgresql)
5. Open an issue with:
   - Screenshot of error
   - Content of config.env (mask password: `***`)
   - PostgreSQL version

## Key Takeaway

**You no longer need to:**
- Use PowerShell as Admin
- Set system environment variables
- Restart your computer

**Just create one file and you're done!** 🎉
