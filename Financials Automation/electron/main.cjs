"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const os_1 = require("os");
// Keep a global reference of the window object
let mainWindow = null;
// Application settings
const APP_NAME = 'Financial Statement Generator';
const DEFAULT_DOWNLOAD_PATH = (0, path_1.join)((0, os_1.homedir)(), 'Documents', 'Financial Exports');
const DEFAULT_UPLOAD_PATH = (0, path_1.join)((0, os_1.homedir)(), 'Documents');
// Create the main application window
function createWindow() {
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
        mainWindow.loadFile((0, path_1.join)(__dirname, '../dist/index.html'));
    }
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        // Focus on the window
        if (process.platform === 'darwin') {
            electron_1.app.dock.show();
        }
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
        electron_1.app.quit();
    }
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
