module.exports = {
  appId: 'com.financialstatements.generator',
  productName: 'Financial Statement Generator',
  copyright: 'Copyright © 2024 Financial Statement Generator',
  
  // Application metadata
  directories: {
    output: 'dist-electron',
    buildResources: 'electron/assets'
  },
  
  files: [
    'dist/**/*',
    '.output/**/*',
    'electron/main.js',
    'electron/preload.js',
    'electron/server.js',
    'electron/standalone-server.js',
    'prisma/schema.prisma',
    'node_modules/.prisma/**/*',
    'node_modules/@prisma/**/*',
    'node_modules/**/*',
    '!node_modules/**/*.{md,markdown,txt}',
    '!node_modules/**/LICENSE*',
    '!node_modules/**/*.d.ts',
    '!node_modules/**/{test,tests,spec,specs}/**/*',
    '!node_modules/**/{example,examples,demo,demos}/**/*',
    '!node_modules/**/.bin',
    '!node_modules/**/man',
    '!node_modules/**/docs'
  ],
  
  extraResources: [
    {
      from: 'electron/assets',
      to: 'assets',
      filter: ['**/*']
    },
    {
      from: 'LICENSE',
      to: 'LICENSE.txt'
    }
  ],

  // Windows configuration - optimized for Windows 10/11
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']  // Focus on x64 for Windows 10/11
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    // icon: 'electron/assets/icon.ico', // Temporarily commented - use PNG until ICO is available
    icon: 'electron/assets/icon.png', // Use existing PNG file
    artifactName: '${productName}-${version}-windows-${arch}.${ext}',
    publisherName: 'Financial Statement Generator',
    verifyUpdateCodeSignature: false,
    requestedExecutionLevel: 'asInvoker',
    
    // Windows 10/11 specific optimizations
    signAndEditExecutable: false,
    signDlls: false,
    
    // File associations for financial files - commented out until icons are available
    /*
    fileAssociations: [
      {
        ext: 'xlsx',
        name: 'Excel Workbook',
        description: 'Microsoft Excel Workbook',
        role: 'Editor',
        icon: 'electron/assets/excel-icon.ico'
      },
      {
        ext: 'csv',
        name: 'CSV File', 
        description: 'Comma Separated Values File',
        role: 'Editor',
        icon: 'electron/assets/csv-icon.ico'
      },
      {
        ext: 'json',
        name: 'JSON Data File',
        description: 'JavaScript Object Notation Data File',
        role: 'Editor'
      }
    ],
    */
    
    // Windows registry entries
    env: {
      ELECTRON_IS_DEV: '0',
      NODE_ENV: 'production'
    }
  },

  // Windows installer (NSIS) configuration - optimized for deployment
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'electron/assets/icon.png',
    uninstallerIcon: 'electron/assets/icon.png',
    installerHeaderIcon: 'electron/assets/icon.png',
    createDesktopShortcut: 'always',
    createStartMenuShortcut: true,
    shortcutName: 'Financial Statement Generator',
    
    // Custom installer script - commented out until script is available
    // include: 'electron/installer.nsh',
    
    // License agreement
    license: 'LICENSE',
    
    // Installer language and localization
    language: '1033', // English (United States)
    displayLanguageSelector: false,
    installerLanguages: ['en_US'],
    
    // Installation behavior
    deleteAppDataOnUninstall: false, // Keep user data for reinstalls
    runAfterFinish: true,
    
    // Registry and system integration
    menuCategory: 'Financial Tools',
    
    // Modern installer appearance - commented out until images are available
    // installerSidebar: 'electron/assets/installer-sidebar.bmp',
    // installerHeader: 'electron/assets/installer-header.bmp',
    
    // Advanced NSIS options for Windows 10/11
    packElevateHelper: true,
    perMachine: false, // Install per user by default (recommended for Windows 10/11)
    allowElevation: true,
    multiUserInstallation: false,
    
    // Windows 10/11 compatibility
    unicode: true,
    warningsAsErrors: false,
    
    // Custom NSIS defines for enhanced Windows integration
    defines: {
      APP_DESCRIPTION: 'Professional Financial Statement Generation Tool for Schedule III Compliance',
      COMPANY_NAME: 'Financial Statement Generator',
      COPYRIGHT: 'Copyright © 2024 Financial Statement Generator',
      APP_VERSION: '${version}',
      INSTALL_MODE_PER_ALL_USERS: 'false',
      // Windows 10/11 specific defines
      WIN10_COMPATIBILITY: 'true',
      MODERN_UI: 'true'
    },
    
    // Uninstaller configuration
    uninstallDisplayName: '${productName}',
    guid: '{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}', // Unique GUID for the application
    
    // Windows Store compatibility
    artifactName: '${productName}-Setup-${version}.${ext}',
    
    // Digital signature placeholder (for production)
    // certificateFile: 'path/to/certificate.p12',
    // certificatePassword: 'certificate_password',
    
    // Additional Windows integration
    deleteAppDataOnUninstall: false,
    differentialPackage: true
  },

  // Portable app configuration
  portable: {
    artifactName: '${productName}-${version}-Portable.${ext}',
    requestExecutionLevel: 'user'
  },

  // Build optimization
  compression: 'maximum',
  
  // Electron version (ensure compatibility with Windows 10/11)
  electronVersion: '27.0.0',
  
  // Build performance
  nodeGypRebuild: false,
  npmRebuild: false,
  buildDependenciesFromSource: false,
  
  // Metadata for Windows
  buildVersion: '1.0.0',
  
  // Protocol handlers for deep linking
  protocols: [
    {
      name: 'Financial Statement Generator',
      schemes: ['financial-generator'],
      role: 'Editor'
    }
  ],

  // Squirrel.Windows configuration (alternative to NSIS) - commented out until assets are available
  /*
  squirrelWindows: {
    iconUrl: 'https://raw.githubusercontent.com/your-repo/financial-statement-generator/main/electron/assets/icon.ico',
    loadingGif: 'electron/assets/loading.gif',
    msi: true,
    remoteReleases: false
  },
  */

  // Auto-updater configuration (for production)
  publish: [
    {
      provider: 'github',
      owner: 'your-github-username',
      repo: 'financial-statement-generator',
      releaseType: 'release',
      publishAutoUpdate: true
    }
  ],

  // Directories and paths
  buildResources: 'electron/assets',
  
  // Additional Windows-specific metadata
  win32metadata: {
    CompanyName: 'Financial Statement Generator',
    FileDescription: 'Professional Financial Statement Generation Tool',
    OriginalFilename: 'Financial Statement Generator.exe',
    ProductName: 'Financial Statement Generator',
    InternalName: 'financial-statement-generator'
  },

  // macOS configuration (for future cross-platform support)
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'electron/assets/icon.icns',
    category: 'public.app-category.business',
    artifactName: '${productName}-${version}-${arch}.${ext}',
    darkModeSupport: true
  },

  // Linux configuration (for future cross-platform support)
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      }
    ],
    icon: 'electron/assets/icon.png',
    category: 'Office',
    artifactName: '${productName}-${version}-${arch}.${ext}'
  }
};
