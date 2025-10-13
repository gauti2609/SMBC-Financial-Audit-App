import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  selectFilePath: (options?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
  }) => ipcRenderer.invoke('select-file-path', options),

  saveFileDialog: (options?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => ipcRenderer.invoke('save-file-dialog', options),

  readLocalFile: (filePath: string) => ipcRenderer.invoke('read-local-file', filePath),

  writeLocalFile: (filePath: string, data: string, encoding?: 'base64' | 'utf8') => 
    ipcRenderer.invoke('write-local-file', filePath, data, encoding),

  showItemInFolder: (filePath: string) => ipcRenderer.invoke('show-item-in-folder', filePath),

  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

  // User preferences
  getUserPreferences: () => ipcRenderer.invoke('get-user-preferences'),

  // App information
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getAppName: () => ipcRenderer.invoke('app-name'),
  getAppPath: (name: 'userData' | 'downloads' | 'documents') => ipcRenderer.invoke('get-app-path', name),

  // Event listeners
  onDownloadFolderSelected: (callback: (path: string) => void) => {
    ipcRenderer.on('download-folder-selected', (event, path) => callback(path));
  },

  onUploadFolderSelected: (callback: (path: string) => void) => {
    ipcRenderer.on('upload-folder-selected', (event, path) => callback(path));
  },

  onOpenExportSettings: (callback: () => void) => {
    ipcRenderer.on('open-export-settings', callback);
  },

  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      selectFilePath: (options?: {
        title?: string;
        defaultPath?: string;
        filters?: Array<{ name: string; extensions: string[] }>;
        properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
      }) => Promise<string[] | null>;

      saveFileDialog: (options?: {
        title?: string;
        defaultPath?: string;
        filters?: Array<{ name: string; extensions: string[] }>;
      }) => Promise<string | null>;

      readLocalFile: (filePath: string) => Promise<{
        success: boolean;
        data?: string;
        filename?: string;
        error?: string;
      }>;

      writeLocalFile: (filePath: string, data: string, encoding?: 'base64' | 'utf8') => Promise<{
        success: boolean;
        error?: string;
      }>;

      showItemInFolder: (filePath: string) => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      getUserPreferences: () => Promise<any>;
      getAppVersion: () => Promise<string>;
      getAppName: () => Promise<string>;
      getAppPath: (name: 'userData' | 'downloads' | 'documents') => Promise<string>;

      onDownloadFolderSelected: (callback: (path: string) => void) => void;
      onUploadFolderSelected: (callback: (path: string) => void) => void;
      onOpenExportSettings: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
