import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { minioClient } from "~/server/minio";
import * as XLSX from 'xlsx';

export const getInvestmentUploadUrl = baseProcedure
  .input(z.object({ 
    fileName: z.string(),
    fileType: z.string()
  }))
  .mutation(async ({ input }) => {
    const objectName = `investment-uploads/${Date.now()}-${input.fileName}`;
    const presignedUrl = await minioClient.presignedPutObject('uploads', objectName, 24 * 60 * 60); // 24 hours
    
    return {
      uploadUrl: presignedUrl,
      objectName,
    };
  });

export const processInvestmentFile = baseProcedure
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
    const investmentEntries = [];
    
    for (const row of data) {
      const entry = {
        particulars: String(row['Particulars'] || row['particulars'] || '').trim(),
        classification: String(row['Classification'] || row['classification'] || 'Non-Current').trim() as 'Current' | 'Non-Current',
        costCY: Number(row['Cost CY'] || row['costCY'] || row['Current Year'] || 0),
        costPY: Number(row['Cost PY'] || row['costPY'] || row['Previous Year'] || 0),
      };
      
      // Skip empty rows
      if (!entry.particulars) continue;
      
      // Validate classification
      if (!['Current', 'Non-Current'].includes(entry.classification)) {
        entry.classification = 'Non-Current';
      }
      
      investmentEntries.push(entry);
    }
    
    if (investmentEntries.length === 0) {
      throw new Error('No valid data found in the Excel file');
    }
    
    // Clear existing investments
    await db.investmentEntry.deleteMany();
    
    // Create new entries
    const results = [];
    for (const entry of investmentEntries) {
      const result = await db.investmentEntry.create({
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
