import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { minioClient } from "~/server/minio";
import * as XLSX from 'xlsx';

// Professional Excel formatting utilities
const createCellStyle = (options: {
  font?: { name?: string; size?: number; bold?: boolean; color?: string };
  fill?: { fgColor?: { rgb?: string } };
  border?: { top?: any; bottom?: any; left?: any; right?: any };
  alignment?: { horizontal?: string; vertical?: string; wrapText?: boolean };
  numFmt?: string;
} = {}) => {
  const style: any = {};
  
  if (options.font) {
    style.font = {
      name: options.font.name || 'Calibri',
      sz: options.font.size || 11,
      bold: options.font.bold || false,
      color: options.font.color ? { rgb: options.font.color } : undefined
    };
  }
  
  if (options.fill) {
    style.fill = {
      fgColor: options.fill.fgColor || { rgb: 'FFFFFF' }
    };
  }
  
  if (options.border) {
    style.border = options.border;
  }
  
  if (options.alignment) {
    style.alignment = options.alignment;
  }
  
  if (options.numFmt) {
    style.numFmt = options.numFmt;
  }
  
  return style;
};

const applyFormatting = (ws: any, range: string, style: any) => {
  const decode = XLSX.utils.decode_range(range);
  for (let R = decode.s.r; R <= decode.e.r; ++R) {
    for (let C = decode.s.c; C <= decode.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cell_address]) ws[cell_address] = { v: '', t: 's' };
      ws[cell_address].s = style;
    }
  }
};

const setColumnWidths = (ws: any, widths: number[]) => {
  ws['!cols'] = widths.map(w => ({ wch: w }));
};

const setRowHeights = (ws: any, heights: { [row: number]: number }) => {
  ws['!rows'] = ws['!rows'] || [];
  Object.entries(heights).forEach(([row, height]) => {
    const rowIndex = parseInt(row);
    if (!ws['!rows'][rowIndex]) ws['!rows'][rowIndex] = {};
    ws['!rows'][rowIndex].hpt = height;
  });
};

const getNumberFormat = (commonControl: any) => {
  const currency = commonControl?.currency === 'INR' ? '₹' : commonControl?.currency || '₹';
  const precision = commonControl?.roundingPrecision || 2;
  const zeros = '0'.repeat(precision);
  
  if (commonControl?.negativeColor === 'Red') {
    return `${currency}#,##0.${zeros}_);[Red](${currency}#,##0.${zeros})`;
  } else if (commonControl?.negativeColor === 'Minus') {
    return `${currency}#,##0.${zeros}_);-${currency}#,##0.${zeros}`;
  } else {
    return `${currency}#,##0.${zeros}_);(${currency}#,##0.${zeros})`;
  }
};

