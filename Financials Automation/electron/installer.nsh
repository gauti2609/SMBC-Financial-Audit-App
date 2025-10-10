; Custom installer script for Financial Statement Generator
; Enhanced for Windows 10/11 deployment with comprehensive features

; Include modern UI and additional libraries
!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "WinVer.nsh"
!include "x64.nsh"

; Define custom functions and macros
!define APP_NAME "Financial Statement Generator"
!define APP_DESCRIPTION "Professional Financial Statement Generation Tool for Schedule III Compliance"
!define COMPANY_NAME "Financial Statement Generator"
!define APP_VERSION "1.0.0"
!define REG_ROOT "HKLM"
!define REG_APP_PATH "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\${APP_NAME}.exe"
!define UNINSTALL_PATH "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"

; Windows 10/11 specific registry keys
!define WIN10_NOTIFICATIONS "SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings\${APP_NAME}"
!define WIN10_STARTUP "SOFTWARE\Microsoft\Windows\CurrentVersion\Run"

; Custom installation steps with Windows 10/11 optimizations
Section "MainInstall" SEC01
  ; Set output path to the installation directory
  SetOutPath "$INSTDIR"
  
  ; Create application data directories with proper permissions
  CreateDirectory "$APPDATA\${APP_NAME}"
  CreateDirectory "$APPDATA\${APP_NAME}\exports"
  CreateDirectory "$APPDATA\${APP_NAME}\imports"
  CreateDirectory "$APPDATA\${APP_NAME}\templates"
  CreateDirectory "$APPDATA\${APP_NAME}\backups"
  CreateDirectory "$APPDATA\${APP_NAME}\logs"
  
  ; Create local app data for Windows 10/11
  CreateDirectory "$LOCALAPPDATA\${APP_NAME}"
  CreateDirectory "$LOCALAPPDATA\${APP_NAME}\cache"
  CreateDirectory "$LOCALAPPDATA\${APP_NAME}\temp"
  
  ; Copy default templates and configurations
  SetOutPath "$APPDATA\${APP_NAME}\templates"
  ; Add template files here if needed
  
  ; Register application path for Windows 10/11
  WriteRegStr ${REG_ROOT} "${REG_APP_PATH}" "" "$INSTDIR\${APP_NAME}.exe"
  WriteRegStr ${REG_ROOT} "${REG_APP_PATH}" "Path" "$INSTDIR"
  WriteRegStr ${REG_ROOT} "${REG_APP_PATH}" "ApplicationCompany" "${COMPANY_NAME}"
  WriteRegStr ${REG_ROOT} "${REG_APP_PATH}" "ApplicationDescription" "${APP_DESCRIPTION}"
  WriteRegStr ${REG_ROOT} "${REG_APP_PATH}" "ApplicationVersion" "${APP_VERSION}"
  
  ; Windows 10/11 notification settings
  WriteRegDWORD HKCU "${WIN10_NOTIFICATIONS}" "ShowInActionCenter" 1
  WriteRegDWORD HKCU "${WIN10_NOTIFICATIONS}" "Enabled" 1
  
  ; Register file associations with Windows 10/11 enhancements
  Call RegisterFileAssociations
  
  ; Create default configuration with Windows 10/11 paths
  Call CreateDefaultConfig
  
  ; Set proper permissions for Windows 10/11
  Call SetWindowsPermissions
  
  ; Register with Windows Defender exclusions (optional)
  Call RegisterDefenderExclusions
  
  ; Create Windows 10/11 compatible shortcuts
  Call CreateModernShortcuts
SectionEnd

