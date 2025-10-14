import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

// Application settings
const APP_NAME = 'Financial Statement Generator';
const DEFAULT_DOWNLOAD_PATH = join(homedir(), 'Documents', 'Financial Exports');
const DEFAULT_UPLOAD_PATH = join(homedir(), 'Documents');

// Create the main application window
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.cjs'),
      webSecurity: true,
    },
    icon: join(__dirname, '../assets/icon.png'), // App icon
    title: APP_NAME,
    show: false, // Don't show until ready
    titleBarStyle: 'default',
  });

  // Load the React application
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Focus on the window
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  // Ensure default directories exist
  ensureDefaultDirectories();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create application menu
function createMenu(): void {
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
          click: () => shell.openExternal('https://docs.financialstatementgenerator.com'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
}

// Ensure default directories exist
async function ensureDefaultDirectories(): Promise<void> {
  try {
    if (!existsSync(DEFAULT_DOWNLOAD_PATH)) {
      await mkdir(DEFAULT_DOWNLOAD_PATH, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create default directories:', error);
  }
}

// File and folder selection handlers
async function selectDownloadFolder(): Promise<void> {
  if (!mainWindow) return;

  const result = await dialog.showOpenDialog(mainWindow, {
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

async function selectUploadFolder(): Promise<void> {
  if (!mainWindow) return;

  const result = await dialog.showOpenDialog(mainWindow, {
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
async function storeUserPreference(key: string, value: any): Promise<void> {
  try {
    const prefsPath = join(app.getPath('userData'), 'preferences.json');
    let preferences: any = {};

    if (existsSync(prefsPath)) {
      const data = await readFile(prefsPath, 'utf-8');
      preferences = JSON.parse(data);
    }

    preferences[key] = value;
    await writeFile(prefsPath, JSON.stringify(preferences, null, 2));
  } catch (error) {
    console.error('Failed to store user preference:', error);
  }
}

async function getUserPreferences(): Promise<any> {
  try {
    const prefsPath = join(app.getPath('userData'), 'preferences.json');
    
    if (existsSync(prefsPath)) {
      const data = await readFile(prefsPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load user preferences:', error);
  }
  
  return {
    downloadPath: DEFAULT_DOWNLOAD_PATH,
    uploadPath: DEFAULT_UPLOAD_PATH,
  };
}

function openExportSettings(): void {
  if (mainWindow) {
    mainWindow.webContents.send('open-export-settings');
  }
}

function showAbout(): void {
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'About',
    message: APP_NAME,
    detail: `Version: 1.0.0\nA professional financial statement generation tool.\n\nBuilt with Electron and React.`,
    buttons: ['OK'],
  });
}

// IPC handlers for renderer process communication
ipcMain.handle('get-user-preferences', async () => {
  return await getUserPreferences();
});

ipcMain.handle('select-file-path', async (event, options: {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
}) => {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
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

ipcMain.handle('save-file-dialog', async (event, options: {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}) => {
  if (!mainWindow) return null;

  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Save File',
    defaultPath: options.defaultPath,
    filters: options.filters || [
      { name: 'Excel Files', extensions: ['xlsx'] },
      { name: 'CSV Files', extensions: ['csv'] },
    ],
  });

  return result.canceled ? null : result.filePath;
});

ipcMain.handle('read-local-file', async (event, filePath: string) => {
  try {
    const data = await readFile(filePath);
    return {
      success: true,
      data: data.toString('base64'),
      filename: filePath.split('/').pop() || filePath.split('\\').pop(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

ipcMain.handle('write-local-file', async (event, filePath: string, data: string, encoding: 'base64' | 'utf8' = 'base64') => {
  try {
    const buffer = encoding === 'base64' ? Buffer.from(data, 'base64') : Buffer.from(data, 'utf8');
    await writeFile(filePath, buffer);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

ipcMain.handle('show-item-in-folder', async (event, filePath: string) => {
  shell.showItemInFolder(filePath);
});

ipcMain.handle('open-external', async (event, url: string) => {
  await shell.openExternal(url);
});

// Handle app-specific events
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('app-name', () => {
  return APP_NAME;
});

ipcMain.handle('get-app-path', (event, name: 'userData' | 'downloads' | 'documents') => {
  return app.getPath(name);
});
