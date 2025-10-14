module.exports = {
  appId: 'com.financialstatements.generator',
  productName: 'Financial Statement Generator',
  directories: {
    output: 'dist-electron'
  },
  files: [
    '.output/**/*',
    'electron/main.cjs',
    'electron/preload.cjs',
    'node_modules/**/*',
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