; Enhanced file association registration for Windows 10/11
Function RegisterFileAssociations
  ; Excel files (.xlsx) with Windows 10/11 enhancements
  WriteRegStr HKCR ".xlsx\OpenWithProgids" "${APP_NAME}.xlsx" ""
  WriteRegStr HKCR "${APP_NAME}.xlsx" "" "Excel Workbook - Financial Statement Generator"
  WriteRegStr HKCR "${APP_NAME}.xlsx" "FriendlyTypeName" "Financial Excel Workbook"
  WriteRegStr HKCR "${APP_NAME}.xlsx\DefaultIcon" "" "$INSTDIR\assets\excel-icon.ico,0"
  WriteRegStr HKCR "${APP_NAME}.xlsx\shell" "" "open"
  WriteRegStr HKCR "${APP_NAME}.xlsx\shell\open" "" "Open with ${APP_NAME}"
  WriteRegStr HKCR "${APP_NAME}.xlsx\shell\open\command" "" '"$INSTDIR\${APP_NAME}.exe" "%1"'
  WriteRegStr HKCR "${APP_NAME}.xlsx\shell\edit" "" "Edit with ${APP_NAME}"
  WriteRegStr HKCR "${APP_NAME}.xlsx\shell\edit\command" "" '"$INSTDIR\${APP_NAME}.exe" "%1"'
  
  ; CSV files (.csv) with Windows 10/11 enhancements
  WriteRegStr HKCR ".csv\OpenWithProgids" "${APP_NAME}.csv" ""
  WriteRegStr HKCR "${APP_NAME}.csv" "" "CSV File - Financial Statement Generator"
  WriteRegStr HKCR "${APP_NAME}.csv" "FriendlyTypeName" "Financial CSV File"
  WriteRegStr HKCR "${APP_NAME}.csv\DefaultIcon" "" "$INSTDIR\assets\csv-icon.ico,0"
  WriteRegStr HKCR "${APP_NAME}.csv\shell" "" "open"
  WriteRegStr HKCR "${APP_NAME}.csv\shell\open" "" "Open with ${APP_NAME}"
  WriteRegStr HKCR "${APP_NAME}.csv\shell\open\command" "" '"$INSTDIR\${APP_NAME}.exe" "%1"'
  
  ; JSON files (.json)
  WriteRegStr HKCR ".json\OpenWithProgids" "${APP_NAME}.json" ""
  WriteRegStr HKCR "${APP_NAME}.json" "" "JSON Data - Financial Statement Generator"
  WriteRegStr HKCR "${APP_NAME}.json" "FriendlyTypeName" "Financial JSON Data"
  WriteRegStr HKCR "${APP_NAME}.json\DefaultIcon" "" "$INSTDIR\${APP_NAME}.exe,3"
  WriteRegStr HKCR "${APP_NAME}.json\shell\open\command" "" '"$INSTDIR\${APP_NAME}.exe" "%1"'
  
  ; Refresh shell associations for Windows 10/11
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
  
  ; Register with Windows 10/11 "Open With" dialog
  WriteRegStr HKCR "Applications\${APP_NAME}.exe" "FriendlyAppName" "${APP_NAME}"
  WriteRegStr HKCR "Applications\${APP_NAME}.exe\SupportedTypes" ".xlsx" ""
  WriteRegStr HKCR "Applications\${APP_NAME}.exe\SupportedTypes" ".csv" ""
  WriteRegStr HKCR "Applications\${APP_NAME}.exe\SupportedTypes" ".json" ""
FunctionEnd

; Enhanced default configuration for Windows 10/11
Function CreateDefaultConfig
  ; Create default preferences file with Windows 10/11 paths
  FileOpen $0 "$APPDATA\${APP_NAME}\preferences.json" w
  FileWrite $0 '{'
  FileWrite $0 '"downloadPath": "$DOCUMENTS\\Financial Exports",'
  FileWrite $0 '"uploadPath": "$DOCUMENTS",'
  FileWrite $0 '"backupPath": "$APPDATA\\${APP_NAME}\\backups",'
  FileWrite $0 '"tempPath": "$LOCALAPPDATA\\${APP_NAME}\\temp",'
  FileWrite $0 '"logPath": "$APPDATA\\${APP_NAME}\\logs",'
  FileWrite $0 '"firstRun": true,'
  FileWrite $0 '"theme": "system",'
  FileWrite $0 '"autoSave": true,'
  FileWrite $0 '"autoBackup": true,'
  FileWrite $0 '"defaultFormat": "xlsx",'
  FileWrite $0 '"windowsIntegration": true,'
  FileWrite $0 '"notificationsEnabled": true,'
  FileWrite $0 '"version": "${APP_VERSION}"'
  FileWrite $0 '}'
  FileClose $0
  
  ; Create default export directory in Documents
  CreateDirectory "$DOCUMENTS\Financial Exports"
  CreateDirectory "$DOCUMENTS\Financial Exports\Balance Sheets"
  CreateDirectory "$DOCUMENTS\Financial Exports\P&L Statements"
  CreateDirectory "$DOCUMENTS\Financial Exports\Cash Flow"
  CreateDirectory "$DOCUMENTS\Financial Exports\Notes"
  
  ; Create Windows 10/11 compatible batch files for common tasks
  FileOpen $1 "$INSTDIR\Quick Export.bat" w
  FileWrite $1 '@echo off$\r$\n'
  FileWrite $1 'cd /d "$INSTDIR"$\r$\n'
  FileWrite $1 '"${APP_NAME}.exe" --export$\r$\n'
  FileClose $1
