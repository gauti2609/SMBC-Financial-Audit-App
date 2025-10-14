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
