# Electron App Backend Integration Guide

## Overview

This document explains how the backend server is integrated into the Electron application to enable full functionality including user authentication and data persistence.

## Architecture

The Electron app now includes:

1. **Embedded Backend Server**: A Nitro server (built by Vinxi) that runs alongside the Electron app
2. **SQLite Database**: Local database file stored in the user's app data directory
3. **tRPC API**: Full backend API accessible to the frontend
4. **Local File Storage**: MinIO is disabled; files are stored locally

## How It Works

### Server Startup

When the Electron app launches:

1. The main process (`electron/main.ts`) calls `startBackendServer()` from `electron/server.ts`
2. The server module spawns a Node.js child process running the Nitro server (`/.output/server/index.mjs`)
3. The server listens on port 3100 (configurable)
4. Environment variables are set:
   - `DATABASE_URL`: Points to a SQLite file in user data directory
   - `JWT_SECRET`: For authentication tokens
   - `ADMIN_PASSWORD`: Admin user password
   - `ELECTRON_APP`: Flag to disable MinIO
   - `NODE_ENV`: Set to 'production'

### Frontend Connection

The Electron window loads the application from `http://localhost:3100` instead of loading static files. This allows the frontend to:

- Make tRPC API calls to `/trpc` endpoints
- Authenticate users via the `/trpc/login` endpoint
- Store and retrieve data using the embedded database

### Database

- **Type**: SQLite (file-based)
- **Location**: `{USER_DATA}/database.db`
  - Windows: `C:\Users\{Username}\AppData\Roaming\Financial Statement Generator\database.db`
  - macOS: `~/Library/Application Support/Financial Statement Generator/database.db`
  - Linux: `~/.config/Financial Statement Generator/database.db`
- **Schema**: Same as the PostgreSQL schema (Prisma handles compatibility)

## Building the Electron App

### Prerequisites

1. Node.js 18+ installed
2. All dependencies installed: `npm install --legacy-peer-deps`

### Build Steps

```bash
# 1. Generate Prisma client for PostgreSQL (for web version)
npm run generate

# 2. Build the web application and Nitro server
npm run build

# 3. Build Electron TypeScript files
npm run build:electron

# 4. (Optional) For SQLite-specific builds, use the prepare script
# This temporarily switches the Prisma schema to SQLite
npm run prepare:electron
```

### Building the Installer

```bash
# For Windows
npm run dist:win

# For macOS
npm run dist:mac

# For Linux
npm run dist:linux
```

The installer will be created in the `dist-electron` directory.

## Development Mode

To run the app in development mode with live reloading:

```bash
# Terminal 1: Start the development server
npm run dev

# Terminal 2: Start Electron
npm run electron
```

In development mode:
- The frontend runs on port 3000
- The backend is accessed via the dev server
- Hot reloading is enabled

## File Structure

```
Financials Automation/
├── electron/
│   ├── main.ts           # Main Electron process
│   ├── server.ts         # Backend server management
│   ├── preload.ts        # Preload scripts
│   └── standalone-server.js  # (Unused, kept for reference)
├── .output/              # Built Nitro server (created by build)
│   ├── server/
│   │   └── index.mjs     # Nitro server entry point
│   └── public/           # Static assets
├── dist-electron/        # Electron build output (installers)
└── src/
    ├── server/           # Backend source code
    └── routes/           # Frontend routes
```

## Environment Variables

The Electron app sets these automatically:

- `NODE_ENV=production`
- `DATABASE_URL=file:{USER_DATA}/database.db`
- `JWT_SECRET=electron-app-secret-key-change-in-production`
- `ADMIN_PASSWORD=admin123`
- `PORT=3100`
- `ELECTRON_APP=true`

**Security Note**: The default JWT_SECRET and ADMIN_PASSWORD should be changed for production releases. These can be set via environment variables or a config file.

## Troubleshooting

### Server Doesn't Start

**Symptom**: Electron app shows error dialog "Server Startup Failed"

**Solutions**:
1. Check console logs for specific errors
2. Verify `.output` directory exists (run `npm run build`)
3. Ensure port 3100 is not in use by another application
4. Check that all dependencies are installed

### Login Not Working

**Symptom**: Login page shows but authentication fails

**Solutions**:
1. Verify the backend server is running (check console logs for "Backend server started")
2. Check that the database file is being created in the user data directory
3. Open DevTools (View > Toggle Developer Tools) and check the Network tab for API errors
4. Verify the server is responding: The window should load from `http://localhost:3100`

### Database Errors

**Symptom**: "Cannot find module '@prisma/client'" or database connection errors

**Solutions**:
1. Run `npm run generate` to regenerate the Prisma client
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`
3. Verify the Prisma schema is compatible with SQLite (no PostgreSQL-specific features)

### Build Errors

**Symptom**: `npm run build` or `npm run dist:win` fails

**Solutions**:
1. Clear build cache: `rm -rf .vinxi .output dist dist-electron`
2. Reinstall dependencies: `npm install --legacy-peer-deps`
3. Run build steps individually to identify the failing step
4. Check that TypeScript compilation succeeds: `npm run build:electron`

## Testing

To test the built app without creating an installer:

```bash
# Build everything
npm run build
npm run build:electron

# Test the server directly
NODE_ENV=production DATABASE_URL="file:/tmp/test.db" JWT_SECRET="test" ADMIN_PASSWORD="test" ELECTRON_APP=true node .output/server/index.mjs

# In another terminal, test with Electron
npm run electron
```

## Security Considerations

1. **JWT Secret**: Change the default JWT_SECRET in production
2. **Admin Password**: Change the default ADMIN_PASSWORD in production
3. **Database Encryption**: Consider encrypting the SQLite database file
4. **Code Signing**: Sign the Electron app for distribution
5. **Auto-Updates**: Implement secure auto-update mechanism

## Future Improvements

1. **Database Encryption**: Encrypt the SQLite database at rest
2. **Backup/Restore**: Add database backup and restore functionality
3. **Multiple Database Support**: Allow users to switch between database files
4. **Cloud Sync**: Optional cloud synchronization for database
5. **Performance**: Optimize startup time and memory usage