FunctionEnd

; Set proper permissions for Windows 10/11
Function SetWindowsPermissions
  ; Grant full access to application data directories
  AccessControl::GrantOnFile "$APPDATA\${APP_NAME}" "(S-1-5-32-545)" "FullAccess"
  AccessControl::GrantOnFile "$LOCALAPPDATA\${APP_NAME}" "(S-1-5-32-545)" "FullAccess"
  AccessControl::GrantOnFile "$DOCUMENTS\Financial Exports" "(S-1-5-32-545)" "FullAccess"
  
  ; Set proper permissions on installation directory
  AccessControl::GrantOnFile "$INSTDIR" "(S-1-5-32-545)" "GenericRead|GenericExecute"
FunctionEnd

; Register with Windows Defender (optional, requires elevation)
Function RegisterDefenderExclusions
  ; Add application to Windows Defender exclusions
  nsExec::ExecToLog 'powershell.exe -Command "Add-MpPreference -ExclusionPath \"$INSTDIR\" -Force"'
  nsExec::ExecToLog 'powershell.exe -Command "Add-MpPreference -ExclusionProcess \"${APP_NAME}.exe\" -Force"'
FunctionEnd

; Create modern shortcuts for Windows 10/11
Function CreateModernShortcuts
  ; Desktop shortcut with enhanced properties
  CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_NAME}.exe" "" "$INSTDIR\${APP_NAME}.exe" 0 SW_SHOWNORMAL "" "${APP_DESCRIPTION}"
  
  ; Start menu shortcuts
  CreateDirectory "$SMPROGRAMS\Financial Tools"
  CreateShortCut "$SMPROGRAMS\Financial Tools\${APP_NAME}.lnk" "$INSTDIR\${APP_NAME}.exe" "" "$INSTDIR\${APP_NAME}.exe" 0 SW_SHOWNORMAL "" "${APP_DESCRIPTION}"
  CreateShortCut "$SMPROGRAMS\Financial Tools\Uninstall ${APP_NAME}.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0 SW_SHOWNORMAL "" "Uninstall ${APP_NAME}"
  
  ; Quick access shortcuts
  CreateShortCut "$SMPROGRAMS\Financial Tools\Financial Exports Folder.lnk" "$DOCUMENTS\Financial Exports" "" "shell32.dll" 3 SW_SHOWNORMAL "" "Open Financial Exports Folder"
FunctionEnd

