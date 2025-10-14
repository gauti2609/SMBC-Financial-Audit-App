!macro customInit
  ; Check if the application is running and close it
  ${ifNot} ${isUpdated}
    !insertmacro CheckAndCloseApp
  ${endIf}
!macroend

!macro CheckAndCloseApp
  ; Try to close running instances gracefully
  nsExec::ExecToStack 'taskkill /IM "Financial Statement Generator.exe" /F'
  Pop $0
  
  ; Wait for process to close
  Sleep 2000
!macroend

!macro customInstall
  DetailPrint "Installing Financial Statement Generator..."
  
  ; Create a default config.env in user's AppData if it doesn't exist
  DetailPrint "Setting up configuration..."
  CreateDirectory "$APPDATA\Financial Statement Generator"
!macroend

!macro customUnInstall
  DetailPrint "Uninstalling Financial Statement Generator..."
!macroend

; Show important setup information after installation
!macro customFinish
  ; Create a shortcut to the installation setup guide on desktop
  CreateShortcut "$DESKTOP\Setup Instructions - Financial Statement Generator.lnk" "$INSTDIR\resources\INSTALLATION_SETUP_GUIDE.md"
  
  ; Show message box with critical setup instructions
  MessageBox MB_OK|MB_ICONINFORMATION "\
    Installation Complete!$\r$\n$\r$\n\
    IMPORTANT: Before launching the application, you must:$\r$\n$\r$\n\
    1. Create database 'financialsdb' in PostgreSQL$\r$\n\
    2. Create config.env file in: %APPDATA%\Financial Statement Generator$\r$\n\
    3. Add this line to config.env:$\r$\n\
       DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/financialsdb$\r$\n$\r$\n\
    A desktop shortcut 'Setup Instructions' has detailed steps.$\r$\n$\r$\n\
    Documentation: $INSTDIR\resources\INSTALLATION_SETUP_GUIDE.md"
!macroend

