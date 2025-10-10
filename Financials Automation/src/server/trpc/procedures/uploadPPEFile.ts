import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { minioClient } from "~/server/minio";
import * as XLSX from 'xlsx';

export const getPPEUploadUrl = baseProcedure
  .input(z.object({ 
    fileName: z.string(),
    fileType: z.string()
  }))
  .mutation(async ({ input }) => {
    const objectName = `ppe-uploads/${Date.now()}-${input.fileName}`;
    const presignedUrl = await minioClient.presignedPutObject('uploads', objectName, 24 * 60 * 60); // 24 hours
    
    return {
      uploadUrl: presignedUrl,
      objectName,
    };
  });

export const processPPEFile = baseProcedure
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
    
    // Process and validate data
    const ppeEntries = [];
    
    for (const row of data) {
      const entry = {
        assetClass: String(row['Asset Class'] || row['assetClass'] || '').trim(),
        openingGrossBlock: Number(row['Opening Gross Block'] || row['openingGrossBlock'] || 0),
        additions: Number(row['Additions'] || row['additions'] || 0),
        disposalsGross: Number(row['Disposals Gross'] || row['disposalsGross'] || 0),
        openingAccDepreciation: Number(row['Opening Acc Depreciation'] || row['openingAccDepreciation'] || 0),
        depreciationForYear: Number(row['Depreciation For Year'] || row['depreciationForYear'] || 0),
        accDeprOnDisposals: Number(row['Acc Depr On Disposals'] || row['accDeprOnDisposals'] || 0),
      };
      
      // Skip empty rows
      if (!entry.assetClass) continue;
      
      ppeEntries.push(entry);
    }
    
    if (ppeEntries.length === 0) {
      throw new Error('No valid data found in the Excel file');
    }
    
    // Clear existing PPE entries
    await db.pPEScheduleEntry.deleteMany();
    
    // Create new entries
    const results = [];
    for (const entry of ppeEntries) {
      const result = await db.pPEScheduleEntry.create({
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
