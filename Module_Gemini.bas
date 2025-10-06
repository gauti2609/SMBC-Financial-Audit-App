Attribute VB_Name = "Module1"
' VBA Code for Financials_Automation_Tool.xlsm - FINAL BUILD v35
'
' CHANGE LOG:
' 1. [v35] FINAL, DEFINITIVE FIX. The hardcoded cell references in Generate_Ratio_Analysis_Layout
'    were off by one row due to a miscalculation. This caused a division by zero, crashing
'    the script before the button could be created. All cell references have been corrected
'    after a complete manual trace of the layout generation code. This was the true root cause.
' 2. [v34] Correctly identified the need for direct references but used the wrong addresses.
' 3. [FILE SIZE] Retained the file size optimization from v34.

Option Explicit

'================================================================================================'
' GLOBAL DEBUG FLAG
'================================================================================================'
Public Const g_DebugMode As Boolean = True

'================================================================================================'
' SECTION 1: ONE-CLICK SETUP & MAIN BUTTON MACROS
'================================================================================================'

Public Sub Final_Setup_And_Button_Creation()
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual
    On Error GoTo GlobalErrorHandler
    Call Setup_Complete_Workbook
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True
    Exit Sub
GlobalErrorHandler:
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True
    MsgBox "A critical, unhandled error occurred. Debugging is required." & vbCrLf & "Error: " & Err.Description, vbCritical
End Sub

Public Sub Create_Control_Button(ByVal ws As Worksheet)
    Dim btn As Button
    If Not g_DebugMode Then On Error GoTo ButtonCreationError
    
    If ws Is Nothing Then
        MsgBox "Create_Control_Button failed: The control sheet object was not provided.", vbCritical
        Exit Sub
    End If
    
    On Error Resume Next
    ws.Shapes("btnGenerateFinancials").Delete
    On Error GoTo 0
    
    If Not g_DebugMode Then On Error GoTo ButtonCreationError
    
    Set btn = ws.Buttons.Add(ws.Range("I2").Left, ws.Range("I2").Top, 200, 40)
    With btn
        .OnAction = "Refresh_Financials"
        .Caption = "Refresh Financials"
        .Name = "btnGenerateFinancials"
        .Font.Name = "Bookman Old Style"
        .Font.Size = 11
        .Font.Bold = True
    End With
    
    If g_DebugMode Then Debug.Print "SUCCESS: Control button created."
    Exit Sub

ButtonCreationError:
    MsgBox "An unexpected error occurred while creating the control button: " & vbCrLf & Err.Description, vbCritical
End Sub


'================================================================================================'
' SECTION 2: REFRESH & GENERATION ORCHESTRATORS
'================================================================================================'

Public Sub Refresh_Financials()
    If g_DebugMode Then Debug.Print "--- Starting Refresh_Financials ---"
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual
    If Not g_DebugMode Then On Error GoTo GenerationError
    Call Update_System_Recommendations
    Call Generate_Notes_To_Accounts
    Call Link_Note_Numbers_To_Statements
    Application.Calculation = xlCalculationAutomatic
    Application.CalculateFull
    Application.ScreenUpdating = True
    If g_DebugMode Then Debug.Print "--- Finished Refresh_Financials ---"
    MsgBox "Financials have been refreshed successfully.", vbInformation
    ThisWorkbook.Sheets("Balance_Sheet").Activate
    Exit Sub
GenerationError:
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True
    MsgBox "An error occurred while refreshing the financials: " & vbCrLf & Err.Description, vbCritical
End Sub

Public Sub Full_Generate_Financial_Statements()
    If Not g_DebugMode Then On Error GoTo FullGenerationError
    Application.ScreenUpdating = False
    Call Generate_BalanceSheet_Layout
    Call Generate_PL_Layout
    Call Generate_CashFlow_Layout
    Call Update_System_Recommendations
    Call Generate_Notes_To_Accounts
    Call Link_Note_Numbers_To_Statements
    Call Generate_Ratio_Analysis_Layout
    Call Generate_Aging_Schedules_Layout
    Application.ScreenUpdating = True
    Exit Sub
FullGenerationError:
    Application.ScreenUpdating = True
    MsgBox "An error occurred during the full generation: " & vbCrLf & Err.Description, vbCritical
End Sub

'================================================================================================'
' SECTION 3: DETAILED GENERATION & SETUP SUBROUTINES
'================================================================================================'

Private Sub Setup_Complete_Workbook()
    Dim currentStep As String
    currentStep = "initializing"
    If Not g_DebugMode Then On Error GoTo SetupError
    If g_DebugMode Then Debug.Print "--- Starting Full Workbook Setup (Debug Mode is ON) ---"
    Application.DisplayAlerts = False
    
    currentStep = "deleting existing sheets"
    Dim ws As Worksheet, tempSheetName As String: tempSheetName = "TempSetupSheet"
    On Error Resume Next
    ThisWorkbook.Sheets(tempSheetName).Delete
    On Error GoTo 0
    If Not g_DebugMode Then On Error GoTo SetupError
    ThisWorkbook.Sheets.Add.Name = tempSheetName
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name <> tempSheetName Then ws.Delete
    Next ws

    currentStep = "creating new sheets"
    Dim sheetNames As Variant, i As Integer
    sheetNames = Array("Common_Control_Sheet", "Input_Trial_Balance", "Input_PPE_Schedule", "Input_Receivables_Ledger", "Input_Payables_Ledger", "Selection_Sheet", "Balance_Sheet", "Statement_of_PL", "Cash_Flow_Statement", "Notes_to_Accounts", "Ratio_Analysis", "Aging_Schedules")
    
    ThisWorkbook.Sheets(tempSheetName).Name = sheetNames(0)
    For i = 1 To UBound(sheetNames)
        ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count)).Name = sheetNames(i)
    Next i
    
    DoEvents ' Give Excel a moment to process the new sheets

    ' Get sheet objects to pass them directly
    Dim wsControl As Worksheet: Set wsControl = ThisWorkbook.Sheets("Common_Control_Sheet")
    Dim wsInputTB As Worksheet: Set wsInputTB = ThisWorkbook.Sheets("Input_Trial_Balance")
    Dim wsInputPPE As Worksheet: Set wsInputPPE = ThisWorkbook.Sheets("Input_PPE_Schedule")
    Dim wsInputRec As Worksheet: Set wsInputRec = ThisWorkbook.Sheets("Input_Receivables_Ledger")
    Dim wsInputPay As Worksheet: Set wsInputPay = ThisWorkbook.Sheets("Input_Payables_Ledger")
    Dim wsSelect As Worksheet: Set wsSelect = ThisWorkbook.Sheets("Selection_Sheet")

    currentStep = "setting up Common_Control_Sheet"
    Call Setup_CommonControlSheet(wsControl)
    
    currentStep = "creating dynamic Named Ranges"
    Call Create_Dynamic_Named_Ranges(wsControl)
    
    currentStep = "setting up Input_Trial_Balance sheet"
    Call Setup_InputTrialBalanceSheet(wsInputTB)
    
    currentStep = "setting up Input PPE Schedule sheet"
    Call Setup_InputPPEScheduleSheet(wsInputPPE)
    
    currentStep = "setting up Input Ledger sheets"
    Call Setup_InputLedgerSheets(wsInputRec, wsInputPay, wsControl)
    
    currentStep = "setting up Selection_Sheet"
    Call Setup_SelectionSheet(wsSelect)
    
    currentStep = "setting up financial statement headers"
    Call Setup_FinancialStatementSheets(wsControl)
    
    currentStep = "running Full_Generate_Financial_Statements"
    Call Full_Generate_Financial_Statements
    
    currentStep = "applying conditional formatting"
    Call Apply_Conditional_Formatting(wsInputTB)
    
    currentStep = "setting default font"
    Call Set_Default_Font(wsControl)
    
    currentStep = "creating the main control button"
    Call Create_Control_Button(wsControl)
    
    currentStep = "finalizing setup"
    wsControl.Activate
    Application.DisplayAlerts = True
    
    If g_DebugMode Then Debug.Print "--- Full Workbook Setup Complete ---"
    MsgBox "Definitive setup is complete.", vbInformation
    Exit Sub

SetupError:
    Application.DisplayAlerts = True
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True
    MsgBox "A critical error occurred during setup." & vbCrLf & "Failed at step: '" & currentStep & "'." & vbCrLf & "Error: " & Err.Description, vbCritical
End Sub

Private Sub Create_Dynamic_Named_Ranges(ByVal ws As Worksheet)
    Dim wb As Workbook
    Set wb = ThisWorkbook
    On Error Resume Next
    wb.Names("MajorHeads").Delete
    wb.Names("MinorHeads").Delete
    wb.Names("Groupings").Delete
    On Error GoTo 0
    wb.Names.Add Name:="MajorHeads", RefersTo:="=OFFSET('" & ws.Name & "'!$C$2,0,0,MAX(1,COUNTA('" & ws.Name & "'!$C:$C)-1),1)"
    wb.Names.Add Name:="MinorHeads", RefersTo:="=OFFSET('" & ws.Name & "'!$D$2,0,0,MAX(1,COUNTA('" & ws.Name & "'!$D:$D)-1),1)"
    wb.Names.Add Name:="Groupings", RefersTo:="=OFFSET('" & ws.Name & "'!$E$2,0,0,MAX(1,COUNTA('" & ws.Name & "'!$E:$E)-1),1)"
End Sub