; Enhanced uninstaller section with Windows 10/11 cleanup
Section "Uninstall"
  ; Remove registry entries
  DeleteRegKey ${REG_ROOT} "${REG_APP_PATH}"
  DeleteRegKey ${REG_ROOT} "${UNINSTALL_PATH}"
  DeleteRegKey HKCU "${WIN10_NOTIFICATIONS}"
  
  ; Remove file associations
  DeleteRegKey HKCR "${APP_NAME}.xlsx"
  DeleteRegKey HKCR "${APP_NAME}.csv"
  DeleteRegKey HKCR "${APP_NAME}.json"
  DeleteRegKey HKCR "Applications\${APP_NAME}.exe"
  DeleteRegValue HKCR ".xlsx\OpenWithProgids" "${APP_NAME}.xlsx"
  DeleteRegValue HKCR ".csv\OpenWithProgids" "${APP_NAME}.csv"
  DeleteRegValue HKCR ".json\OpenWithProgids" "${APP_NAME}.json"
  
  ; Remove Windows Defender exclusions
  nsExec::ExecToLog 'powershell.exe -Command "Remove-MpPreference -ExclusionPath \"$INSTDIR\" -Force"'
  nsExec::ExecToLog 'powershell.exe -Command "Remove-MpPreference -ExclusionProcess \"${APP_NAME}.exe\" -Force"'
  
  ; Remove shortcuts
  Delete "$DESKTOP\${APP_NAME}.lnk"
  RMDir /r "$SMPROGRAMS\Financial Tools"
  
  ; Remove application data (ask user)
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Do you want to remove all application data including your settings, exports, and backups?$\r$\n$\r$\nThis will permanently delete:$\r$\n• Your financial exports$\r$\n• Application settings$\r$\n• Backup files$\r$\n• Log files" \
    /SD IDNO IDNO skip_appdata
    
  RMDir /r "$APPDATA\${APP_NAME}"
  RMDir /r "$LOCALAPPDATA\${APP_NAME}"
  RMDir /r "$DOCUMENTS\Financial Exports"
  
  skip_appdata:
  
  ; Refresh shell associations
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
SectionEnd

; Custom installer pages with Windows 10/11 styling
!insertmacro MUI_PAGE_WELCOME

; Enhanced license page
!define MUI_LICENSEPAGE_TEXT_TOP "Please review the license agreement before installing ${APP_NAME}."
!define MUI_LICENSEPAGE_TEXT_BOTTOM "This software is designed for Windows 10 and Windows 11 systems. If you accept the terms of the agreement, click I Agree to continue."
!insertmacro MUI_PAGE_LICENSE "LICENSE"

; Custom components page
!insertmacro MUI_PAGE_COMPONENTS

; Enhanced directory page with validation
!define MUI_DIRECTORYPAGE_TEXT_TOP "Setup will install ${APP_NAME} in the following folder. For optimal performance on Windows 10/11, we recommend the default location."
!define MUI_DIRECTORYPAGE_VERIFYONLEAVE
!insertmacro MUI_PAGE_DIRECTORY

; Installation progress page
!insertmacro MUI_PAGE_INSTFILES

; Enhanced finish page with Windows 10/11 options
!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_NAME}.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch ${APP_NAME} now"
!define MUI_FINISHPAGE_SHOWREADME "$DOCUMENTS\Financial Exports\Getting Started.txt"
!define MUI_FINISHPAGE_SHOWREADME_TEXT "View Getting Started Guide"
!define MUI_FINISHPAGE_LINK "Visit our website for documentation and support"
!define MUI_FINISHPAGE_LINK_LOCATION "https://financialstatementgenerator.com"
!define MUI_FINISHPAGE_NOAUTOCLOSE
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

; Enhanced version information for Windows 10/11
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "${APP_NAME}"
VIAddVersionKey "ProductVersion" "${APP_VERSION}"
VIAddVersionKey "CompanyName" "${COMPANY_NAME}"
VIAddVersionKey "FileDescription" "${APP_DESCRIPTION}"
VIAddVersionKey "FileVersion" "1.0.0.0"
VIAddVersionKey "LegalCopyright" "Copyright © 2024 ${COMPANY_NAME}"
VIAddVersionKey "OriginalFilename" "${APP_NAME}.exe"
VIAddVersionKey "InternalName" "financial-statement-generator"
VIAddVersionKey "PrivateBuild" "Windows 10/11 Optimized"

; Enhanced installer attributes
Name "${APP_NAME}"
OutFile "${APP_NAME}-Setup-Windows.exe"
InstallDir "$PROGRAMFILES64\${APP_NAME}"
InstallDirRegKey ${REG_ROOT} "${UNINSTALL_PATH}" "UninstallString"
RequestExecutionLevel admin

