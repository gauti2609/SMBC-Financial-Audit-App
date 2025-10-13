import { contextBridge, ipcRenderer } from 'electron';
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // File system operations
    selectFilePath: (options) => ipcRenderer.invoke('select-file-path', options),
    saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
    readLocalFile: (filePath) => ipcRenderer.invoke('read-local-file', filePath),
    writeLocalFile: (filePath, data, encoding) => ipcRenderer.invoke('write-local-file', filePath, data, encoding),
    showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    // User preferences
    getUserPreferences: () => ipcRenderer.invoke('get-user-preferences'),
    // App information
    getAppVersion: () => ipcRenderer.invoke('app-version'),
    getAppName: () => ipcRenderer.invoke('app-name'),
    getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),
    // Event listeners
    onDownloadFolderSelected: (callback) => {
        ipcRenderer.on('download-folder-selected', (event, path) => callback(path));
    },
    onUploadFolderSelected: (callback) => {
        ipcRenderer.on('upload-folder-selected', (event, path) => callback(path));
    },
    onOpenExportSettings: (callback) => {
        ipcRenderer.on('open-export-settings', callback);
    },
    // Remove listeners
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },
});
