import React, { useState, useEffect } from 'react';
import {
  FolderIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface DesktopFileManagerProps {
  onDownloadPathChange?: (path: string) => void;
  onUploadPathChange?: (path: string) => void;
}

export default function DesktopFileManager({ 
  onDownloadPathChange, 
  onUploadPathChange 
}: DesktopFileManagerProps) {
  const [downloadPath, setDownloadPath] = useState<string>('');
  const [uploadPath, setUploadPath] = useState<string>('');
  const [isElectron, setIsElectron] = useState(false);
  const [appInfo, setAppInfo] = useState<{ name: string; version: string }>({ name: '', version: '' });

  // Check if running in Electron environment
  useEffect(() => {
    const checkElectron = () => {
      return typeof window !== 'undefined' && window.electronAPI;
    };

    setIsElectron(checkElectron());

    if (checkElectron()) {
      loadInitialSettings();
      setupEventListeners();
    }

    return () => {
      if (checkElectron()) {
        window.electronAPI.removeAllListeners('download-folder-selected');
        window.electronAPI.removeAllListeners('upload-folder-selected');
        window.electronAPI.removeAllListeners('open-export-settings');
      }
    };
  }, []);

  const loadInitialSettings = async () => {
    try {
      const preferences = await window.electronAPI.getUserPreferences();
      const appName = await window.electronAPI.getAppName();
      const appVersion = await window.electronAPI.getAppVersion();

      setDownloadPath(preferences.downloadPath || '');
      setUploadPath(preferences.uploadPath || '');
      setAppInfo({ name: appName, version: appVersion });

      if (preferences.downloadPath && onDownloadPathChange) {
        onDownloadPathChange(preferences.downloadPath);
      }
      if (preferences.uploadPath && onUploadPathChange) {
        onUploadPathChange(preferences.uploadPath);
      }
    } catch (error) {
      console.error('Failed to load initial settings:', error);
      toast.error('Failed to load application settings');
    }
  };

  const setupEventListeners = () => {
    window.electronAPI.onDownloadFolderSelected((path: string) => {
      setDownloadPath(path);
      if (onDownloadPathChange) {
        onDownloadPathChange(path);
      }
      toast.success('Download folder updated successfully');
    });

    window.electronAPI.onUploadFolderSelected((path: string) => {
      setUploadPath(path);
      if (onUploadPathChange) {
        onUploadPathChange(path);
      }
      toast.success('Upload folder updated successfully');
    });

    window.electronAPI.onOpenExportSettings(() => {
      // Navigate to export settings or open modal
      toast.info('Opening export settings...');
    });
  };

  const handleSelectDownloadFolder = async () => {
    try {
      const result = await window.electronAPI.selectFilePath({
        title: 'Select Download Folder',
        defaultPath: downloadPath || await window.electronAPI.getAppPath('downloads'),
        properties: ['openDirectory'],
      });

      if (result && result.length > 0) {
        const selectedPath = result[0];
        setDownloadPath(selectedPath);
        if (onDownloadPathChange) {
          onDownloadPathChange(selectedPath);
        }
        toast.success('Download folder updated');
      }
    } catch (error) {
      console.error('Failed to select download folder:', error);
      toast.error('Failed to select download folder');
    }
  };

  const handleSelectUploadFolder = async () => {
    try {
      const result = await window.electronAPI.selectFilePath({
        title: 'Select Upload Folder',
        defaultPath: uploadPath || await window.electronAPI.getAppPath('documents'),
        properties: ['openDirectory'],
      });

      if (result && result.length > 0) {
        const selectedPath = result[0];
        setUploadPath(selectedPath);
        if (onUploadPathChange) {
          onUploadPathChange(selectedPath);
        }
        toast.success('Upload folder updated');
      }
    } catch (error) {
      console.error('Failed to select upload folder:', error);
      toast.error('Failed to select upload folder');
    }
  };

  const handleOpenDownloadFolder = async () => {
    if (downloadPath) {
      try {
        await window.electronAPI.showItemInFolder(downloadPath);
      } catch (error) {
        console.error('Failed to open download folder:', error);
        toast.error('Failed to open download folder');
      }
    }
  };

  const handleOpenUploadFolder = async () => {
    if (uploadPath) {
      try {
        await window.electronAPI.showItemInFolder(uploadPath);
      } catch (error) {
        console.error('Failed to open upload folder:', error);
        toast.error('Failed to open upload folder');
      }
    }
  };

  const truncatePath = (path: string, maxLength: number = 50) => {
    if (path.length <= maxLength) return path;
    const parts = path.split(/[/\\]/);
    if (parts.length <= 2) return path;
    
    return `${parts[0]}${path.includes('/') ? '/' : '\\'}...${path.includes('/') ? '/' : '\\'}${parts[parts.length - 1]}`;
  };

  // Don't render if not in Electron environment
  if (!isElectron) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <CogIcon className="h-6 w-6 text-indigo-600 mr-2" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Desktop File Management</h3>
          <p className="text-sm text-gray-600">Configure local file paths for uploads and downloads</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Download Path Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <DocumentArrowDownIcon className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Download Folder</h4>
            </div>
            <div className="flex items-center space-x-2">
              {downloadPath && (
                <button
                  onClick={handleOpenDownloadFolder}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Open Folder
                </button>
              )}
              <button
                onClick={handleSelectDownloadFolder}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Change
              </button>
            </div>
          </div>
          
          <div className="flex items-center">
            <FolderIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-600 font-mono">
              {downloadPath ? truncatePath(downloadPath) : 'No folder selected'}
            </span>
            {downloadPath && (
              <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Exported financial statements will be saved to this folder
          </p>
        </div>

        {/* Upload Path Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <DocumentArrowUpIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Upload Folder</h4>
            </div>
            <div className="flex items-center space-x-2">
              {uploadPath && (
                <button
                  onClick={handleOpenUploadFolder}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Open Folder
                </button>
              )}
              <button
                onClick={handleSelectUploadFolder}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Change
              </button>
            </div>
          </div>
          
          <div className="flex items-center">
            <FolderIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-600 font-mono">
              {uploadPath ? truncatePath(uploadPath) : 'No folder selected'}
            </span>
            {uploadPath && (
              <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Default location for selecting files to upload (trial balance, schedules, etc.)
          </p>
        </div>

        {/* Status Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Application Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Application:</span>
              <span className="font-medium">{appInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">{appInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mode:</span>
              <span className="font-medium text-green-600">Desktop Application</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">File Access:</span>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="font-medium text-green-600">Local File System</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSelectDownloadFolder}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">Set Download Path</span>
            </button>
            <button
              onClick={handleSelectUploadFolder}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">Set Upload Path</span>
            </button>
          </div>
        </div>

        {/* Warning for missing paths */}
        {(!downloadPath || !uploadPath) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Setup Required</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Please configure both download and upload folders for optimal desktop experience.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
