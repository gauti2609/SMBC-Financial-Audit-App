import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { minioClient } from "~/server/minio";
import * as XLSX from 'xlsx';

export const getDebtorsUploadUrl = baseProcedure
  .input(z.object({ 
    fileName: z.string(),
    fileType: z.string()
  }))
  .mutation(async ({ input }) => {
    const objectName = `debtors-uploads/${Date.now()}-${input.fileName}`;
    const presignedUrl = await minioClient.presignedPutObject('uploads', objectName, 24 * 60 * 60);
    
    return {
      uploadUrl: presignedUrl,
      objectName,
    };
  });

export const getCreditorsUploadUrl = baseProcedure
  .input(z.object({ 
    fileName: z.string(),
    fileType: z.string()
  }))
  .mutation(async ({ input }) => {
    const objectName = `creditors-uploads/${Date.now()}-${input.fileName}`;
    const presignedUrl = await minioClient.presignedPutObject('uploads', objectName, 24 * 60 * 60);
    
    return {
      uploadUrl: presignedUrl,
      objectName,
    };
  });

const calculateAging = (invoiceDate: Date, reportDate: Date): { daysOutstanding: number; agingBucket: string } => {
  const daysDiff = Math.floor((reportDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let agingBucket: string;
  if (daysDiff <= 182) {
    agingBucket = '< 182 Days';
  } else if (daysDiff <= 365) {
    agingBucket = '182-365 Days';
  } else if (daysDiff <= 730) {
    agingBucket = '1-2 Years';
  } else if (daysDiff <= 1095) {
    agingBucket = '2-3 Years';
  } else {
    agingBucket = '> 3 Years';
  }
  
  return { daysOutstanding: daysDiff, agingBucket };
};

export const processDebtorsFile = baseProcedure
  .input(z.object({
    objectName: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Get the file from Minio
    const fileStream = await minioClient.getObject('uploads', input.objectName);
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Get financial year end for aging calculation
    const commonControl = await db.commonControl.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const reportDate = commonControl?.financialYearEnd || new Date();
    
    // Process and validate data
    const receivableEntries = [];
    
    for (const row of data) {
      const customerName = String(row['Customer Name'] || row['customerName'] || '').trim();
      if (!customerName) continue;
      
      const invoiceAmount = Number(row['Invoice Amount'] || row['invoiceAmount'] || 0);
      const amountSettled = Number(row['Amount Settled'] || row['amountSettled'] || 0);
      const outstandingAmount = Number(row['Outstanding Amount'] || row['outstandingAmount'] || (invoiceAmount - amountSettled));
      
      const invoiceDateStr = row['Invoice Date'] || row['invoiceDate'];
      let invoiceDate = new Date();
      if (invoiceDateStr) {
        invoiceDate = new Date(invoiceDateStr);
      }
      
      // Calculate aging
      const { daysOutstanding, agingBucket } = calculateAging(invoiceDate, reportDate);
      
      const entry = {
        customerName,
        invoiceNumber: String(row['Invoice Number'] || row['invoiceNumber'] || '').trim() || undefined,
        invoiceDate,
        invoiceAmount,
        amountSettled,
        outstandingAmount,
        disputed: Boolean(row['Disputed'] || row['disputed'] || false),
        daysOutstanding,
        agingBucket,
      };
      
      receivableEntries.push(entry);
    }
    
    if (receivableEntries.length === 0) {
      throw new Error('No valid data found in the Excel file');
    }
    
    // Clear existing receivable entries
    await db.receivableLedgerEntry.deleteMany();
    
    // Create entries
    const results = [];
    for (const entry of receivableEntries) {
      const result = await db.receivableLedgerEntry.create({
        data: entry,
      });
      results.push(result);
    }
    
    // Clean up uploaded file
    try {
      await minioClient.removeObject('uploads', input.objectName);
    } catch (error) {
      console.warn('Failed to cleanup uploaded file:', error);
    }
    
    return {
      success: true,
      entriesProcessed: results.length,
      entries: results,
    };
  });

export const processCreditorsFile = baseProcedure
  .input(z.object({
    objectName: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Get the file from Minio
    const fileStream = await minioClient.getObject('uploads', input.objectName);
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Get financial year end for aging calculation
    const commonControl = await db.commonControl.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const reportDate = commonControl?.financialYearEnd || new Date();
    
    // Process and validate data
    const payableEntries = [];
    
    for (const row of data) {
      const vendorName = String(row['Vendor Name'] || row['vendorName'] || '').trim();
      if (!vendorName) continue;
      
      const invoiceAmount = Number(row['Invoice Amount'] || row['invoiceAmount'] || 0);
      const amountSettled = Number(row['Amount Settled'] || row['amountSettled'] || 0);
      const outstandingAmount = Number(row['Outstanding Amount'] || row['outstandingAmount'] || (invoiceAmount - amountSettled));
      
      const invoiceDateStr = row['Invoice Date'] || row['invoiceDate'];
      let invoiceDate = new Date();
      if (invoiceDateStr) {
        invoiceDate = new Date(invoiceDateStr);
      }
      
      // Calculate aging
      const { daysOutstanding, agingBucket } = calculateAging(invoiceDate, reportDate);
      
      // Determine payable type
      const payableType = String(row['Type'] || row['type'] || 'Other').toUpperCase() === 'MSME' ? 'MSME' : 'Other';
      
      const entry = {
        vendorName,
        invoiceNumber: String(row['Invoice Number'] || row['invoiceNumber'] || '').trim() || undefined,
        invoiceDate,
        invoiceAmount,
        amountSettled,
        outstandingAmount,
        disputed: Boolean(row['Disputed'] || row['disputed'] || false),
        payableType: payableType as 'MSME' | 'Other',
        agingBucket,
      };
      
      payableEntries.push(entry);
    }
    
    if (payableEntries.length === 0) {
      throw new Error('No valid data found in the Excel file');
    }
    
    // Clear existing payable entries
    await db.payableLedgerEntry.deleteMany();
    
    // Create entries
    const results = [];
    for (const entry of payableEntries) {
      const result = await db.payableLedgerEntry.create({
        data: entry,
      });
      results.push(result);
    }
    
    // Clean up uploaded file
    try {
      await minioClient.removeObject('uploads', input.objectName);
    } catch (error) {
      console.warn('Failed to cleanup uploaded file:', error);
    }
    
    return {
      success: true,
      entriesProcessed: results.length,
      entries: results,
    };
  });
