"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // File system operations
    selectFilePath: (options) => electron_1.ipcRenderer.invoke('select-file-path', options),
    saveFileDialog: (options) => electron_1.ipcRenderer.invoke('save-file-dialog', options),
    readLocalFile: (filePath) => electron_1.ipcRenderer.invoke('read-local-file', filePath),
    writeLocalFile: (filePath, data, encoding) => electron_1.ipcRenderer.invoke('write-local-file', filePath, data, encoding),
    showItemInFolder: (filePath) => electron_1.ipcRenderer.invoke('show-item-in-folder', filePath),
    openExternal: (url) => electron_1.ipcRenderer.invoke('open-external', url),
    // User preferences
    getUserPreferences: () => electron_1.ipcRenderer.invoke('get-user-preferences'),
    // App information
    getAppVersion: () => electron_1.ipcRenderer.invoke('app-version'),
    getAppName: () => electron_1.ipcRenderer.invoke('app-name'),
    getAppPath: (name) => electron_1.ipcRenderer.invoke('get-app-path', name),
    // Event listeners
    onDownloadFolderSelected: (callback) => {
        electron_1.ipcRenderer.on('download-folder-selected', (event, path) => callback(path));
    },
    onUploadFolderSelected: (callback) => {
        electron_1.ipcRenderer.on('upload-folder-selected', (event, path) => callback(path));
    },
    onOpenExportSettings: (callback) => {
        electron_1.ipcRenderer.on('open-export-settings', callback);
    },
    // Remove listeners
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
});