; Modern UI configuration for Windows 10/11
!define MUI_ABORTWARNING
!define MUI_ICON "assets\icon.ico"
!define MUI_UNICON "assets\icon.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "assets\installer-header.bmp"
!define MUI_HEADERIMAGE_RIGHT
!define MUI_WELCOMEFINISHPAGE_BITMAP "assets\installer-sidebar.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "assets\installer-sidebar.bmp"

; Component descriptions
LangString DESC_MainInstall ${LANG_ENGLISH} "Core application files, templates, and Windows 10/11 integration components"

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC01} $(DESC_MainInstall)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; Enhanced initialization function with Windows 10/11 checks
Function .onInit
  ; Check if application is already running
  System::Call 'kernel32::CreateMutexA(i 0, i 0, t "${APP_NAME}Installer") i .r1 ?e'
  Pop $R0
  StrCmp $R0 0 +3
    MessageBox MB_OK|MB_ICONEXCLAMATION "The installer is already running or the application is currently open. Please close all instances and try again."
    Abort
    
  ; Enhanced Windows version check for Windows 10/11
  ${IfNot} ${AtLeastWin10}
    MessageBox MB_OK|MB_ICONSTOP "This application requires Windows 10 or later for optimal performance and security features."
    Abort
  ${EndIf}
  
  ; Check for 64-bit architecture
  ${IfNot} ${RunningX64}
    MessageBox MB_OK|MB_ICONSTOP "This application requires a 64-bit version of Windows."
    Abort
  ${EndIf}
  
  ; Check available disk space (minimum 500MB)
  ${DriveSpace} "$PROGRAMFILES64" "/D=F /S=M" $R0
  IntCmp $R0 500 disk_ok disk_ok
    MessageBox MB_OK|MB_ICONSTOP "Insufficient disk space. At least 500MB of free space is required."
    Abort
  disk_ok:
FunctionEnd

; Enhanced installation success function
Function .onInstSuccess
  ; Write comprehensive uninstall information
  WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}" "DisplayName" "${APP_NAME}"
  WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}" "QuietUninstallString" "$INSTDIR\Uninstall.exe /S"
  WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}" "InstallLocation" "$INSTDIR"
  WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}" "DisplayIcon" "$INSTDIR\${APP_NAME}.exe"
  WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}" "Publisher" "${COMPANY_NAME}"
  WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}" "URLInfoAbout" "https://financialstatementgenerator.com"
  WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}" "HelpLink" "https://financialstatementgenerator.com/support"
  WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}" "URLUpdateInfo" "https://financialstatementgenerator.com/updates"
  WriteRegDWORD ${REG_ROOT} "${UNINSTALL_PATH}" "NoModify" 1
  WriteRegDWORD ${REG_ROOT} "${UNINSTALL_PATH}" "NoRepair" 1
  WriteRegDWORD ${REG_ROOT} "${UNINSTALL_PATH}" "VersionMajor" 1
  WriteRegDWORD ${REG_ROOT} "${UNINSTALL_PATH}" "VersionMinor" 0
  
  ; Calculate and write installed size
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD ${REG_ROOT} "${UNINSTALL_PATH}" "EstimatedSize" "$0"
  
  ; Create getting started guide
  FileOpen $3 "$DOCUMENTS\Financial Exports\Getting Started.txt" w
  FileWrite $3 "Welcome to ${APP_NAME}!$\r$\n$\r$\n"
  FileWrite $3 "This professional financial statement generation tool is optimized for Windows 10 and 11.$\r$\n$\r$\n"
  FileWrite $3 "Quick Start:$\r$\n"
  FileWrite $3 "1. Launch the application from your desktop or Start menu$\r$\n"
  FileWrite $3 "2. Configure your database connection$\r$\n"
  FileWrite $3 "3. Upload your trial balance data$\r$\n"
  FileWrite $3 "4. Generate Schedule III compliant financial statements$\r$\n$\r$\n"
  FileWrite $3 "Support: https://financialstatementgenerator.com/support$\r$\n"
  FileWrite $3 "Documentation: https://financialstatementgenerator.com/docs$\r$\n"
  FileClose $3
FunctionEnd
