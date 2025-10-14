import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { spawn, ChildProcess } from 'child_process';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

// Application settings
const APP_NAME = 'Financial Statement Generator';
const DEFAULT_DOWNLOAD_PATH = join(homedir(), 'Documents', 'Financial Exports');
const DEFAULT_UPLOAD_PATH = join(homedir(), 'Documents');

// Load environment variables from config files
function loadEnvironmentVariables(): void {
  const envPaths: string[] = [];
  
  if (app.isPackaged) {
    // In production, check multiple locations for environment files
    // 1. Application data folder (user-specific config)
    const userDataEnv = join(app.getPath('userData'), 'config.env');
    envPaths.push(userDataEnv);
    
    // 2. Installation directory (alongside executable)
    const installDirEnv = join(process.resourcesPath, 'config.env');
    envPaths.push(installDirEnv);
    
    // 3. Resources directory (bundled with installer)
    const resourcesEnv = join(process.resourcesPath, '.env');
    envPaths.push(resourcesEnv);
  } else {
    // In development
    const devEnv = join(__dirname, '..', '.env');
    envPaths.push(devEnv);
  }
  
  // Try to load from each path
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      console.log(`Loading environment from: ${envPath}`);
      try {
        const envContent = readFileSync(envPath, 'utf-8');
        const envLines = envContent.split('\n');
        
        for (const line of envLines) {
          const trimmedLine = line.trim();
          // Skip empty lines and comments
          if (!trimmedLine || trimmedLine.startsWith('#')) {
            continue;
          }
          
          const [key, ...valueParts] = trimmedLine.split('=');
          const value = valueParts.join('=').trim();
          
          if (key && value) {
            // Only set if not already set (system env vars take precedence)
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = value;
              console.log(`Loaded env variable: ${key.trim()}`);
            } else {
              console.log(`Env variable already set: ${key.trim()} (using system value)`);
            }
          }
        }
        
        console.log(`Successfully loaded environment from: ${envPath}`);
        break; // Stop after first successful load
      } catch (error) {
        console.error(`Failed to load environment from ${envPath}:`, error);
      }
    } else {
      console.log(`Environment file not found: ${envPath}`);
    }
  }
  
  // Log final DATABASE_URL status (masked)
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    const masked = dbUrl.substring(0, 15) + '***' + dbUrl.substring(dbUrl.length - 10);
    console.log(`DATABASE_URL configured: ${masked}`);
  } else {
    console.warn('WARNING: DATABASE_URL not configured!');
  }
}

// Start the backend server
async function startServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    // In packaged app, resources are in app.asar.unpacked or resources folder
    // We need to check multiple potential locations
    let serverPath: string;
    let basePath: string;
    
    if (app.isPackaged) {
      // In production, check multiple possible locations
      // First try: app.asar.unpacked (this is where asarUnpack puts files)
      basePath = __dirname.replace('app.asar', 'app.asar.unpacked');
      serverPath = join(basePath, '.output', 'server', 'index.mjs');
      
      console.log('Running in packaged mode');
      console.log('__dirname:', __dirname);
      console.log('Base path:', basePath);
      console.log('Server path:', serverPath);
      
      // If not found, try resources path
      if (!existsSync(serverPath)) {
        console.log('Server not found in app.asar.unpacked, trying resources path...');
        serverPath = join(process.resourcesPath, '.output', 'server', 'index.mjs');
        console.log('Alternative server path:', serverPath);
      }
    } else {
      // In development
      basePath = join(__dirname, '..');
      serverPath = join(basePath, '.output', 'server', 'index.mjs');
      console.log('Running in dev mode, server path:', serverPath);
    }
    
    // Check if server file exists
    if (!existsSync(serverPath)) {
      const error = new Error(`Server file not found at: ${serverPath}`);
      console.error(error.message);
      console.error('Attempted paths:');
      if (app.isPackaged) {
        console.error('  - app.asar.unpacked:', join(__dirname.replace('app.asar', 'app.asar.unpacked'), '.output', 'server', 'index.mjs'));
        console.error('  - resources:', join(process.resourcesPath, '.output', 'server', 'index.mjs'));
      }
      reject(error);
      return;
    }
    
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      const error = new Error(
        'DATABASE_URL environment variable is not configured.\n\n' +
        'Please configure the database connection using one of these methods:\n\n' +
        '1. Create a config.env file in the application data folder:\n' +
        `   Location: ${join(app.getPath('userData'), 'config.env')}\n` +
        '   Content: DATABASE_URL=postgresql://username:password@host:port/database\n\n' +
        '2. Set a system environment variable:\n' +
        '   PowerShell (Admin): [System.Environment]::SetEnvironmentVariable(\'DATABASE_URL\', \'postgresql://username:password@host:port/database\', \'User\')\n' +
        '   Then restart your computer.\n\n' +
        '3. Copy config.env.template from installation folder and rename to config.env\n' +
        `   Installation folder: ${process.resourcesPath}\n\n` +
        'See QUICK_START.md and POSTGRESQL_SETUP_GUIDE.md in the installation folder for detailed instructions.'
      );
      console.error(error.message);
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
    
    serverProcess = spawn('node', [serverPath], {
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
function stopServer(): void {
  if (serverProcess) {
    console.log('Stopping server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

// Create the main application window
async function createWindow(): Promise<void> {
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
    // Start the backend server first
    try {
      console.log('Attempting to start backend server...');
      const port = await startServer();
      console.log(`Server started on port ${port}, loading frontend...`);
      
      // Load from the local server instead of file://
      await mainWindow.loadURL(`http://localhost:${port}`);
      console.log('Frontend loaded successfully');
    } catch (error) {
      console.error('Failed to start application:', error);
      
      // Show detailed error to user
      const errorMessage = error instanceof Error ? error.message : String(error);
      await dialog.showMessageBox({
        type: 'error',
        title: 'Application Startup Error',
        message: 'Failed to start the Financial Statement Generator',
        detail: `Error: ${errorMessage}\n\nPlease check:\n1. PostgreSQL database is running\n2. Database connection is configured correctly\n3. No other application is using port 3000\n\nCheck the console for more details.`,
        buttons: ['Open DevTools', 'Quit'],
      }).then((result) => {
        if (result.response === 0) {
          // Open DevTools to show console
          mainWindow?.webContents.openDevTools();
        } else {
          app.quit();
        }
      });
    }
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Focus on the window
    if (process.platform === 'darwin') {
      app.dock.show();
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
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(() => {
  // Load environment variables before doing anything else
  loadEnvironmentVariables();
  
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
    stopServer();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
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
