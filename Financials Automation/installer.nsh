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
!macroend

