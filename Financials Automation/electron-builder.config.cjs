module.exports = {
  appId: 'com.financialstatements.generator',
  productName: 'Financial Statement Generator',
  directories: {
    output: 'dist-electron'
  },
  files: [
    'electron/main.cjs',
    'electron/preload.cjs',
    'node_modules/**/*',
    'src/generated/prisma/**/*',
    '!.output/**/*'  // Exclude .output from asar, we'll use extraResources instead
  ],
  extraResources: [
    {
      from: '.output',
      to: '.output',
      filter: ['**/*']
    },
    {
      from: 'resources/node',
      to: 'node',
      filter: ['**/*']
    },
    {
      from: 'config.env.template',
      to: 'config.env.template'
    },
    {
      from: 'INSTALLATION_SETUP_GUIDE.md',
      to: 'INSTALLATION_SETUP_GUIDE.md'
    },
    {
      from: '../QUICK_START.md',
      to: 'QUICK_START.md'
    },
    {
      from: '../POSTGRESQL_SETUP_GUIDE.md',
      to: 'POSTGRESQL_SETUP_GUIDE.md'
    }
  ],
  asarUnpack: [
    'node_modules/@prisma/**/*',
    'node_modules/.prisma/**/*',
    'src/generated/prisma/**/*'
  ],
  win: {
    target: 'nsis',
    artifactName: '${productName}-Setup-${version}.exe',
    publisherName: 'SMBC'
  },
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    perMachine: false,
    runAfterFinish: true,
    deleteAppDataOnUninstall: false,
    // Add GUID to help Windows track the application
    guid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    include: 'installer.nsh'
  }
};