export const exportBalanceSheet = baseProcedure
  .input(z.object({
    format: z.enum(['xlsx', 'csv']).default('xlsx')
  }))
  .mutation(async ({ input }) => {
    try {
      // Get balance sheet data
      const trialBalance = await db.trialBalanceEntry.findMany({
        include: {
          majorHead: true,
          grouping: true,
        },
        where: {
          type: 'BS',
        },
      });

      const commonControl = await db.commonControl.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      // Group data for balance sheet structure
      const assets = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Assets') || 
        entry.majorHead?.name?.includes('Receivables') ||
        entry.majorHead?.name?.includes('Cash') ||
        entry.majorHead?.name?.includes('Inventories') ||
        entry.majorHead?.name?.includes('Investments') ||
        entry.majorHead?.name?.includes('Loans and Advances')
      );

      const liabilities = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Liabilities') ||
        entry.majorHead?.name?.includes('Payables') ||
        entry.majorHead?.name?.includes('Borrowings') ||
        entry.majorHead?.name?.includes('Provisions')
      );

      const equity = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Equity') ||
        entry.majorHead?.name?.includes('Share Capital')
      );

      // Create Excel workbook with professional formatting
      const wb = XLSX.utils.book_new();
      
      // Prepare data structure for Excel with formulas
      const excelData: any[][] = [
        [`${commonControl?.entityName || 'Entity Name'}`],
        [`${commonControl?.address || 'Entity Address'}`],
        ...(commonControl?.cinNumber ? [[`CIN: ${commonControl.cinNumber}`]] : []),
        [`Balance Sheet as at ${commonControl?.financialYearEnd ? new Date(commonControl.financialYearEnd).toLocaleDateString('en-IN') : 'March 31, 2024'}`],
        [`(All amounts in ${commonControl?.currency || 'INR'} ${commonControl?.units || 'Millions'})`],
        [], // Empty row
        ['Particulars', 'Note No.', 'Current Year', 'Previous Year'],
        ['I. ASSETS'],
        ['(1) Non-current assets']
      ];

      let currentRow = excelData.length;
      const assetStartRow = currentRow + 1;

      // Add asset items with actual values (formulas will reference these)
      assets.forEach(asset => {
        excelData.push([
          `  ${asset.majorHead?.name || asset.ledgerName}`,
          '', // Note number placeholder
          Number(asset.closingBalanceCY),
          Number(asset.closingBalancePY)
        ]);
        currentRow++;
      });

      const assetEndRow = currentRow;
      
      excelData.push(['(2) Current assets']);
      currentRow++;
      
      // Add current assets section
      excelData.push(['TOTAL ASSETS', '', 
        { f: `SUM(C${assetStartRow}:C${assetEndRow})` }, // Excel formula for total
        { f: `SUM(D${assetStartRow}:D${assetEndRow})` }  // Excel formula for total
      ]);
      currentRow++;

      excelData.push([]); // Empty row
      currentRow++;

      excelData.push(['II. EQUITY AND LIABILITIES']);
      excelData.push(['(1) Equity']);
      currentRow += 2;

      const equityStartRow = currentRow + 1;

      // Add equity items
      equity.forEach(eq => {
        excelData.push([
          `  ${eq.majorHead?.name || eq.ledgerName}`,
          '', // Note number placeholder
          Math.abs(Number(eq.closingBalanceCY)),
          Math.abs(Number(eq.closingBalancePY))
        ]);
        currentRow++;
      });

      const equityEndRow = currentRow;

      excelData.push(['(2) Liabilities']);
      currentRow++;

      const liabilityStartRow = currentRow + 1;

      // Add liability items
      liabilities.forEach(liability => {
        excelData.push([
          `  ${liability.majorHead?.name || liability.ledgerName}`,
          '', // Note number placeholder
          Math.abs(Number(liability.closingBalanceCY)),
          Math.abs(Number(liability.closingBalancePY))
        ]);
        currentRow++;
      });

      const liabilityEndRow = currentRow;

      excelData.push(['TOTAL EQUITY AND LIABILITIES', '',
        { f: `SUM(C${equityStartRow}:C${equityEndRow})+SUM(C${liabilityStartRow}:C${liabilityEndRow})` },
        { f: `SUM(D${equityStartRow}:D${equityEndRow})+SUM(D${liabilityStartRow}:D${liabilityEndRow})` }
      ]);

      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Apply professional formatting
      const headerStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: (commonControl?.defaultFontSize || 11) + 2, bold: true, color: 'FFFFFF' },
        fill: { fgColor: { rgb: '366092' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      });

      const titleStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: (commonControl?.defaultFontSize || 11) + 4, bold: true },
        alignment: { horizontal: 'center', vertical: 'center' }
      });

      const sectionHeaderStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: commonControl?.defaultFontSize || 11, bold: true },
        fill: { fgColor: { rgb: 'E7E6E6' } },
        alignment: { horizontal: 'left', vertical: 'center' }
      });

      const numberStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: commonControl?.defaultFontSize || 11 },
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: getNumberFormat(commonControl)
      });

      const totalStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: commonControl?.defaultFontSize || 11, bold: true },
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: getNumberFormat(commonControl),
        border: {
          top: { style: 'double', color: { rgb: '000000' } },
          bottom: { style: 'double', color: { rgb: '000000' } }
        }
      });

      // Apply formatting to specific ranges
      // Title and header formatting
      applyFormatting(ws, 'A1:D1', titleStyle);
      applyFormatting(ws, 'A7:D7', headerStyle);

      // Section headers
      applyFormatting(ws, 'A8:D8', sectionHeaderStyle);
      applyFormatting(ws, `A${currentRow-5}:D${currentRow-5}`, sectionHeaderStyle);

      // Number columns
      applyFormatting(ws, `C8:D${currentRow}`, numberStyle);

      // Total rows
      const totalRows = [assetEndRow + 2, currentRow]; // Adjust based on actual total row positions
      totalRows.forEach(row => {
        applyFormatting(ws, `A${row}:D${row}`, totalStyle);
      });

      // Set column widths for professional appearance
      setColumnWidths(ws, [40, 10, 15, 15]);

      // Set row heights for better spacing
      setRowHeights(ws, {
        0: 20, // Title
        6: 18, // Header row
        7: 16  // Section header
      });

      XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet');

      // Generate file buffer
      const fileBuffer = XLSX.write(wb, { 
        type: 'buffer', 
        bookType: input.format,
        cellStyles: true // Enable cell styling
      });
      
      // Upload to Minio
      const fileName = `balance-sheet-${Date.now()}.${input.format}`;
      const bucketName = 'financial-exports';
      
      // Ensure bucket exists
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
      }

      await minioClient.putObject(bucketName, fileName, fileBuffer);

      // Generate presigned URL (valid for 1 hour)
      const downloadUrl = await minioClient.presignedGetObject(bucketName, fileName, 3600);

      return {
        success: true,
        downloadUrl,
        fileName,
        expiresIn: 3600
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to export balance sheet: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const exportProfitAndLoss = baseProcedure
  .input(z.object({
    format: z.enum(['xlsx', 'csv']).default('xlsx')
  }))
  .mutation(async ({ input }) => {
    try {
      // Get P&L data
      const trialBalance = await db.trialBalanceEntry.findMany({
        include: {
          majorHead: true,
          grouping: true,
        },
        where: {
          type: 'PL',
        },
      });

      // Get tax data
      const taxEntries = await db.taxEntry.findMany();

      const commonControl = await db.commonControl.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      const revenue = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Revenue') ||
        entry.majorHead?.name?.includes('Income')
      );

      const expenses = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Expense') ||
        entry.majorHead?.name?.includes('Cost') ||
        entry.majorHead?.name?.includes('Finance Costs') ||
        entry.majorHead?.name?.includes('Depreciation')
      );

      // Create Excel workbook with professional formatting
      const wb = XLSX.utils.book_new();
      
      const excelData: any[][] = [
        [`${commonControl?.entityName || 'Entity Name'}`],
        [`${commonControl?.address || 'Entity Address'}`],
        ...(commonControl?.cinNumber ? [[`CIN: ${commonControl.cinNumber}`]] : []),
        [`Statement of Profit and Loss for the year ended ${commonControl?.financialYearEnd ? new Date(commonControl.financialYearEnd).toLocaleDateString('en-IN') : 'March 31, 2024'}`],
        [`(All amounts in ${commonControl?.currency || 'INR'} ${commonControl?.units || 'Millions'})`],
        [], // Empty row
        ['Particulars', 'Note No.', 'Current Year', 'Previous Year'],
        ['I. REVENUE']
      ];

      let currentRow = excelData.length;
      const revenueStartRow = currentRow + 1;

      // Add revenue items
      revenue.forEach(item => {
        excelData.push([
          `  ${item.majorHead?.name || item.ledgerName}`,
          '', // Note number placeholder
          Math.abs(Number(item.closingBalanceCY)),
          Math.abs(Number(item.closingBalancePY))
        ]);
        currentRow++;
      });

      const revenueEndRow = currentRow;
      
      excelData.push(['Total Revenue (I)', '', 
        { f: `SUM(C${revenueStartRow}:C${revenueEndRow})` },
        { f: `SUM(D${revenueStartRow}:D${revenueEndRow})` }
      ]);
      currentRow++;

      excelData.push([]); // Empty row
      excelData.push(['II. EXPENSES']);
      currentRow += 2;

      const expenseStartRow = currentRow + 1;

      // Add expense items
      expenses.forEach(item => {
        excelData.push([
          `  ${item.majorHead?.name || item.ledgerName}`,
          '', // Note number placeholder
          Number(item.closingBalanceCY),
          Number(item.closingBalancePY)
        ]);
        currentRow++;
      });

      const expenseEndRow = currentRow;
      const totalRevenueRow = revenueEndRow + 1;
      
      excelData.push(['Total Expenses (II)', '', 
        { f: `SUM(C${expenseStartRow}:C${expenseEndRow})` },
        { f: `SUM(D${expenseStartRow}:D${expenseEndRow})` }
      ]);
      currentRow++;

      const totalExpenseRow = currentRow;

      excelData.push([]); // Empty row
      currentRow++;

      // Add calculated rows with formulas
      excelData.push(['Profit/(Loss) before tax (I-II)', '', 
        { f: `C${totalRevenueRow}-C${totalExpenseRow}` },
        { f: `D${totalRevenueRow}-D${totalExpenseRow}` }
      ]);
      currentRow++;

      const profitBeforeTaxRow = currentRow;

      // Add tax expense
      const currentYearTax = taxEntries.reduce((sum, entry) => sum + Number(entry.currentYear), 0);
      const previousYearTax = taxEntries.reduce((sum, entry) => sum + Number(entry.previousYear), 0);
      
      excelData.push(['Tax expense', '8', currentYearTax, previousYearTax]);
      currentRow++;

      const taxExpenseRow = currentRow;

      excelData.push(['Profit/(Loss) for the period', '', 
        { f: `C${profitBeforeTaxRow}-C${taxExpenseRow}` },
        { f: `D${profitBeforeTaxRow}-D${taxExpenseRow}` }
      ]);

      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Apply professional formatting similar to balance sheet
      const headerStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: (commonControl?.defaultFontSize || 11) + 2, bold: true, color: 'FFFFFF' },
        fill: { fgColor: { rgb: '366092' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      });

      const titleStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: (commonControl?.defaultFontSize || 11) + 4, bold: true },
        alignment: { horizontal: 'center', vertical: 'center' }
      });

      const sectionHeaderStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: commonControl?.defaultFontSize || 11, bold: true },
        fill: { fgColor: { rgb: 'E7E6E6' } },
        alignment: { horizontal: 'left', vertical: 'center' }
      });

      const numberStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: commonControl?.defaultFontSize || 11 },
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: getNumberFormat(commonControl)
      });

      const totalStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: commonControl?.defaultFontSize || 11, bold: true },
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: getNumberFormat(commonControl),
        border: {
          top: { style: 'double', color: { rgb: '000000' } },
          bottom: { style: 'double', color: { rgb: '000000' } }
        }
      });

      // Apply formatting
      applyFormatting(ws, 'A1:D1', titleStyle);
      applyFormatting(ws, 'A7:D7', headerStyle);
      applyFormatting(ws, `C8:D${currentRow}`, numberStyle);

      // Set column widths
      setColumnWidths(ws, [40, 10, 15, 15]);

      XLSX.utils.book_append_sheet(wb, ws, 'Profit & Loss');

      // Generate file buffer with styling
      const fileBuffer = XLSX.write(wb, { 
        type: 'buffer', 
        bookType: input.format,
        cellStyles: true
      });
      
      // Upload to Minio
      const fileName = `profit-loss-${Date.now()}.${input.format}`;
      const bucketName = 'financial-exports';
      
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
      }

      await minioClient.putObject(bucketName, fileName, fileBuffer);
      const downloadUrl = await minioClient.presignedGetObject(bucketName, fileName, 3600);

      return {
        success: true,
        downloadUrl,
        fileName,
        expiresIn: 3600
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to export profit & loss: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const exportCashFlow = baseProcedure
  .input(z.object({
    format: z.enum(['xlsx', 'csv']).default('xlsx')
  }))
  .mutation(async ({ input }) => {
    try {
      // Get enhanced cash flow data
      const trialBalance = await db.trialBalanceEntry.findMany({
        include: {
          majorHead: true,
          grouping: true,
        },
      });

      const commonControl = await db.commonControl.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      // Calculate cash flow components for both years (reusing logic from generateCashFlow)
      const plEntries = trialBalance.filter(entry => entry.type === 'PL');
      const revenue = plEntries.filter(entry => 
        entry.majorHead?.name?.includes('Revenue') ||
        entry.majorHead?.name?.includes('Income')
      );
      const expenses = plEntries.filter(entry => 
        entry.majorHead?.name?.includes('Expense') ||
        entry.majorHead?.name?.includes('Cost') ||
        entry.majorHead?.name?.includes('Finance Costs') ||
        entry.majorHead?.name?.includes('Depreciation')
      );

      const totalRevenueCY = revenue.reduce((sum, item) => sum + Math.abs(Number(item.closingBalanceCY)), 0);
      const totalExpensesCY = expenses.reduce((sum, item) => sum + Number(item.closingBalanceCY), 0);
      const netProfitCY = totalRevenueCY - totalExpensesCY;

      const totalRevenuePY = revenue.reduce((sum, item) => sum + Math.abs(Number(item.closingBalancePY)), 0);
      const totalExpensesPY = expenses.reduce((sum, item) => sum + Number(item.closingBalancePY), 0);
      const netProfitPY = totalRevenuePY - totalExpensesPY;

      const depreciationCY = expenses
        .filter(entry => entry.majorHead?.name?.includes('Depreciation'))
        .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0);

      const depreciationPY = expenses
        .filter(entry => entry.majorHead?.name?.includes('Depreciation'))
        .reduce((sum, item) => sum + Number(item.closingBalancePY), 0);

      // Working capital changes
      const receivablesChangeCY = trialBalance
        .filter(entry => entry.majorHead?.name?.includes('Trade Receivables'))
        .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

      const payablesChangeCY = trialBalance
        .filter(entry => entry.majorHead?.name?.includes('Trade Payables'))
        .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

      const inventoryChangeCY = trialBalance
        .filter(entry => entry.majorHead?.name?.includes('Inventories'))
        .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

      const operatingCashFlowCY = netProfitCY + depreciationCY - receivablesChangeCY + payablesChangeCY - inventoryChangeCY;
      const operatingCashFlowPY = netProfitPY + depreciationPY; // Simplified for PY

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare data for Excel with previous year data
      const excelData = [
        [`${commonControl?.entityName || 'Entity Name'}`],
        [`${commonControl?.address || 'Entity Address'}`],
        ...(commonControl?.cinNumber ? [[`CIN: ${commonControl.cinNumber}`]] : []),
        [`Cash Flow Statement for the year ended ${commonControl?.financialYearEnd ? new Date(commonControl.financialYearEnd).toLocaleDateString('en-IN') : 'March 31, 2024'}`],
        [`(All amounts in ${commonControl?.currency || 'INR'} ${commonControl?.units || 'Millions'})`],
        [], // Empty row
        ['Particulars', 'Current Year', 'Previous Year'],
        ['A. CASH FLOWS FROM OPERATING ACTIVITIES'],
        ['Net profit/(loss) before tax', netProfitCY, netProfitPY],
        ['Adjustments for:'],
        ['  Depreciation and amortization', depreciationCY, depreciationPY],
        ['Operating profit before working capital changes', netProfitCY + depreciationCY, netProfitPY + depreciationPY],
        ['Changes in working capital:'],
        ['  (Increase)/decrease in trade receivables', -receivablesChangeCY, 0],
        ['  (Increase)/decrease in inventories', -inventoryChangeCY, 0],
        ['  Increase/(decrease) in trade payables', payablesChangeCY, 0],
        ['Cash generated from operations', operatingCashFlowCY, operatingCashFlowPY],
        ['Direct taxes paid', 0, 0],
        ['Net cash from operating activities (A)', operatingCashFlowCY, operatingCashFlowPY],
        [], // Empty row
        ['B. CASH FLOWS FROM INVESTING ACTIVITIES'],
        ['Purchase of property, plant and equipment', 0, 0],
        ['Purchase/sale of investments', 0, 0],
        ['Net cash used in investing activities (B)', 0, 0],
        [], // Empty row
        ['C. CASH FLOWS FROM FINANCING ACTIVITIES'],
        ['Proceeds from/(repayment of) borrowings', 0, 0],
        ['Proceeds from issue of equity shares', 0, 0],
        ['Dividends paid', 0, 0],
        ['Net cash from financing activities (C)', 0, 0],
        [], // Empty row
        ['Net increase/(decrease) in cash and cash equivalents (A+B+C)', operatingCashFlowCY, operatingCashFlowPY],
        ['Cash and cash equivalents at the beginning of the year', 0, 0],
        ['Cash and cash equivalents at the end of the year', operatingCashFlowCY, 0]
      ];

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Apply professional formatting
      const titleStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: (commonControl?.defaultFontSize || 11) + 4, bold: true },
        alignment: { horizontal: 'center', vertical: 'center' }
      });

      const numberStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: commonControl?.defaultFontSize || 11 },
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: getNumberFormat(commonControl)
      });

      applyFormatting(ws, 'A1:C1', titleStyle);
      applyFormatting(ws, 'B7:C32', numberStyle);
      setColumnWidths(ws, [50, 15, 15]);

      XLSX.utils.book_append_sheet(wb, ws, 'Cash Flow');

      // Generate file buffer
      const fileBuffer = XLSX.write(wb, { 
        type: 'buffer', 
        bookType: input.format,
        cellStyles: true
      });
      
      // Upload to Minio
      const fileName = `cash-flow-${Date.now()}.${input.format}`;
      const bucketName = 'financial-exports';
      
      // Ensure bucket exists
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
      }

      await minioClient.putObject(bucketName, fileName, fileBuffer);

      // Generate presigned URL (valid for 1 hour)
      const downloadUrl = await minioClient.presignedGetObject(bucketName, fileName, 3600);

      return {
        success: true,
        downloadUrl,
        fileName,
        expiresIn: 3600
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to export cash flow: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const exportAgingSchedules = baseProcedure
  .input(z.object({
    format: z.enum(['xlsx', 'csv']).default('xlsx')
  }))
  .mutation(async ({ input }) => {
    try {
      // Get aging data
      const receivables = await db.receivableLedgerEntry.findMany({
        orderBy: [{ agingBucket: 'asc' }, { customerName: 'asc' }],
      });
      
      const payables = await db.payableLedgerEntry.findMany({
        orderBy: [{ agingBucket: 'asc' }, { vendorName: 'asc' }],
      });

      const commonControl = await db.commonControl.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      
      // Receivables aging data
      const receivablesData = [
        [`${commonControl?.entityName || 'Entity Name'}`],
        [`Trade Receivables Aging as at ${commonControl?.financialYearEnd ? new Date(commonControl.financialYearEnd).toLocaleDateString('en-IN') : 'March 31, 2024'}`],
        [], // Empty row
        ['Age Bucket', 'Undisputed', 'Disputed', 'Total', '% of Total'],
        ...Object.entries(
          receivables.reduce((acc, entry) => {
            if (!acc[entry.agingBucket || 'Not Specified']) {
              acc[entry.agingBucket || 'Not Specified'] = { disputed: 0, undisputed: 0, total: 0 };
            }
            const amount = Number(entry.outstandingAmount);
            acc[entry.agingBucket || 'Not Specified'].total += amount;
            if (entry.disputed) {
              acc[entry.agingBucket || 'Not Specified'].disputed += amount;
            } else {
              acc[entry.agingBucket || 'Not Specified'].undisputed += amount;
            }
            return acc;
          }, {} as Record<string, { disputed: number; undisputed: number; total: number }>)
        ).map(([bucket, data]) => {
          const totalReceivables = receivables.reduce((sum, entry) => sum + Number(entry.outstandingAmount), 0);
          return [
            bucket,
            data.undisputed,
            data.disputed,
            data.total,
            ((data.total / totalReceivables) * 100).toFixed(1) + '%'
          ];
        })
      ];

      const receivablesWs = XLSX.utils.aoa_to_sheet(receivablesData);
      
      // Apply formatting
      const titleStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: (commonControl?.defaultFontSize || 11) + 2, bold: true },
        alignment: { horizontal: 'center', vertical: 'center' }
      });

      const numberStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: commonControl?.defaultFontSize || 11 },
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: getNumberFormat(commonControl)
      });

      applyFormatting(receivablesWs, 'A1:E1', titleStyle);
      applyFormatting(receivablesWs, 'B4:D20', numberStyle);
      setColumnWidths(receivablesWs, [20, 15, 15, 15, 12]);
      
      XLSX.utils.book_append_sheet(wb, receivablesWs, 'Receivables Aging');

      // Payables aging data
      const payablesData = [
        [`${commonControl?.entityName || 'Entity Name'}`],
        [`Trade Payables Aging as at ${commonControl?.financialYearEnd ? new Date(commonControl.financialYearEnd).toLocaleDateString('en-IN') : 'March 31, 2024'}`],
        [], // Empty row
        ['Age Bucket', 'MSME', 'Others', 'Disputed', 'Total', '% of Total'],
        ...Object.entries(
          payables.reduce((acc, entry) => {
            if (!acc[entry.agingBucket || 'Not Specified']) {
              acc[entry.agingBucket || 'Not Specified'] = { msme: 0, others: 0, disputed: 0, total: 0 };
            }
            const amount = Number(entry.outstandingAmount);
            acc[entry.agingBucket || 'Not Specified'].total += amount;
            
            if (entry.payableType === 'MSME') {
              acc[entry.agingBucket || 'Not Specified'].msme += amount;
            } else {
              acc[entry.agingBucket || 'Not Specified'].others += amount;
            }
            
            if (entry.disputed) {
              acc[entry.agingBucket || 'Not Specified'].disputed += amount;
            }
            return acc;
          }, {} as Record<string, { msme: number; others: number; disputed: number; total: number }>)
        ).map(([bucket, data]) => {
          const totalPayables = payables.reduce((sum, entry) => sum + Number(entry.outstandingAmount), 0);
          return [
            bucket,
            data.msme,
            data.others,
            data.disputed,
            data.total,
            ((data.total / totalPayables) * 100).toFixed(1) + '%'
          ];
        })
      ];

      const payablesWs = XLSX.utils.aoa_to_sheet(payablesData);
      
      applyFormatting(payablesWs, 'A1:F1', titleStyle);
      applyFormatting(payablesWs, 'B4:E20', numberStyle);
      setColumnWidths(payablesWs, [20, 12, 12, 12, 15, 12]);
      
      XLSX.utils.book_append_sheet(wb, payablesWs, 'Payables Aging');

      // Generate file buffer
      const fileBuffer = XLSX.write(wb, { 
        type: 'buffer', 
        bookType: input.format,
        cellStyles: true
      });
      
      // Upload to Minio
      const fileName = `aging-schedules-${Date.now()}.${input.format}`;
      const bucketName = 'financial-exports';
      
      // Ensure bucket exists
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
      }

      await minioClient.putObject(bucketName, fileName, fileBuffer);

      // Generate presigned URL (valid for 1 hour)
      const downloadUrl = await minioClient.presignedGetObject(bucketName, fileName, 3600);

      return {
        success: true,
        downloadUrl,
        fileName,
        expiresIn: 3600
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to export aging schedules: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const exportRatioAnalysis = baseProcedure
  .input(z.object({
    format: z.enum(['xlsx', 'csv']).default('xlsx')
  }))
  .mutation(async ({ input }) => {
    try {
      // Get ratio analysis data (reusing logic from generateRatioAnalysis)
      const trialBalance = await db.trialBalanceEntry.findMany({
        include: {
          majorHead: true,
          grouping: true,
        },
      });

      const commonControl = await db.commonControl.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      // Calculate basic ratios (simplified version)
      const bsEntries = trialBalance.filter(entry => entry.type === 'BS');
      const plEntries = trialBalance.filter(entry => entry.type === 'PL');

      const totalAssets = bsEntries
        .filter(entry => entry.majorHead?.name?.includes('Assets'))
        .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0);

      const totalEquity = bsEntries
        .filter(entry => entry.majorHead?.name?.includes('Equity'))
        .reduce((sum, item) => sum + Math.abs(Number(item.closingBalanceCY)), 0);

      const totalRevenue = plEntries
        .filter(entry => entry.majorHead?.name?.includes('Revenue'))
        .reduce((sum, item) => sum + Math.abs(Number(item.closingBalanceCY)), 0);

      const totalExpenses = plEntries
        .filter(entry => entry.majorHead?.name?.includes('Expense'))
        .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0);

      const netProfit = totalRevenue - totalExpenses;

      // Sample ratios
      const ratios = [
        {
          name: 'Return on Assets (%)',
          formula: 'Net Profit / Total Assets * 100',
          currentYear: totalAssets > 0 ? (netProfit / totalAssets) * 100 : 0,
          previousYear: 0, // Simplified
          variance: 0,
          requiresExplanation: false
        },
        {
          name: 'Return on Equity (%)',
          formula: 'Net Profit / Total Equity * 100',
          currentYear: totalEquity > 0 ? (netProfit / totalEquity) * 100 : 0,
          previousYear: 0,
          variance: 0,
          requiresExplanation: false
        },
        {
          name: 'Asset Turnover Ratio',
          formula: 'Revenue / Total Assets',
          currentYear: totalAssets > 0 ? totalRevenue / totalAssets : 0,
          previousYear: 0,
          variance: 0,
          requiresExplanation: false
        }
      ];

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare data for Excel
      const excelData = [
        [`${commonControl?.entityName || 'Entity Name'}`],
        [`Ratio Analysis for the year ended ${commonControl?.financialYearEnd ? new Date(commonControl.financialYearEnd).toLocaleDateString('en-IN') : 'March 31, 2024'}`],
        [], // Empty row
        ['Ratio Name', 'Formula', 'Current Year', 'Previous Year', 'Variance', 'Requires Explanation'],
        ...ratios.map(ratio => [
          ratio.name,
          ratio.formula,
          ratio.currentYear.toFixed(2),
          ratio.previousYear.toFixed(2),
          ratio.variance.toFixed(1) + '%',
          ratio.requiresExplanation ? 'Yes' : 'No'
        ]),
        [], // Empty row
        ['Summary'],
        ['Total Ratios', ratios.length],
        ['Ratios Requiring Explanation', ratios.filter(r => r.requiresExplanation).length],
        ['Average Variance', ratios.reduce((sum, r) => sum + Math.abs(r.variance), 0) / ratios.length + '%']
      ];

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Apply formatting
      const titleStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: (commonControl?.defaultFontSize || 11) + 2, bold: true },
        alignment: { horizontal: 'center', vertical: 'center' }
      });

      const numberStyle = createCellStyle({
        font: { name: commonControl?.defaultFont || 'Calibri', size: commonControl?.defaultFontSize || 11 },
        alignment: { horizontal: 'right', vertical: 'center' }
      });

      applyFormatting(ws, 'A1:F1', titleStyle);
      applyFormatting(ws, 'C4:D10', numberStyle);
      setColumnWidths(ws, [25, 30, 15, 15, 12, 18]);
      
      XLSX.utils.book_append_sheet(wb, ws, 'Ratio Analysis');

      // Generate file buffer
      const fileBuffer = XLSX.write(wb, { 
        type: 'buffer', 
        bookType: input.format,
        cellStyles: true
      });
      
      // Upload to Minio
      const fileName = `ratio-analysis-${Date.now()}.${input.format}`;
      const bucketName = 'financial-exports';
      
      // Ensure bucket exists
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
      }

      await minioClient.putObject(bucketName, fileName, fileBuffer);

      // Generate presigned URL (valid for 1 hour)
      const downloadUrl = await minioClient.presignedGetObject(bucketName, fileName, 3600);

      return {
        success: true,
        downloadUrl,
        fileName,
        expiresIn: 3600
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to export ratio analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
