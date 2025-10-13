module.exports = {
  appId: 'com.financialstatements.generator',
  productName: 'Financial Statement Generator',
  directories: {
    output: 'dist-electron'
  },
  files: [
    'dist/**/*',
    'electron/main.js',
    'electron/preload.js',
    'node_modules/**/*'
  ],
  win: {
    target: 'nsis',
    artifactName: '${productName}-Setup-${version}.exe'
  },
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
};