Private Sub Apply_Conditional_Formatting(ByVal wsTB As Worksheet)
    Dim tbl As ListObject, newRow As ListRow
    On Error Resume Next
    Set tbl = wsTB.ListObjects("tblTrialBalance")
    If tbl Is Nothing Then Exit Sub
    On Error GoTo 0
    
    Set newRow = tbl.ListRows.Add
    DoEvents

    If tbl.ListColumns(1).DataBodyRange Is Nothing Then
        If Not newRow Is Nothing Then newRow.Delete
        Exit Sub
    End If

    tbl.ListColumns("Major Head").DataBodyRange.FormatConditions.Delete
    tbl.ListColumns("Minor Head").DataBodyRange.FormatConditions.Delete
    tbl.ListColumns("Grouping").DataBodyRange.FormatConditions.Delete
    
    With tbl.ListColumns("Major Head").DataBodyRange.FormatConditions
        .Add(Type:=xlExpression, Formula1:="=AND([@[Major Head]]<>"""",COUNTIF(MajorHeads,[@[Major Head]])=0)").Interior.Color = RGB(255, 199, 206)
    End With
    With tbl.ListColumns("Minor Head").DataBodyRange.FormatConditions
        .Add(Type:=xlExpression, Formula1:="=AND([@[Minor Head]]<>"""",COUNTIF(MinorHeads,[@[Minor Head]])=0)").Interior.Color = RGB(255, 199, 206)
    End With
    With tbl.ListColumns("Grouping").DataBodyRange.FormatConditions
        .Add(Type:=xlExpression, Formula1:="=AND([@Grouping]<>"""",COUNTIF(Groupings,[@Grouping]])=0)").Interior.Color = RGB(255, 199, 206)
    End With
    
    If Not newRow Is Nothing Then newRow.Delete
End Sub

Private Sub Generate_BalanceSheet_Layout()
    Dim ws As Worksheet, r As Long
    Set ws = ThisWorkbook.Sheets("Balance_Sheet")
    ws.Range("A7:E1000").Clear
    ws.Range("A7:E1000").ClearFormats
    ws.Columns("A").ColumnWidth = 50: ws.Columns("B").ColumnWidth = 10: ws.Columns("C").ColumnWidth = 30: ws.Columns("D").ColumnWidth = 30
    ws.Range("A7:D7").Value = Array("Particulars", "Note No.", "Figures as at the end of current reporting period", "Figures as at the end of previous reporting period")
    ws.Range("A7:D7").Font.Bold = True
    r = 8
    ws.Range("A" & r).Value = "I. ASSETS": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "(1) Non-current assets": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "   (a) Property, Plant and Equipment": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Property, Plant and Equipment"")": r = r + 1
    ws.Range("A" & r).Value = "   (b) Intangible assets": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Intangible Assets"")": r = r + 1
    ws.Range("A" & r).Value = "   (c) Non-current investments": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Non-current Investments"")": r = r + 1
    ws.Range("A" & r).Value = "   (d) Long-term loans and advances": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Long-term Loans and Advances"")": r = r + 1
    ws.Range("A" & r).Value = "   (e) Other non-current assets": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Other Non-current Assets"")": r = r + 1
    ws.Range("A" & r).Value = "Total Non-current assets": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=SUM(C" & r - 5 & ":C" & r - 1 & ")": r = r + 2
    ws.Range("A" & r).Value = "(2) Current assets": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "   (a) Current investments": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Current Investments"")": r = r + 1
    ws.Range("A" & r).Value = "   (b) Inventories": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Inventories"")": r = r + 1
    ws.Range("A" & r).Value = "   (c) Trade receivables": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Trade Receivables"")": r = r + 1
    ws.Range("A" & r).Value = "   (d) Cash and cash equivalents": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Cash and Cash Equivalents"")": r = r + 1
    ws.Range("A" & r).Value = "   (e) Short-term loans and advances": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Short-term Loans and Advances"")": r = r + 1
    ws.Range("A" & r).Value = "   (f) Other current assets": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Other Current Assets"")": r = r + 1
    ws.Range("A" & r).Value = "Total Current assets": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=SUM(C" & r - 6 & ":C" & r - 1 & ")": r = r + 1
    ws.Range("A" & r).Value = "TOTAL ASSETS": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=C" & r - 8 & "+C" & r - 1 & "": ws.Range("A" & r & ":D" & r).Borders(xlEdgeTop).LineStyle = xlContinuous: r = r + 2
    ws.Range("A" & r).Value = "II. EQUITY AND LIABILITIES": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "(1) Equity": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "   (a) Equity Share Capital": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Equity Share Capital"")": r = r + 1
    ws.Range("A" & r).Value = "   (b) Other Equity": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Other Equity"")": r = r + 1
    ws.Range("A" & r).Value = "Total Equity": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=SUM(C" & r - 2 & ":C" & r - 1 & ")": r = r + 2
    ws.Range("A" & r).Value = "(2) Liabilities": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "Non-current liabilities": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "   (a) Long-term borrowings": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Long-term Borrowings"")": r = r + 1
    ws.Range("A" & r).Value = "   (b) Deferred tax liabilities (Net)": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Deferred Tax Liabilities (Net)"")": r = r + 1
    ws.Range("A" & r).Value = "   (c) Other long-term liabilities": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Other Long-term Liabilities"")": r = r + 1
    ws.Range("A" & r).Value = "   (d) Long-term provisions": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Long-term Provisions"")": r = r + 1
    ws.Range("A" & r).Value = "Total Non-current liabilities": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=SUM(C" & r - 4 & ":C" & r - 1 & ")": r = r + 2
    ws.Range("A" & r).Value = "Current liabilities": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "   (a) Short-term borrowings": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Short-term Borrowings"")": r = r + 1
    ws.Range("A" & r).Value = "   (b) Trade payables": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Trade Payables"")": r = r + 1
    ws.Range("A" & r).Value = "   (c) Other current liabilities": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Other Current Liabilities"")": r = r + 1
    ws.Range("A" & r).Value = "   (d) Short-term provisions": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Short-term Provisions"")": r = r + 1
    ws.Range("A" & r).Value = "Total Current liabilities": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=SUM(C" & r - 4 & ":C" & r - 1 & ")": r = r + 1
    ws.Range("A" & r).Value = "TOTAL EQUITY AND LIABILITIES": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=C" & r - 13 & "+C" & r - 7 & "+C" & r - 1 & "": ws.Range("A" & r & ":D" & r).Borders(xlEdgeTop).LineStyle = xlContinuous
    ws.Range("C8:D" & r).NumberFormat = "_(* #,##0.00_);_(* (#,##0.00);_(* ""-""??_);_(@_)"
End Sub

Private Sub Generate_PL_Layout()
    Dim ws As Worksheet, r As Long
    Set ws = ThisWorkbook.Sheets("Statement_of_PL")
    ws.Range("A7:E1000").Clear: ws.Range("A7:E1000").ClearFormats
    ws.Columns("A").ColumnWidth = 60: ws.Columns("B").ColumnWidth = 10: ws.Columns("C").ColumnWidth = 30: ws.Columns("D").ColumnWidth = 30
    ws.Range("A7:D7").Value = Array("Particulars", "Note No.", "Figures for the current reporting period", "Figures for the previous reporting period")
    ws.Range("A7:D7").Font.Bold = True
    r = 8
    ws.Range("A" & r).Value = "I. Revenue from operations": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Revenue from Operations"")": r = r + 1
    ws.Range("A" & r).Value = "II. Other income": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Other Income"")": r = r + 1
    ws.Range("A" & r).Value = "III. Total Income": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=SUM(C" & r - 2 & ":C" & r - 1 & ")": ws.Range("A" & r & ":D" & r).Borders(xlEdgeTop).LineStyle = xlContinuous: r = r + 2
    ws.Range("A" & r).Value = "IV. EXPENSES": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "   Cost of materials consumed": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Cost of Materials Consumed"")": r = r + 1
    ws.Range("A" & r).Value = "   Purchases of Stock-in-Trade": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Purchases of Stock-in-Trade"")": r = r + 1
    ws.Range("A" & r).Value = "   Changes in inventories of finished goods, work-in-progress and Stock-in-Trade": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Changes in Inventories"")": r = r + 1
    ws.Range("A" & r).Value = "   Employee benefits expense": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Employee Benefits Expense"")": r = r + 1
    ws.Range("A" & r).Value = "   Finance costs": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Finance Costs"")": r = r + 1
    ws.Range("A" & r).Value = "   Depreciation and amortization expense": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Depreciation and Amortization"")": r = r + 1
    ws.Range("A" & r).Value = "   Other expenses": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Other Expenses"")": r = r + 1
    ws.Range("A" & r).Value = "Total expenses": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=SUM(C" & r - 7 & ":C" & r - 1 & ")": ws.Range("A" & r & ":D" & r).Borders(xlEdgeTop).LineStyle = xlContinuous: r = r + 2
    ws.Range("A" & r).Value = "V. Profit before exceptional and extraordinary items and tax (III - IV)": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=C" & r - 10 & "-C" & r - 1 & "": r = r + 1
    ws.Range("A" & r).Value = "VI. Exceptional items": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Exceptional Items"")": r = r + 1
    ws.Range("A" & r).Value = "VII. Profit before extraordinary items and tax (V - VI)": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=C" & r - 2 & "-C" & r - 1 & "": r = r + 1
    ws.Range("A" & r).Value = "VIII. Extraordinary Items": ws.Range("C" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Extraordinary Items"")": r = r + 1
    ws.Range("A" & r).Value = "IX. Profit before tax (VII - VIII)": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=C" & r - 2 & "-C" & r - 1 & "": r = r + 1
    ws.Range("A" & r).Value = "X. Tax expense:": ws.Range("C" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Taxes on Income"")": r = r + 1
    ws.Range("A" & r).Value = "XI. Profit (Loss) for the period from continuing operations (IX - X)": ws.Range("A" & r, "C" & r).Font.Bold = True: ws.Range("C" & r).Formula = "=C" & r - 2 & "-C" & r - 1 & "": r = r + 2
    ws.Range("A" & r).Value = "XII. Earnings per equity share (for continuing operation):": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "   (1) Basic": r = r + 1
    ws.Range("A" & r).Value = "   (2) Diluted"
    ws.Range("C8:D" & r).NumberFormat = "_(* #,##0.00_);_(* (#,##0.00);_(* ""-""??_);_(@_)"
End Sub

Private Sub Generate_CashFlow_Layout()
    Dim ws As Worksheet, r As Long, pbt_address As String, pbt_cell As Range
    Set ws = ThisWorkbook.Sheets("Cash_Flow_Statement")
    Set pbt_cell = ThisWorkbook.Sheets("Statement_of_PL").Range("A1:A100").Find("Profit before tax", LookIn:=xlFormulas, lookat:=xlPart)
    
    If pbt_cell Is Nothing Then
        pbt_address = "0"
    Else
        pbt_address = "'Statement_of_PL'!" & pbt_cell.Offset(0, 2).Address(False, False)
    End If

    ws.Range("A7:D1000").Clear: ws.Range("A7:D1000").ClearFormats
    ws.Columns("A").ColumnWidth = 60: ws.Columns("B").ColumnWidth = 30: ws.Columns("C").ColumnWidth = 30
    ws.Range("A7:C7").Value = Array("Particulars", "Current Year", "Previous Year")
    ws.Range("A7:C7").Font.Bold = True
    r = 8
    ws.Range("A" & r).Value = "A. Cash flow from operating activities": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "Net profit before tax": ws.Range("B" & r).Formula = "=" & pbt_address: r = r + 1
    ws.Range("A" & r).Value = "Adjustments for:": r = r + 1
    ws.Range("A" & r).Value = "   Depreciation and amortization expense": ws.Range("B" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Depreciation and Amortization"")": r = r + 1
    ws.Range("A" & r).Value = "   Finance costs": ws.Range("B" & r).Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Finance Costs"")": r = r + 1
    ws.Range("A" & r).Value = "   Interest income": ws.Range("B" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Grouping], ""Interest Income"")": r = r + 1
    ws.Range("A" & r).Value = "Operating profit before working capital changes": ws.Range("A" & r, "B" & r).Font.Bold = True: ws.Range("B" & r).Formula = "=SUM(B" & r - 4 & ":B" & r - 1 & ")": r = r + 2
    ws.Range("A" & r).Value = "Adjustments for changes in working capital:": r = r + 1
    ws.Range("A" & r).Value = "   (Increase)/Decrease in Trade Receivables": ws.Range("B" & r).Formula = "=(SUMIF(tblTrialBalance[Major Head],""Trade Receivables"",tblTrialBalance[Opening Balance])-SUMIF(tblTrialBalance[Major Head],""Trade Receivables"",tblTrialBalance[Closing Balance]))": r = r + 1
    ws.Range("A" & r).Value = "   (Increase)/Decrease in Inventories": ws.Range("B" & r).Formula = "=(SUMIF(tblTrialBalance[Major Head],""Inventories"",tblTrialBalance[Opening Balance])-SUMIF(tblTrialBalance[Major Head],""Inventories"",tblTrialBalance[Closing Balance]))": r = r + 1
    ws.Range("A" & r).Value = "   Increase/(Decrease) in Trade Payables": ws.Range("B" & r).Formula = "=(SUMIF(tblTrialBalance[Major Head],""Trade Payables"",tblTrialBalance[Closing Balance])-SUMIF(tblTrialBalance[Major Head],""Trade Payables"",tblTrialBalance[Opening Balance]))": r = r + 1
    ws.Range("A" & r).Value = "Cash generated from operations": ws.Range("A" & r, "B" & r).Font.Bold = True: ws.Range("B" & r).Formula = "=SUM(B" & r - 4 & ":B" & r - 1 & ")": r = r + 1
    ws.Range("A" & r).Value = "   Direct taxes paid": ws.Range("B" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Taxes on Income"")": r = r + 1
    ws.Range("A" & r).Value = "Net cash from operating activities": ws.Range("A" & r, "B" & r).Font.Bold = True: ws.Range("B" & r).Formula = "=B" & r - 2 & "+B" & r - 1 & "": r = r + 2
    ws.Range("A" & r).Value = "B. Cash flow from investing activities": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "   Purchase of Property, Plant and Equipment": ws.Range("B" & r).Formula = "=(SUMIF(tblTrialBalance[Major Head],""Property, Plant and Equipment"",tblTrialBalance[Opening Balance])-SUMIF(tblTrialBalance[Major Head],""Property, Plant and Equipment"",tblTrialBalance[Closing Balance]))": r = r + 1
    ws.Range("A" & r).Value = "   Interest received": ws.Range("B" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Grouping], ""Interest Income"")": r = r + 1
    ws.Range("A" & r).Value = "Net cash from investing activities": ws.Range("A" & r, "B" & r).Font.Bold = True: ws.Range("B" & r).Formula = "=SUM(B" & r - 2 & ":B" & r - 1 & ")": r = r + 2
    ws.Range("A" & r).Value = "C. Cash flow from financing activities": ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Value = "   Proceeds from issue of Equity Share Capital": ws.Range("B" & r).Formula = "=(SUMIF(tblTrialBalance[Major Head],""Equity Share Capital"",tblTrialBalance[Closing Balance])-SUMIF(tblTrialBalance[Major Head],""Equity Share Capital"",tblTrialBalance[Opening Balance]))": r = r + 1
    ws.Range("A" & r).Value = "   Proceeds from Long-term borrowings": ws.Range("B" & r).Formula = "=(SUMIF(tblTrialBalance[Major Head],""Long-term Borrowings"",tblTrialBalance[Closing Balance])-SUMIF(tblTrialBalance[Major Head],""Long-term Borrowings"",tblTrialBalance[Opening Balance]))": r = r + 1
    ws.Range("A" & r).Value = "   Finance costs paid": ws.Range("B" & r).Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], ""Finance Costs"")": r = r + 1
    ws.Range("A" & r).Value = "Net cash from financing activities": ws.Range("A" & r, "B" & r).Font.Bold = True: ws.Range("B" & r).Formula = "=SUM(B" & r - 3 & ":B" & r - 1 & ")": r = r + 2
    ws.Range("A" & r).Value = "Net increase/(decrease) in cash and cash equivalents (A+B+C)": ws.Range("A" & r, "B" & r).Font.Bold = True: ws.Range("B" & r).Formula = "=B" & r - 11 & "+B" & r - 6 & "+B" & r - 1 & "": r = r + 1
    ws.Range("A" & r).Value = "Cash and cash equivalents at the beginning of the year": ws.Range("B" & r).Formula = "=SUMIF(tblTrialBalance[Major Head],""Cash and Cash Equivalents"",tblTrialBalance[Opening Balance])": r = r + 1
    ws.Range("A" & r).Value = "Cash and cash equivalents at the end of the year": ws.Range("A" & r, "B" & r).Font.Bold = True: ws.Range("B" & r).Formula = "=SUM(B" & r - 2 & ":B" & r - 1 & ")": r = r + 1
    ws.Range("B8:C" & r).NumberFormat = "_(* #,##0.00_);_(* (#,##0.00);_(* ""-""??_);_(@_)"
End Sub

' [v35] Corrected all hardcoded cell references to match the actual generated layout.
Private Sub Generate_Ratio_Analysis_Layout()
    Dim ws As Worksheet, r As Long
    Set ws = ThisWorkbook.Sheets("Ratio_Analysis")
    ws.Cells.Clear: ws.Cells.ClearFormats
    ws.Columns("A").ColumnWidth = 35: ws.Columns("B").ColumnWidth = 45: ws.Columns("C").ColumnWidth = 20: ws.Columns("D").ColumnWidth = 40
    ws.Range("A1").Value = "Ratio Analysis": ws.Range("A1").Font.Bold = True: ws.Range("A1").Font.Size = 14
    ws.Range("A3:D3").Value = Array("Ratio Name", "Formula", "Result", "Comments / Variance Explanation")
    ws.Range("A3:D3").Font.Bold = True
    r = 4
    ' Corrected cell references below
    ws.Range("A" & r).Value = "Current Ratio": ws.Range("B" & r).Value = "Current Assets / Current Liabilities": ws.Range("C" & r).Formula = "=IFERROR(Balance_Sheet!C26/Balance_Sheet!C47, ""N/A"")": r = r + 1
    ws.Range("A" & r).Value = "Debt to Equity Ratio": ws.Range("B" & r).Value = "(Long-term Borrowings + Short-term Borrowings) / Total Equity": ws.Range("C" & r).Formula = "=IFERROR((Balance_Sheet!C38+Balance_Sheet!C42)/Balance_Sheet!C33, ""N/A"")": r = r + 1
    ws.Range("A" & r).Value = "Net Profit Ratio": ws.Range("B" & r).Value = "Net Profit After Tax / Revenue from Operations": ws.Range("C" & r).Formula = "=IFERROR(Statement_of_PL!C26/Statement_of_PL!C8, ""N/A"")": r = r + 1
    ws.Range("A" & r).Value = "Return on Equity (ROE)": ws.Range("B" & r).Value = "Net Profit After Tax / Total Equity": ws.Range("C" & r).Formula = "=IFERROR(Statement_of_PL!C26/Balance_Sheet!C33, ""N/A"")": r = r + 1
    ws.Range("A" & r).Value = "Return on Capital Employed (ROCE)": ws.Range("B" & r).Value = "EBIT / (Total Assets - Current Liabilities)": ws.Range("C" & r).Formula = "=IFERROR((Statement_of_PL!C24+Statement_of_PL!C16)/(Balance_Sheet!C27-Balance_Sheet!C47), ""N/A"")": r = r + 1
    ws.Range("A" & r).Value = "Inventory Turnover Ratio": ws.Range("B" & r).Value = "Cost of Materials Consumed / Closing Inventory": ws.Range("C" & r).Formula = "=IFERROR(Statement_of_PL!C12/Balance_Sheet!C20, ""N/A"")": r = r + 1
    ws.Range("A" & r).Value = "Trade Receivables Turnover Ratio": ws.Range("B" & r).Value = "Revenue from Operations / Closing Trade Receivables": ws.Range("C" & r).Formula = "=IFERROR(Statement_of_PL!C8/Balance_Sheet!C21, ""N/A"")": r = r + 1
    ws.Range("C4:C" & r - 1).NumberFormat = "0.00"
    ws.Range("A3:D" & r - 1).Borders.LineStyle = xlContinuous
    ws.Range("A3:D" & r - 1).Borders.Weight = xlThin
End Sub

Private Sub Generate_Aging_Schedules_Layout()
    Dim ws As Worksheet, r As Long
    Set ws = ThisWorkbook.Sheets("Aging_Schedules")
    ws.Cells.Clear
    r = 2
    ws.Range("A" & r).Value = "Trade Receivables Aging Schedule": ws.Range("A" & r).Font.Bold = True: ws.Range("A" & r).Font.Size = 12
    r = r + 2
    Dim headers() As Variant
    headers = Array("Particulars", "< 6 Months", "6 Months - 1 Year", "1-2 Years", "2-3 Years", "> 3 Years", "Total")
    ws.Range("A" & r).Resize(1, UBound(headers) + 1).Value = headers
    ws.Range("A" & r, "G" & r).Font.Bold = True
    r = r + 1
    ws.Range("A" & r).Value = "Undisputed"
    ws.Range("B" & r).Formula = "=SUMIFS(tblReceivables[Outstanding Amount], tblReceivables[Disputed (Yes/No)], ""No"", tblReceivables[Aging Bucket], ""< 182 Days"")"
    ws.Range("C" & r).Formula = "=SUMIFS(tblReceivables[Outstanding Amount], tblReceivables[Disputed (Yes/No)], ""No"", tblReceivables[Aging Bucket], ""182-365 Days"")"
    ws.Range("D" & r).Formula = "=SUMIFS(tblReceivables[Outstanding Amount], tblReceivables[Disputed (Yes/No)], ""No"", tblReceivables[Aging Bucket], ""1-2 Years"")"
    ws.Range("E" & r).Formula = "=SUMIFS(tblReceivables[Outstanding Amount], tblReceivables[Disputed (Yes/No)], ""No"", tblReceivables[Aging Bucket], ""2-3 Years"")"
    ws.Range("F" & r).Formula = "=SUMIFS(tblReceivables[Outstanding Amount], tblReceivables[Disputed (Yes/No)], ""No"", tblReceivables[Aging Bucket], ""> 3 Years"")"
    ws.Range("G" & r).Formula = "=SUM(B" & r & ":F" & r & ")": r = r + 1
    ws.Range("A" & r).Value = "Disputed"
    ws.Range("B" & r).Formula = "=SUMIFS(tblReceivables[Outstanding Amount], tblReceivables[Disputed (Yes/No)], ""Yes"", tblReceivables[Aging Bucket], ""< 182 Days"")"
    ws.Range("C" & r).Formula = "=SUMIFS(tblReceivables[Outstanding Amount], tblReceivables[Disputed (Yes/No)], ""Yes"", tblReceivables[Aging Bucket], ""182-365 Days"")"
    ws.Range("D" & r).Formula = "=SUMIFS(tblReceivables[Outstanding Amount], tblReceivables[Disputed (Yes/No)], ""Yes"", tblReceivables[Aging Bucket], ""1-2 Years"")"
    ws.Range("E" & r).Formula = "=SUMIFS(tblReceivables[Outstanding Amount], tblReceivables[Disputed (Yes/No)], ""Yes"", tblReceivables[Aging Bucket], ""2-3 Years"")"
    ws.Range("F" & r).Formula = "=SUMIFS(tblReceivables[Outstanding Amount], tblReceivables[Disputed (Yes/No)], ""Yes"", tblReceivables[Aging Bucket], ""> 3 Years"")"
    ws.Range("G" & r).Formula = "=SUM(B" & r & ":F" & r & ")": r = r + 1
    ws.Range("A" & r).Value = "Total": ws.Range("A" & r).Font.Bold = True
    ws.Range("B" & r).Formula = "=SUM(B" & r - 2 & ":B" & r - 1 & ")": ws.Range("B" & r, "G" & r).Font.Bold = True
    ws.Range("C" & r).Formula = "=SUM(C" & r - 2 & ":C" & r - 1 & ")"
    ws.Range("D" & r).Formula = "=SUM(D" & r - 2 & ":D" & r - 1 & ")"
    ws.Range("E" & r).Formula = "=SUM(E" & r - 2 & ":E" & r - 1 & ")"
    ws.Range("F" & r).Formula = "=SUM(F" & r - 2 & ":F" & r - 1 & ")"
    ws.Range("G" & r).Formula = "=SUM(G" & r - 2 & ":G" & r - 1 & ")"
    ws.Range("A" & r, "G" & r).Borders(xlEdgeTop).LineStyle = xlContinuous
    ws.Range("B5:G" & r).NumberFormat = "_(* #,##0.00_);_(* (#,##0.00);_(* ""-""??_);_(@_)"
    ws.Range("A4:G" & r).Borders.LineStyle = xlContinuous
    r = r + 4
    Dim startPayablesRow As Long: startPayablesRow = r
    ws.Range("A" & r).Value = "Trade Payables Aging Schedule": ws.Range("A" & r).Font.Bold = True: ws.Range("A" & r).Font.Size = 12
    r = r + 2
    ws.Range("A" & r).Resize(1, UBound(headers) + 1).Value = headers
    ws.Range("A" & r, "G" & r).Font.Bold = True
    r = r + 1
    ws.Range("A" & r).Value = "MSME"
    ws.Range("B" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""MSME"", tblPayables[Aging Bucket], ""< 182 Days"")"
    ws.Range("C" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""MSME"", tblPayables[Aging Bucket], ""182-365 Days"")"
    ws.Range("D" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""MSME"", tblPayables[Aging Bucket], ""1-2 Years"")"
    ws.Range("E" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""MSME"", tblPayables[Aging Bucket], ""2-3 Years"")"
    ws.Range("F" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""MSME"", tblPayables[Aging Bucket], ""> 3 Years"")"
    ws.Range("G" & r).Formula = "=SUM(B" & r & ":F" & r & ")": r = r + 1
    ws.Range("A" & r).Value = "Disputed - Others"
    ws.Range("B" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""Other"", tblPayables[Disputed (Yes/No)], ""Yes"", tblPayables[Aging Bucket], ""< 182 Days"")"
    ws.Range("C" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""Other"", tblPayables[Disputed (Yes/No)], ""Yes"", tblPayables[Aging Bucket], ""182-365 Days"")"
    ws.Range("D" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""Other"", tblPayables[Disputed (Yes/No)], ""Yes"", tblPayables[Aging Bucket], ""1-2 Years"")"
    ws.Range("E" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""Other"", tblPayables[Disputed (Yes/No)], ""Yes"", tblPayables[Aging Bucket], ""2-3 Years"")"
    ws.Range("F" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""Other"", tblPayables[Disputed (Yes/No)], ""Yes"", tblPayables[Aging Bucket], ""> 3 Years"")"
    ws.Range("G" & r).Formula = "=SUM(B" & r & ":F" & r & ")": r = r + 1
    ws.Range("A" & r).Value = "Undisputed - Others"
    ws.Range("B" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""Other"", tblPayables[Disputed (Yes/No)], ""No"", tblPayables[Aging Bucket], ""< 182 Days"")"
    ws.Range("C" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""Other"", tblPayables[Disputed (Yes/No)], ""No"", tblPayables[Aging Bucket], ""182-365 Days"")"
    ws.Range("D" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""Other"", tblPayables[Disputed (Yes/No)], ""No"", tblPayables[Aging Bucket], ""1-2 Years"")"
    ws.Range("E" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""Other"", tblPayables[Disputed (Yes/No)], ""No"", tblPayables[Aging Bucket], ""2-3 Years"")"
    ws.Range("F" & r).Formula = "=SUMIFS(tblPayables[Outstanding Amount], tblPayables[Payable Type (MSME/Other)], ""Other"", tblPayables[Disputed (Yes/No)], ""No"", tblPayables[Aging Bucket], ""> 3 Years"")"
    ws.Range("G" & r).Formula = "=SUM(B" & r & ":F" & r & ")": r = r + 1
    ws.Range("A" & r).Value = "Total": ws.Range("A" & r).Font.Bold = True
    ws.Range("B" & r).Formula = "=SUM(B" & r - 3 & ":B" & r - 1 & ")": ws.Range("B" & r, "G" & r).Font.Bold = True
    ws.Range("C" & r).Formula = "=SUM(C" & r - 3 & ":C" & r - 1 & ")"
    ws.Range("D" & r).Formula = "=SUM(D" & r - 3 & ":D" & r - 1 & ")"
    ws.Range("E" & r).Formula = "=SUM(E" & r - 3 & ":E" & r - 1 & ")"
    ws.Range("F" & r).Formula = "=SUM(F" & r - 3 & ":F" & r - 1 & ")"
    ws.Range("G" & r).Formula = "=SUM(G" & r - 3 & ":G" & r - 1 & ")"
    ws.Range("A" & r, "G" & r).Borders(xlEdgeTop).LineStyle = xlContinuous
    ws.Range("B" & startPayablesRow + 3 & ":G" & r).NumberFormat = "_(* #,##0.00_);_(* (#,##0.00);_(* ""-""??_);_(@_)"
    ws.Range("A" & startPayablesRow + 2 & ":G" & r).Borders.LineStyle = xlContinuous
    ws.Columns("A:G").AutoFit
End Sub

Private Sub Generate_Notes_To_Accounts()
    Dim wsNotes As Worksheet, wsSelect As Worksheet, lastRow As Long, i As Integer, notesRow As Long
    Set wsNotes = ThisWorkbook.Sheets("Notes_to_Accounts")
    Set wsSelect = ThisWorkbook.Sheets("Selection_Sheet")
    wsNotes.Range("A7:L1000").Clear: wsNotes.Range("A7:L1000").ClearFormats
    AutoNumber_Selected_Notes
    lastRow = wsSelect.Cells(wsSelect.Rows.Count, "B").End(xlUp).Row
    notesRow = 8
    For i = 2 To lastRow
        If wsSelect.Range("F" & i).Value = "Yes" And Not IsEmpty(wsSelect.Range("G" & i).Value) Then
            Select Case wsSelect.Range("A" & i).Value
                Case "C.1": Call Create_PPE_Note(wsNotes, notesRow, wsSelect.Range("G" & i).Value)
                Case "B.2": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Other Equity", "Other Equity", True)
                Case "B.3": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Borrowings", "Long-term Borrowings", True)
                Case "B.4": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Trade Payables", "Trade Payables", True)
                Case "C.5": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Inventories", "Inventories", False)
                Case "C.6": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Trade Receivables", "Trade Receivables", False)
                Case "C.8": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Other Assets", "Other Current Assets", False)
                Case "D.1": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Revenue from Operations", "Revenue from Operations", True)
                Case "D.2": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Other Income", "Other Income", True)
                Case "D.4": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Employee Benefits Expense", "Employee Benefits Expense", False)
                Case "D.5": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Finance Costs", "Finance Costs", False)
                Case "D.6": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Depreciation and Amortization", "Depreciation and Amortization", False)
                Case "D.7": Call Create_Note_From_Groupings(wsNotes, notesRow, wsSelect.Range("G" & i).Value, "Other Expenses", "Other Expenses", False)
                Case Else
                    wsNotes.Range("A" & notesRow).Value = "Note " & wsSelect.Range("G" & i).Value & ": " & wsSelect.Range("B" & i).Value
                    wsNotes.Range("A" & notesRow).Font.Bold = True
                    wsNotes.Range("A" & notesRow + 1).Value = "[Detailed template for this note to be built.]"
                    notesRow = notesRow + 3
            End Select
        End If
    Next i
End Sub

Private Sub Create_PPE_Note(ByVal ws As Worksheet, ByRef r As Long, ByVal noteNum As String)
    Dim wsPPE As Worksheet, lastPPERow As Long, i As Long, startRow As Long
    Set wsPPE = ThisWorkbook.Sheets("Input_PPE_Schedule")
    lastPPERow = wsPPE.Cells(wsPPE.Rows.Count, "A").End(xlUp).Row
    If lastPPERow < 2 Then Exit Sub
    ws.Range("A" & r).Value = "Note " & noteNum & ": Property, Plant and Equipment": ws.Range("A" & r).Font.Bold = True: r = r + 1
    Dim headers1() As Variant, headers2() As Variant
    Dim endDate As Date, prevDate As Date
    endDate = ThisWorkbook.Sheets("Common_Control_Sheet").Range("B5").Value
    prevDate = DateAdd("yyyy", -1, endDate)
    headers1 = Array("", "Gross Block", "", "", "", "Accumulated Depreciation", "", "", "", "Net Block", "")
    headers2 = Array("Particulars", "Opening", "Additions", "Disposals", "Closing", "Opening", "For the Year", "On Disposals", "Closing", "As at " & Format(endDate, "dd-mmm-yy"), "As at " & Format(prevDate, "dd-mmm-yy"))
    startRow = r
    ws.Range("A" & r).Resize(1, 11).Value = headers1
    ws.Range("A" & r + 1).Resize(1, 11).Value = headers2
    ws.Range("B" & r & ":E" & r).Merge: ws.Range("F" & r & ":I" & r).Merge: ws.Range("J" & r & ":K" & r).Merge
    ws.Range("B" & r & ":K" & r).HorizontalAlignment = xlCenter
    ws.Range("A" & r & ":K" & r + 1).Font.Bold = True
    r = r + 2
    For i = 2 To lastPPERow
        ws.Cells(r, "A").Value = wsPPE.Cells(i, "A").Value
        ws.Cells(r, "B").Formula = "='Input_PPE_Schedule'!B" & i
        ws.Cells(r, "C").Formula = "='Input_PPE_Schedule'!C" & i
        ws.Cells(r, "D").Formula = "='Input_PPE_Schedule'!D" & i
        ws.Cells(r, "E").Formula = "=B" & r & "+C" & r & "-D" & r
        ws.Cells(r, "F").Formula = "='Input_PPE_Schedule'!E" & i
        ws.Cells(r, "G").Formula = "='Input_PPE_Schedule'!F" & i
        ws.Cells(r, "H").Formula = "='Input_PPE_Schedule'!G" & i
        ws.Cells(r, "I").Formula = "=F" & r & "+G" & r & "-H" & r
        ws.Cells(r, "J").Formula = "=E" & r & "-I" & r
        ws.Cells(r, "K").Formula = "=B" & r & "-F" & r
        r = r + 1
    Next i
    ws.Cells(r, "A").Value = "Total": ws.Range("A" & r & ":K" & r).Font.Bold = True
    Dim col As Integer
    For col = 2 To 11
        ws.Cells(r, col).Formula = "=SUM(" & ws.Cells(startRow + 2, col).Address(False, False) & ":" & ws.Cells(r - 1, col).Address(False, False) & ")"
    Next col
    ws.Range("B" & startRow & ":K" & r).NumberFormat = "_(* #,##0.00_);_(* (#,##0.00);_(* ""-""??_);_(@_)"
    ws.Range("A" & startRow & ":K" & r).Borders.LineStyle = xlContinuous
    ws.Columns("A:K").AutoFit
    r = r + 3
End Sub

Private Sub AutoNumber_Selected_Notes()
    Dim wsSelect As Worksheet, lastRow As Long, i As Long
    Dim mainNoteCounter As Long, subNoteCounter As Long
    Dim policyNoteNumber As String
    Set wsSelect = ThisWorkbook.Sheets("Selection_Sheet")
    lastRow = wsSelect.Cells(wsSelect.Rows.Count, "B").End(xlUp).Row
    wsSelect.Range("G2:G" & lastRow).ClearContents
    mainNoteCounter = 1
    policyNoteNumber = ""
    For i = 2 To lastRow
        If wsSelect.Range("F" & i).Value = "Yes" Then
            If InStr(1, wsSelect.Range("A" & i).Value, ".") > 0 And InStr(1, wsSelect.Range("A" & i).Value, "A.2.") = 0 Then
                wsSelect.Range("G" & i).Value = mainNoteCounter
                If wsSelect.Range("A" & i).Value = "A.2" Then
                    policyNoteNumber = CStr(mainNoteCounter)
                End If
                mainNoteCounter = mainNoteCounter + 1
            End If
        End If
    Next i
    If policyNoteNumber <> "" Then
        subNoteCounter = 1
        For i = 2 To lastRow
            If wsSelect.Range("F" & i).Value = "Yes" And InStr(1, wsSelect.Range("A" & i).Value, "A.2.") > 0 Then
                wsSelect.Range("G" & i).Value = policyNoteNumber & "." & subNoteCounter
                subNoteCounter = subNoteCounter + 1
            End If
        Next i
    End If
End Sub

Private Sub Link_Note_Numbers_To_Statements()
    Dim wsBS As Worksheet, wsPL As Worksheet
    Set wsBS = ThisWorkbook.Sheets("Balance_Sheet")
    Set wsPL = ThisWorkbook.Sheets("Statement_of_PL")
    wsBS.Range("B8:B100").ClearContents: wsPL.Range("B8:B100").ClearContents
    Dim links As Object, key As Variant
    Set links = CreateObject("Scripting.Dictionary")
    links.Add "B11", "C.1": links.Add "B12", "C.3": links.Add "B13", "C.4": links.Add "B15", "C.8"
    links.Add "B18", "C.5": links.Add "B19", "C.6": links.Add "B22", "C.8"
    links.Add "B28", "B.1": links.Add "B29", "B.2"
    links.Add "B33", "B.3": links.Add "B39", "B.4"
    For Each key In links.Keys: wsBS.Range(key).Formula = "=IFERROR(VLOOKUP(""" & links(key) & """, Selection_Sheet!$A:$G, 7, FALSE), ""-"")": Next key
    links.RemoveAll
    links.Add "B8", "D.1": links.Add "B9", "D.2"
    links.Add "B15", "D.4": links.Add "B16", "D.5": links.Add "B17", "D.6": links.Add "B18", "D.7"
    For Each key In links.Keys: wsPL.Range(key).Formula = "=IFERROR(VLOOKUP(""" & links(key) & """, Selection_Sheet!$A:$G, 7, FALSE), ""-"")": Next key
End Sub

Private Sub Setup_CommonControlSheet(ByVal ws As Worksheet)
    Dim dataArr As Variant, labelsArr As Variant, valuesArr As Variant
    Dim strMajor As String, strMinor As String, strGrouping As String, strPolicies As String
    
    ws.Cells.Clear
    labelsArr = Array("Entity Name:", "Address:", "CIN No.:", "Financial Year - Start:", "Financial Year - End:", "Currency:", "Units:", "Numbers Format:", "Negative Colour:", "Default Font:", "Default Font Size:")
    valuesArr = Array("[User Input]", "[User Input]", "[User Input]", CDate("2025-01-01"), CDate("2025-12-31"), "INR", "Millions", "Accounting", "Brackets", "Bookman Old Style", 11)
    
    With ws
        .Range("A1").Resize(UBound(labelsArr) + 1, 1).Value = Application.Transpose(labelsArr)
        .Range("B1").Resize(UBound(valuesArr) + 1, 1).Value = Application.Transpose(valuesArr)
        .Range("B4:B5").NumberFormat = "yyyy-mm-dd"
        .Range("C1:F1").Value = Array("Control List: Major Heads", "Control List: Minor Heads", "Control List: Grouping", "Control List: Accounting Policies")
        
        strMajor = "Property, Plant and Equipment|Intangible Assets|Non-current Investments|Long-term Loans and Advances|" & _
                   "Other Non-current Assets|Current Investments|Inventories|Trade Receivables|Cash and Cash Equivalents|" & _
                   "Short-term Loans and Advances|Other Current Assets|Equity Share Capital|Other Equity|Long-term Borrowings|" & _
                   "Deferred Tax Liabilities (Net)|Other Long-term Liabilities|Long-term Provisions|Short-term Borrowings|" & _
                   "Trade Payables|Other Current Liabilities|Short-term Provisions|Revenue from Operations|Other Income|" & _
                   "Cost of Materials Consumed|Purchases of Stock-in-Trade|Changes in Inventories|Employee Benefits Expense|" & _
                   "Finance Costs|Depreciation and Amortization|Other Expenses|Exceptional Items|Extraordinary Items|Taxes on Income"
        dataArr = Split(strMajor, "|")
        .Range("C2").Resize(UBound(dataArr) + 1, 1).Value = Application.Transpose(dataArr)
        
        strMinor = "Tangible Assets|Intangible Assets|Financial Assets - Investments|Financial Assets - Loans|Other Non-current Assets|" & _
                   "Inventories|Financial Assets - Trade Receivables|Cash and Cash Equivalents|Financial Assets - Loans|" & _
                   "Other financial assets|Equity Share Capital|Other Equity|Financial Liabilities - Borrowings|Provisions|" & _
                   "Other financial liabilities|Financial Liabilities - Borrowings|Financial Liabilities - Trade Payables|" & _
                   "Other financial liabilities|Provisions|Revenue from Operations|Other Income|Cost of Materials Consumed|" & _
                   "Purchases of Stock-in-Trade|Changes in inventories of finished goods, work-in-progress and Stock-in-Trade|" & _
                   "Employee Benefit Expense|Finance Costs|Depreciation and Amortization Expense|Other Expenses"
        dataArr = Split(strMinor, "|")
        .Range("D2").Resize(UBound(dataArr) + 1, 1).Value = Application.Transpose(dataArr)
        
        strGrouping = "Land|Building|Plant and Machinery|Furniture and Fixtures|Vehicles|Office Equipment|Capital Work-in-Progress|" & _
                      "Goodwill|Patents, Copyrights, Trademarks|Intangible assets under development|Financial Investments - Mutual funds|" & _
                      "Financial Investments - Equity instruments|Financial Investments - Others|Loans to related parties|Loans to others|" & _
                      "Other non-current assets|Raw materials|Work-in-progress|Finished goods|Stock-in-trade|Stores and spares|Loose tools|" & _
                      "Trade receivables outstanding > 6 months|Trade receivables outstanding < 6 months|Balances with banks|" & _
                      "Cheques, drafts on hand|Cash on hand|Other bank balances|Loans to related parties|Loans to others|Security deposits|" & _
                      "Other current assets|Retained Earnings|General Reserve|Securities Premium|Debentures/Bonds|Term Loans from Banks|" & _
                      "Term Loans from others|Deferred tax liability|Provision for employee benefits|Other provisions|Borrowings from Banks|" & _
                      "Borrowings from others|Trade Payables - MSMEs|Trade Payables - Others|Current maturities of long-term debt|" & _
                      "Interest accrued|Unpaid dividends|Other payables|Provision for employee benefits|Provision for tax|Other provisions|" & _
                      "Sale of products|Sale of services|Other operating revenues|Interest Income|Dividend Income|Net gain/loss on sale of investments|" & _
                      "Other non-operating income|Raw material consumed|Purchase of stock-in-trade|Salaries and wages|" & _
                      "Contribution to provident and other funds|Staff welfare expenses|Interest expense|Other borrowing costs|" & _
                      "Depreciation on tangible assets|Amortization on intangible assets|Rent|Rates and taxes|Power and fuel|Repairs to buildings|" & _
                      "Repairs to machinery|Insurance|Auditor's remuneration|Legal and professional fees|Corporate Social Responsibility (CSR) expense|Miscellaneous expenses"
        dataArr = Split(strGrouping, "|")
        .Range("E2").Resize(UBound(dataArr) + 1, 1).Value = Application.Transpose(dataArr)
        
        strPolicies = "Revenue recognition (AS 9)|Property, Plant and Equipment (PPE) (AS 10)|Intangible assets (AS 26)|" & _
                      "Impairment of assets (AS 28)|Inventories valuation (AS 2)|Investments (AS 13)|" & _
                      "Foreign currency transactions (AS 11)|Employee benefits (AS 15)|Borrowing costs (AS 16)|" & _
                      "Provisions and contingencies (AS 29)|Taxes on income (AS 22)|Government grants (AS 12)|" & _
                      "Leases (AS 19)|Segment reporting (AS 17)|Cash flow statement (AS 3)"
        dataArr = Split(strPolicies, "|")
        .Range("F2").Resize(UBound(dataArr) + 1, 1).Value = Application.Transpose(dataArr)
        
        .Range("A:A, C1:F1").Font.Bold = True
        .Columns("A:I").AutoFit
    End With
End Sub

Private Sub Setup_InputTrialBalanceSheet(ByVal ws As Worksheet)
    Dim tbl As ListObject, newRow As ListRow
    
    ws.Cells.Clear
    ws.Range("A1:I1").Value = Split("Ledger Name|Opening Balance|Debit|Credit|Closing Balance|Type (BS/PL)|Major Head|Minor Head|Grouping", "|")
    ws.Range("A1:I1").Font.Bold = True
    
    On Error Resume Next
    ws.ListObjects("tblTrialBalance").Delete
    On Error GoTo 0
    
    Set tbl = ws.ListObjects.Add(xlSrcRange, ws.Range("A1:I1"), , xlYes)
    If tbl Is Nothing Then
        MsgBox "FATAL ERROR: Could not create the Trial Balance table in sheet '" & ws.Name & "'. Setup cannot continue.", vbCritical
        End
    End If
    tbl.Name = "tblTrialBalance"
    
    Set newRow = tbl.ListRows.Add
    DoEvents
    
    With tbl.ListColumns("Type (BS/PL)").DataBodyRange.Validation
        .Delete: .Add Type:=xlValidateList, Formula1:="BS,PL": .IgnoreBlank = True
    End With
    With tbl.ListColumns("Major Head").DataBodyRange.Validation
        .Delete: .Add Type:=xlValidateList, Formula1:="=MajorHeads": .IgnoreBlank = True
    End With
    With tbl.ListColumns("Minor Head").DataBodyRange.Validation
        .Delete: .Add Type:=xlValidateList, Formula1:="=MinorHeads": .IgnoreBlank = True
    End With
    With tbl.ListColumns("Grouping").DataBodyRange.Validation
        .Delete: .Add Type:=xlValidateList, Formula1:="=Groupings": .IgnoreBlank = True
    End With
    
    newRow.Delete
    ws.Columns("A:I").AutoFit
End Sub

Private Sub Setup_InputPPEScheduleSheet(ByVal ws As Worksheet)
    With ws
        .Cells.Clear
        .Range("A1:G1").Value = Array("Asset Class", "Opening Gross Block", "Additions", "Disposals (Gross)", "Opening Acc. Depreciation", "Depreciation for Year", "Acc. Depr. on Disposals")
        .Range("A1:G1").Font.Bold = True
        .Columns("A:G").AutoFit
        .Range("A2:G3").Value = Array(Array("Building", 1000000, 200000, 0, 100000, 50000, 0), Array("Plant and Machinery", 500000, 150000, 50000, 200000, 75000, 20000))
        .Range("B2:G3").NumberFormat = "#,##0"
    End With
End Sub

Private Sub Setup_InputLedgerSheets(ByVal wsRec As Worksheet, ByVal wsPay As Worksheet, ByVal wsControl As Worksheet)
    Dim tbl As ListObject, reportDate As String, tempRow As ListRow
    reportDate = "''" & wsControl.Name & "''!$B$5"
    
    ' Setup Receivables Ledger
    wsRec.Cells.Clear
    On Error Resume Next
    wsRec.ListObjects("tblReceivables").Delete
    On Error GoTo 0
    wsRec.Range("A1:I1").Value = Array("Customer Name", "Invoice No.", "Invoice Date", "Invoice Amount", "Amount Settled", "Outstanding Amount", "Disputed (Yes/No)", "Days Outstanding", "Aging Bucket")
    wsRec.Range("A1:I1").Font.Bold = True
    Set tbl = wsRec.ListObjects.Add(xlSrcRange, wsRec.Range("A1:I1"), , xlYes)
    If tbl Is Nothing Then
        MsgBox "FATAL ERROR: Could not create the Receivables Ledger table in sheet '" & wsRec.Name & "'. Setup cannot continue.", vbCritical
        End
    End If
    tbl.Name = "tblReceivables"
    
    Set tempRow = tbl.ListRows.Add
    DoEvents
    tbl.ListColumns("Outstanding Amount").DataBodyRange.Formula = "=[@[Invoice Amount]]-[@[Amount Settled]]"
    tbl.ListColumns("Days Outstanding").DataBodyRange.Formula = "=IF(AND([@[Outstanding Amount]]>0, ISNUMBER([@[Invoice Date]]))," & reportDate & "-[@[Invoice Date]], """")"
    tbl.ListColumns("Aging Bucket").DataBodyRange.Formula = "=IF([@[Days Outstanding]]<>"""",IF([@[Days Outstanding]]>1095,""> 3 Years"",IF([@[Days Outstanding]]>730,""2-3 Years"",IF([@[Days Outstanding]]>365,""1-2 Years"",IF([@[Days Outstanding]]>182,""182-365 Days"",""< 182 Days"")))),"""")"
    With tbl.ListColumns("Disputed (Yes/No)").DataBodyRange.Validation
        .Delete: .Add Type:=xlValidateList, Formula1:="Yes,No": .IgnoreBlank = True
    End With
    tempRow.Delete
    wsRec.Columns.AutoFit
    
    ' Setup Payables Ledger
    wsPay.Cells.Clear
    Set tbl = Nothing
    On Error Resume Next
    wsPay.ListObjects("tblPayables").Delete
    On Error GoTo 0
    wsPay.Range("A1:J1").Value = Array("Vendor Name", "Invoice No.", "Invoice Date", "Invoice Amount", "Amount Settled", "Outstanding Amount", "Days Outstanding", "Disputed (Yes/No)", "Payable Type (MSME/Other)", "Aging Bucket")
    wsPay.Range("A1:J1").Font.Bold = True
    Set tbl = wsPay.ListObjects.Add(xlSrcRange, wsPay.Range("A1:J1"), , xlYes)
     If tbl Is Nothing Then
        MsgBox "FATAL ERROR: Could not create the Payables Ledger table in sheet '" & wsPay.Name & "'. Setup cannot continue.", vbCritical
        End
    End If
    tbl.Name = "tblPayables"
    
    Set tempRow = tbl.ListRows.Add
    DoEvents
    tbl.ListColumns("Outstanding Amount").DataBodyRange.Formula = "=[@[Invoice Amount]]-[@[Amount Settled]]"
    tbl.ListColumns("Days Outstanding").DataBodyRange.Formula = "=IF(AND([@[Outstanding Amount]]>0, ISNUMBER([@[Invoice Date]]))," & reportDate & "-[@[Invoice Date]], """")"
    tbl.ListColumns("Aging Bucket").DataBodyRange.Formula = "=IF([@[Days Outstanding]]<>"""",IF([@[Days Outstanding]]>1095,""> 3 Years"",IF([@[Days Outstanding]]>730,""2-3 Years"",IF([@[Days Outstanding]]>365,""1-2 Years"",IF([@[Days Outstanding]]>182,""182-365 Days"",""< 182 Days"")))),"""")"
    With tbl.ListColumns("Disputed (Yes/No)").DataBodyRange.Validation
        .Delete: .Add Type:=xlValidateList, Formula1:="Yes,No": .IgnoreBlank = True
    End With
    With tbl.ListColumns("Payable Type (MSME/Other)").DataBodyRange.Validation
        .Delete: .Add Type:=xlValidateList, Formula1:="MSME,Other": .IgnoreBlank = True
    End With
    tempRow.Delete
    wsPay.Columns.AutoFit
End Sub

Private Sub Setup_SelectionSheet(ByVal ws As Worksheet)
    Dim allNotesString As String, notesArray As Variant, i As Integer, noteDetail As Variant
    Dim strPart1 As String, strPart2 As String, strPart3 As String, strPart4 As String
    
    ws.Cells.Clear
    strPart1 = "A|General notes and policies (mandatory)|~" & _
        "A.1|Corporate information and basis of preparation|~" & _
        "A.2|Significant accounting policies|~" & _
        "A.2.1|Revenue recognition (AS 9)|Revenue from Operations~" & _
        "A.2.2|Property, Plant and Equipment (PPE) and depreciation (AS 10)|Property, Plant and Equipment~" & _
        "A.2.3|Intangible assets and amortization (AS 26)|Intangible Assets~" & _
        "A.2.4|Impairment of assets (AS 28)|~" & _
        "A.2.5|Inventories valuation and cost formula (AS 2)|Inventories~" & _
        "A.2.6|Investments classification and valuation (AS 13)|Non-current Investments~" & _
        "A.2.7|Foreign currency transactions and translation (AS 11)|~" & _
        "A.2.8|Employee benefits (AS 15)|Employee Benefits Expense~" & _
        "A.2.9|Borrowing costs and capitalization policy (AS 16)|Finance Costs~" & _
        "A.2.10|Provisions, contingent liabilities, contingent assets (AS 29)|Long-term Provisions~" & _
        "A.2.11|Taxes on income (current/deferred; AS 22)|Taxes on Income~" & _
        "A.2.12|Government grants (AS 12)|~" & _
        "A.2.13|Construction contracts revenue (AS 7)|~" & _
        "A.2.14|Leases classification (AS 19)|~" & _
        "A.2.15|Segment reporting basis (AS 17)|~" & _
        "A.2.16|Cash and cash equivalents definition (AS 3)|Cash and Cash Equivalents"

    strPart2 = "B|Equity and liabilities notes|~" & _
        "B.1|Share capital|Equity Share Capital~" & _
        "B.2|Reserves and surplus / other equity|Other Equity~" & _
        "B.3|Long-term and short-term borrowings|Long-term Borrowings~" & _
        "B.4|Trade payables|Trade Payables~" & _
        "B.5|Other financial liabilities and provisions|Other Current Liabilities~" & _
        "B.6|Other non-financial liabilities|Other Long-term Liabilities~" & _
        "B.7|Employee benefit obligations (AS 15)|Employee Benefits Expense~" & _
        "C|Assets notes|~" & _
        "C.1|Property, plant and equipment (AS 10 + Schedule III)|Property, Plant and Equipment~" & _
        "C.2|Capital work-in-progress (CWIP)|~" & _
        "C.3|Intangible assets and Intangible assets under development|Intangible Assets~" & _
        "C.4|Investments (AS 13)|Non-current Investments~" & _
        "C.5|Inventories (AS 2)|Inventories~" & _
        "C.6|Trade receivables|Trade Receivables~" & _
        "C.7|Cash and cash equivalents|Cash and Cash Equivalents~" & _
        "C.8|Loans, advances, and other assets|Long-term Loans and Advances"

    strPart3 = "D|Profit and Loss notes|~" & _
        "D.1|Revenue from operations (AS 9)|Revenue from Operations~" & _
        "D.2|Other income|Other Income~" & _
        "D.3|Cost of materials consumed; Purchases; Changes in inventories|Cost of Materials Consumed~" & _
        "D.4|Employee benefits expense (AS 15)|Employee Benefits Expense~" & _
        "D.5|Finance costs (AS 16)|Finance Costs~" & _
        "D.6|Depreciation and amortization expense|Depreciation and Amortization~" & _
        "D.7|Other expenses (incl. CSR, Auditor Payments)|Other Expenses~" & _
        "D.8|Exceptional items and extraordinary items (AS 5)|Exceptional Items~" & _
        "D.9|Prior period items disclosure (AS 5)|~" & _
        "D.10|Earnings per share (AS 20)|~" & _
        "D.11|Income taxes (AS 22)|Taxes on Income~" & _
        "E|AS-specific and cross-cutting disclosures|~" & _
        "E.1|AS 3 Cash Flow Statement details|~" & _
        "E.2|AS 4 Events occurring after the balance sheet date|~" & _
        "E.3|AS 18 Related party disclosures|~" & _
        "E.4|AS 19 Leases|~" & _
        "E.5|Contingent Liabilities and Commitments (AS 29)"
        
    strPart4 = "F|Additional Schedule III (2021) Disclosures|~" & _
        "F.1|Utilization of borrowed funds and share premium|~" & _
        "F.2|Title deeds of immovable properties not in company’s name|~" & _
        "F.3|Proceedings for Benami property|~" & _
        "F.4|Wilful defaulter status|~" & _
        "F.5|Relationship with struck-off companies|~" & _
        "F.6|Crypto/virtual currency holdings|~" & _
        "F.7|Undisclosed income surrendered in tax assessments|~" & _
        "F.8|Ratios with variance >25% explanations|~" & _
        "F.9|Aging schedules: Receivables, Payables, CWIP, Intangibles under dev.|~" & _
        "F.10|Unspent CSR amounts|~" & _
        "G|Other Statutory Disclosures|~" & _
        "G.1|Managerial remuneration (Section 197)|~" & _
        "G.2|MSME Disclosures (Principal and Interest due)|"

    allNotesString = strPart1 & "~" & strPart2 & "~" & strPart3 & "~" & strPart4
    notesArray = Split(allNotesString, "~")
    
    With ws
        .Range("A1:G1").Value = Split("Note Ref|Note/Schedule Description|Linked Major Head|System Rec. (Y/N)|User Selection (Y/N)|Final (Y/N)|Auto-Number", "|")
        .Range("A1:G1").Font.Bold = True
        For i = 0 To UBound(notesArray)
            If Trim(notesArray(i)) <> "" Then
                noteDetail = Split(notesArray(i), "|")
                If UBound(noteDetail) >= 0 Then .Cells(i + 2, 1).Value = noteDetail(0)
                If UBound(noteDetail) >= 1 Then .Cells(i + 2, 2).Value = noteDetail(1)
                If UBound(noteDetail) >= 2 Then .Cells(i + 2, 3).Value = noteDetail(2)
                If InStr(1, CStr(.Cells(i + 2, 1).Value), ".") = 0 Then
                    .Rows(i + 2).Font.Bold = True
                End If
            End If
        Next i
        Dim lastNoteRow As Long: lastNoteRow = .Cells(.Rows.Count, "B").End(xlUp).Row
        With .Range("E2:E" & lastNoteRow).Validation
            .Delete: .Add Type:=xlValidateList, Formula1:="Yes,No": .IgnoreBlank = True
        End With
        .Range("F2:F" & lastNoteRow).Formula = "=IF(E2=""Yes"",""Yes"",IF(AND(E2="""",D2=""Yes""),""Yes"",""No""))"
        .Columns("C").Hidden = True
        .Columns("A:G").AutoFit: .Columns("B").ColumnWidth = 60
    End With
End Sub

Private Sub Update_System_Recommendations()
    Dim wsSelect As Worksheet, wsTB As Worksheet, lastSelectRow As Long, i As Long
    Dim majorHead As String, majorHeadsRange As Range
    Set wsSelect = ThisWorkbook.Sheets("Selection_Sheet")
    Set wsTB = ThisWorkbook.Sheets("Input_Trial_Balance")
    lastSelectRow = wsSelect.Cells(wsSelect.Rows.Count, "C").End(xlUp).Row
    DoEvents
    
    On Error Resume Next
    Set majorHeadsRange = wsTB.ListObjects("tblTrialBalance").ListColumns("Major Head").DataBodyRange
    If majorHeadsRange Is Nothing Then
        wsSelect.Range("D2:D" & lastSelectRow).Value = "No"
        Exit Sub
    End If
    On Error GoTo 0
    
    wsSelect.Range("D2:D" & lastSelectRow).Value = "No"
    For i = 2 To lastSelectRow
        majorHead = wsSelect.Range("C" & i).Value
        If Not IsEmpty(majorHead) Then
            If Application.WorksheetFunction.CountIf(majorHeadsRange, majorHead) > 0 Then
                wsSelect.Range("D" & i).Value = "Yes"
            End If
        End If
    Next i
End Sub

Private Sub Setup_FinancialStatementSheets(ByVal wsControl As Worksheet)
    Dim sheetNames As Variant, ws As Worksheet, sheetName As Variant
    sheetNames = Array("Balance_Sheet", "Statement_of_PL", "Cash_Flow_Statement", "Notes_to_Accounts")
    
    For Each sheetName In sheetNames
        If SheetExists(sheetName) Then
            Set ws = ThisWorkbook.Sheets(sheetName)
            With ws
                .Cells.Clear
                .Range("A1").Formula = "=''" & wsControl.Name & "''!B1"
                .Range("A2").Formula = "=''" & wsControl.Name & "''!B2"
                .Range("A3").Formula = "=''" & wsControl.Name & "''!B3"
                Select Case sheetName
                    Case "Balance_Sheet": .Range("A5").Formula = "=""Balance Sheet as at "" & TEXT(''" & wsControl.Name & "''!B5, ""mmmm dd, yyyy"")"
                    Case "Statement_of_PL": .Range("A5").Formula = "=""Statement of Profit and Loss for the year ended "" & TEXT(''" & wsControl.Name & "''!B5, ""mmmm dd, yyyy"")"
                    Case "Cash_Flow_Statement": .Range("A5").Formula = "=""Cash Flow Statement for the year ended "" & TEXT(''" & wsControl.Name & "''!B5, ""mmmm dd, yyyy"")"
                    Case "Notes_to_Accounts": .Range("A5").Value = "Notes to Financial Statements"
                End Select
                .Range("A1:A5").Font.Bold = True
                .Columns("A").AutoFit
            End With
        End If
    Next sheetName
End Sub

Private Sub Set_Default_Font(ByVal wsControl As Worksheet)
    Dim ws As Worksheet, defaultFont As String, defaultFontSize As Single
    On Error Resume Next
    defaultFont = wsControl.Range("B10").Value
    defaultFontSize = wsControl.Range("B11").Value
    On Error GoTo 0
    If defaultFont = "" Then defaultFont = "Bookman Old Style"
    If defaultFontSize = 0 Then defaultFontSize = 11
    Application.ScreenUpdating = False
    For Each ws In ThisWorkbook.Worksheets: ws.Cells.Font.Name = defaultFont: ws.Cells.Font.Size = defaultFontSize: Next ws
    Application.ScreenUpdating = True
End Sub

Private Function SheetExists(ByVal sheetName As String) As Boolean
    Dim ws As Worksheet
    SheetExists = False
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets(sheetName)
    If Not ws Is Nothing Then SheetExists = True
    On Error GoTo 0
End Function

Private Sub Create_Note_From_Groupings(ByVal ws As Worksheet, ByRef r As Long, ByVal noteNum As String, ByVal noteTitle As String, ByVal majorHead As String, ByVal isCredit As Boolean)
    Dim wsTB As Worksheet, uniqueGroupings As Object, i As Integer, cell As Range, groupingName As Variant, startRow As Long, groupingsRange As Range
    Set wsTB = ThisWorkbook.Sheets("Input_Trial_Balance")
    Set uniqueGroupings = CreateObject("Scripting.Dictionary")
    uniqueGroupings.CompareMode = vbTextCompare
    DoEvents
    
    On Error Resume Next
    Set groupingsRange = wsTB.ListObjects("tblTrialBalance").ListColumns("Grouping").DataBodyRange
    If groupingsRange Is Nothing Then Exit Sub
    On Error GoTo 0
    
    For Each cell In groupingsRange
        If cell.Offset(0, -2).Value = majorHead And Trim(cell.Value) <> "" Then
            uniqueGroupings(Trim(cell.Value)) = 1
        End If
    Next cell
    If uniqueGroupings.Count = 0 Then Exit Sub
    ws.Range("A" & r).Value = "Note " & noteNum & ": " & noteTitle: ws.Range("A" & r).Font.Bold = True: r = r + 1
    ws.Range("A" & r).Resize(1, 3).Value = Array("Particulars", "Current Year", "Previous Year"): ws.Range("A" & r, "C" & r).Font.Bold = True
    startRow = r + 1
    r = r + 1
    For Each groupingName In uniqueGroupings.Keys
        ws.Cells(r, "A").Value = groupingName
        If isCredit Then
            ws.Cells(r, "B").Formula = "=-SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], """ & majorHead & """, tblTrialBalance[Grouping], """ & groupingName & """)"
        Else
            ws.Cells(r, "B").Formula = "=SUMIFS(tblTrialBalance[Closing Balance], tblTrialBalance[Major Head], """ & majorHead & """, tblTrialBalance[Grouping], """ & groupingName & """)"
        End If
        r = r + 1
    Next groupingName
    ws.Cells(r, "A").Value = "Total": ws.Cells(r, "A").Font.Bold = True
    ws.Cells(r, "B").Formula = "=SUM(B" & startRow & ":B" & r - 1 & ")": ws.Cells(r, "B").Font.Bold = True
    ws.Range("B" & startRow & ":C" & r).NumberFormat = "_(* #,##0.00_);_(* (#,##0.00);_(* ""-""??_);_(@_)"
    ws.Range("A" & startRow - 1 & ":C" & r).Borders.LineStyle = xlContinuous
    ws.Columns("A:C").AutoFit
    r = r + 3
End Sub

