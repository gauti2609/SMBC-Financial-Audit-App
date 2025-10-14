"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const os_1 = require("os");
const child_process_1 = require("child_process");
// Keep a global reference of the window object
let mainWindow = null;
let serverProcess = null;
// Application settings
const APP_NAME = 'Financial Statement Generator';
const DEFAULT_DOWNLOAD_PATH = (0, path_1.join)((0, os_1.homedir)(), 'Documents', 'Financial Exports');
const DEFAULT_UPLOAD_PATH = (0, path_1.join)((0, os_1.homedir)(), 'Documents');
// Start the backend server
async function startServer() {
    return new Promise((resolve, reject) => {
        // In packaged app, resources are in app.asar.unpacked or resources folder
        // We need to check multiple potential locations
        let serverPath;
        let basePath;
        if (electron_1.app.isPackaged) {
            // In production, check multiple possible locations
            // First try: app.asar.unpacked (this is where asarUnpack puts files)
            basePath = __dirname.replace('app.asar', 'app.asar.unpacked');
            serverPath = (0, path_1.join)(basePath, '.output', 'server', 'index.mjs');
            console.log('Running in packaged mode');
            console.log('__dirname:', __dirname);
            console.log('Base path:', basePath);
            console.log('Server path:', serverPath);
            // If not found, try resources path
            if (!(0, fs_1.existsSync)(serverPath)) {
                console.log('Server not found in app.asar.unpacked, trying resources path...');
                serverPath = (0, path_1.join)(process.resourcesPath, '.output', 'server', 'index.mjs');
                console.log('Alternative server path:', serverPath);
            }
        }
        else {
            // In development
            basePath = (0, path_1.join)(__dirname, '..');
            serverPath = (0, path_1.join)(basePath, '.output', 'server', 'index.mjs');
            console.log('Running in dev mode, server path:', serverPath);
        }
        // Check if server file exists
        if (!(0, fs_1.existsSync)(serverPath)) {
            const error = new Error(`Server file not found at: ${serverPath}`);
            console.error(error.message);
            console.error('Attempted paths:');
            if (electron_1.app.isPackaged) {
                console.error('  - app.asar.unpacked:', (0, path_1.join)(__dirname.replace('app.asar', 'app.asar.unpacked'), '.output', 'server', 'index.mjs'));
                console.error('  - resources:', (0, path_1.join)(process.resourcesPath, '.output', 'server', 'index.mjs'));
            }
            reject(error);
            return;
        }
        const port = 3000; // Default port
        console.log('Starting server from:', serverPath);
        // Set environment variables for the server
        const serverEnv = {
            ...process.env,
            PORT: String(port),
            NODE_ENV: 'production',
            // Pass the database URL if configured
            DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/financialsdb',
        };
        serverProcess = (0, child_process_1.spawn)('node', [serverPath], {
            env: serverEnv,
            stdio: ['ignore', 'pipe', 'pipe'],
            cwd: basePath,
        });
        let serverStarted = false;
        serverProcess.stdout?.on('data', (data) => {
            const output = data.toString();
            console.log('[Server]:', output);
            // Check if server has started
            if (!serverStarted && (output.includes('Listening') || output.includes('listening') || output.includes(String(port)))) {
                serverStarted = true;
                resolve(port);
            }
        });
        serverProcess.stderr?.on('data', (data) => {
            const errorOutput = data.toString();
            console.error('[Server Error]:', errorOutput);
            // If we see a critical error before server starts, reject
            if (!serverStarted && errorOutput.includes('Error')) {
                reject(new Error(errorOutput));
            }
        });
        serverProcess.on('error', (error) => {
            console.error('Failed to start server process:', error);
            reject(error);
        });
        serverProcess.on('exit', (code) => {
            console.log('Server process exited with code:', code);
            if (code !== 0 && code !== null && !serverStarted) {
                reject(new Error(`Server exited with code ${code}`));
            }
            serverProcess = null;
        });
        // Timeout after 15 seconds
        setTimeout(() => {
            if (!serverStarted) {
                console.warn('Server start timeout - assuming it started');
                resolve(port); // Resolve anyway, the server might have started
            }
        }, 15000);
    });
}
// Stop the backend server
function stopServer() {
    if (serverProcess) {
        console.log('Stopping server...');
        serverProcess.kill();
        serverProcess = null;
    }
}
// Create the main application window
async function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: (0, path_1.join)(__dirname, 'preload.cjs'),
            webSecurity: true,
        },
        icon: (0, path_1.join)(__dirname, '../assets/icon.png'), // App icon
        title: APP_NAME,
        show: false, // Don't show until ready
        titleBarStyle: 'default',
    });
    // Load the React application
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        // Start the backend server first
        try {
            console.log('Attempting to start backend server...');
            const port = await startServer();
            console.log(`Server started on port ${port}, loading frontend...`);
            // Load from the local server instead of file://
            await mainWindow.loadURL(`http://localhost:${port}`);
            console.log('Frontend loaded successfully');
        }
        catch (error) {
            console.error('Failed to start application:', error);
            // Show detailed error to user
            const errorMessage = error instanceof Error ? error.message : String(error);
            await electron_1.dialog.showMessageBox({
                type: 'error',
                title: 'Application Startup Error',
                message: 'Failed to start the Financial Statement Generator',
                detail: `Error: ${errorMessage}\n\nPlease check:\n1. PostgreSQL database is running\n2. Database connection is configured correctly\n3. No other application is using port 3000\n\nCheck the console for more details.`,
                buttons: ['Open DevTools', 'Quit'],
            }).then((result) => {
                if (result.response === 0) {
                    // Open DevTools to show console
                    mainWindow?.webContents.openDevTools();
                }
                else {
                    electron_1.app.quit();
                }
            });
        }
    }
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        // Focus on the window
        if (process.platform === 'darwin') {
            electron_1.app.dock.show();
        }
    });
    // If loading fails, show the window anyway with devtools
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load page:', errorCode, errorDescription);
        mainWindow?.show();
        mainWindow?.webContents.openDevTools();
    });
    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
}
// App event handlers
electron_1.app.whenReady().then(() => {
    createWindow();
    createMenu();
    // Ensure default directories exist
    ensureDefaultDirectories();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        stopServer();
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    stopServer();
});
// Create application menu
function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Select Download Folder',
                    click: () => selectDownloadFolder(),
                },
                {
                    label: 'Select Upload Folder',
                    click: () => selectUploadFolder(),
                },
                { type: 'separator' },
                {
                    label: 'Export Settings',
                    click: () => openExportSettings(),
                },
                { type: 'separator' },
                {
                    role: 'quit',
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' },
            ],
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => showAbout(),
                },
                {
                    label: 'Documentation',
                    click: () => electron_1.shell.openExternal('https://docs.financialstatementgenerator.com'),
                },
            ],
        },
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
// Ensure default directories exist
async function ensureDefaultDirectories() {
    try {
        if (!(0, fs_1.existsSync)(DEFAULT_DOWNLOAD_PATH)) {
            await (0, promises_1.mkdir)(DEFAULT_DOWNLOAD_PATH, { recursive: true });
        }
    }
    catch (error) {
        console.error('Failed to create default directories:', error);
    }
}
// File and folder selection handlers
async function selectDownloadFolder() {
    if (!mainWindow)
        return;
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        defaultPath: DEFAULT_DOWNLOAD_PATH,
        title: 'Select Download Folder',
        buttonLabel: 'Select Folder',
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        // Send the selected path to the renderer process
        mainWindow.webContents.send('download-folder-selected', selectedPath);
        // Store the preference
        await storeUserPreference('downloadPath', selectedPath);
    }
}
async function selectUploadFolder() {
    if (!mainWindow)
        return;
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        defaultPath: DEFAULT_UPLOAD_PATH,
        title: 'Select Upload Folder',
        buttonLabel: 'Select Folder',
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        // Send the selected path to the renderer process
        mainWindow.webContents.send('upload-folder-selected', selectedPath);
        // Store the preference
        await storeUserPreference('uploadPath', selectedPath);
    }
}
// User preferences management
async function storeUserPreference(key, value) {
    try {
        const prefsPath = (0, path_1.join)(electron_1.app.getPath('userData'), 'preferences.json');
        let preferences = {};
        if ((0, fs_1.existsSync)(prefsPath)) {
            const data = await (0, promises_1.readFile)(prefsPath, 'utf-8');
            preferences = JSON.parse(data);
        }
        preferences[key] = value;
        await (0, promises_1.writeFile)(prefsPath, JSON.stringify(preferences, null, 2));
    }
    catch (error) {
        console.error('Failed to store user preference:', error);
    }
}
async function getUserPreferences() {
    try {
        const prefsPath = (0, path_1.join)(electron_1.app.getPath('userData'), 'preferences.json');
        if ((0, fs_1.existsSync)(prefsPath)) {
            const data = await (0, promises_1.readFile)(prefsPath, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.error('Failed to load user preferences:', error);
    }
    return {
        downloadPath: DEFAULT_DOWNLOAD_PATH,
        uploadPath: DEFAULT_UPLOAD_PATH,
    };
}
function openExportSettings() {
    if (mainWindow) {
        mainWindow.webContents.send('open-export-settings');
    }
}
function showAbout() {
    electron_1.dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'About',
        message: APP_NAME,
        detail: `Version: 1.0.0\nA professional financial statement generation tool.\n\nBuilt with Electron and React.`,
        buttons: ['OK'],
    });
}
// IPC handlers for renderer process communication
electron_1.ipcMain.handle('get-user-preferences', async () => {
    return await getUserPreferences();
});
electron_1.ipcMain.handle('select-file-path', async (event, options) => {
    if (!mainWindow)
        return null;
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        title: options.title || 'Select File',
        defaultPath: options.defaultPath,
        filters: options.filters || [
            { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] },
        ],
        properties: options.properties || ['openFile'],
    });
    return result.canceled ? null : result.filePaths;
});
electron_1.ipcMain.handle('save-file-dialog', async (event, options) => {
    if (!mainWindow)
        return null;
    const result = await electron_1.dialog.showSaveDialog(mainWindow, {
        title: options.title || 'Save File',
        defaultPath: options.defaultPath,
        filters: options.filters || [
            { name: 'Excel Files', extensions: ['xlsx'] },
            { name: 'CSV Files', extensions: ['csv'] },
        ],
    });
    return result.canceled ? null : result.filePath;
});
electron_1.ipcMain.handle('read-local-file', async (event, filePath) => {
    try {
        const data = await (0, promises_1.readFile)(filePath);
        return {
            success: true,
            data: data.toString('base64'),
            filename: filePath.split('/').pop() || filePath.split('\\').pop(),
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
});
electron_1.ipcMain.handle('write-local-file', async (event, filePath, data, encoding = 'base64') => {
    try {
        const buffer = encoding === 'base64' ? Buffer.from(data, 'base64') : Buffer.from(data, 'utf8');
        await (0, promises_1.writeFile)(filePath, buffer);
        return { success: true };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
});
electron_1.ipcMain.handle('show-item-in-folder', async (event, filePath) => {
    electron_1.shell.showItemInFolder(filePath);
});
electron_1.ipcMain.handle('open-external', async (event, url) => {
    await electron_1.shell.openExternal(url);
});
// Handle app-specific events
electron_1.ipcMain.handle('app-version', () => {
    return electron_1.app.getVersion();
});
electron_1.ipcMain.handle('app-name', () => {
    return APP_NAME;
});
electron_1.ipcMain.handle('get-app-path', (event, name) => {
    return electron_1.app.getPath(name);
});
