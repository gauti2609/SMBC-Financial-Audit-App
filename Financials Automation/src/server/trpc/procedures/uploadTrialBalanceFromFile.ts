import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { minioClient, minioBaseUrl } from "~/server/minio";
import * as XLSX from 'xlsx';

export const getTrialBalanceUploadUrl = baseProcedure
  .input(z.object({ 
    fileName: z.string(),
    fileType: z.string()
  }))
  .mutation(async ({ input }) => {
    const objectName = `trial-balance-uploads/${Date.now()}-${input.fileName}`;
    const presignedUrl = await minioClient.presignedPutObject('uploads', objectName, 24 * 60 * 60); // 24 hours
    
    return {
      uploadUrl: presignedUrl,
      objectName,
    };
  });

export const processTrialBalanceFile = baseProcedure
  .input(z.object({
    objectName: z.string(),
    companyId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const { objectName, companyId } = input;
    
    // Get the file from Minio
    const fileStream = await minioClient.getObject('uploads', objectName);
    
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
    
    // Process and validate data
    const trialBalanceEntries = [];
    
    for (const row of data) {
      const entry = {
        ledgerName: String(row['Ledger Name'] || row['ledgerName'] || '').trim(),
        openingBalanceCY: Number(row['Opening Balance CY'] || row['openingBalanceCY'] || 0),
        debitCY: Number(row['Debit CY'] || row['debitCY'] || 0),
        creditCY: Number(row['Credit CY'] || row['creditCY'] || 0),
        closingBalanceCY: Number(row['Closing Balance CY'] || row['closingBalanceCY'] || 0),
        closingBalancePY: Number(row['Closing Balance PY'] || row['closingBalancePY'] || 0),
        type: String(row['Type'] || row['type'] || 'BS').toUpperCase() as 'BS' | 'PL',
        majorHead: String(row['Major Head'] || row['majorHead'] || '').trim() || undefined,
        minorHead: String(row['Minor Head'] || row['minorHead'] || '').trim() || undefined,
        grouping: String(row['Grouping'] || row['grouping'] || '').trim() || undefined,
      };
      
      // Skip empty rows
      if (!entry.ledgerName) continue;
      
      // Calculate closing balance if not provided
      if (entry.closingBalanceCY === 0) {
        entry.closingBalanceCY = entry.openingBalanceCY + entry.debitCY - entry.creditCY;
      }
      
      trialBalanceEntries.push(entry);
    }
    
    if (trialBalanceEntries.length === 0) {
      throw new Error('No valid data found in the Excel file');
    }
    
    // Clear existing trial balance for this company
    await db.trialBalanceEntry.deleteMany({
      where: { companyId },
    });
    
    // Process each entry and create with proper relations
    const results = [];
    for (const entry of trialBalanceEntries) {
      let majorHeadId = null;
      let minorHeadId = null;
      let groupingId = null;

      // Find or create major head
      if (entry.majorHead) {
        const majorHead = await db.majorHead.upsert({
          where: { name: entry.majorHead },
          create: { name: entry.majorHead },
          update: {},
        });
        majorHeadId = majorHead.id;
      }

      // Find or create minor head
      if (entry.minorHead) {
        const minorHead = await db.minorHead.upsert({
          where: { name: entry.minorHead },
          create: { name: entry.minorHead },
          update: {},
        });
        minorHeadId = minorHead.id;
      }

      // Find or create grouping
      if (entry.grouping) {
        const grouping = await db.grouping.upsert({
          where: { name: entry.grouping },
          create: { name: entry.grouping },
          update: {},
        });
        groupingId = grouping.id;
      }

      const result = await db.trialBalanceEntry.create({
        data: {
          companyId,
          ledgerName: entry.ledgerName,
          openingBalanceCY: entry.openingBalanceCY,
          debitCY: entry.debitCY,
          creditCY: entry.creditCY,
          closingBalanceCY: entry.closingBalanceCY,
          closingBalancePY: entry.closingBalancePY,
          type: entry.type,
          majorHeadId,
          minorHeadId,
          groupingId,
        },
      });
      results.push(result);
    }
    
    // Clean up uploaded file
    try {
      await minioClient.removeObject('uploads', objectName);
    } catch (error) {
      console.warn('Failed to cleanup uploaded file:', error);
    }
    
    return {
      success: true,
      entriesProcessed: results.length,
      entries: results,
    };
  });
