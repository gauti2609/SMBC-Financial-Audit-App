import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { minioClient } from "~/server/minio";
import * as XLSX from 'xlsx';

export const getRelatedPartiesUploadUrl = baseProcedure
  .input(z.object({
    fileName: z.string(),
    fileType: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      const bucketName = 'file-uploads';
      const objectName = `related-parties/${Date.now()}-${input.fileName}`;
      
      // Ensure bucket exists
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
      }

      // Generate presigned URL for upload (valid for 10 minutes)
      const uploadUrl = await minioClient.presignedPutObject(bucketName, objectName, 600);

      return {
        uploadUrl,
        objectName,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const processRelatedPartiesFile = baseProcedure
  .input(z.object({
    objectName: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      const bucketName = 'file-uploads';
      
      // Download file from Minio
      const fileStream = await minioClient.getObject(bucketName, input.objectName);
      
      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of fileStream) {
        chunks.push(chunk);
      }
      const fileBuffer = Buffer.concat(chunks);

      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Skip header row and process data
      const dataRows = jsonData.slice(1) as any[][];
      
      const relatedPartyEntries = [];
      for (const row of dataRows) {
        // Skip empty rows
        if (!row || row.length === 0 || !row[0]) continue;
        
        try {
          const entry = {
            relatedPartyName: String(row[0]),
            relationship: String(row[1] || ""),
            transactionType: String(row[2] || ""),
            amountCY: Number(row[3] || 0),
            amountPY: Number(row[4] || 0),
            balanceOutstandingCY: Number(row[5] || 0),
            balanceOutstandingPY: Number(row[6] || 0),
          };
          
          // Validate required fields
          if (!entry.relationship || !entry.transactionType) {
            console.warn(`Skipping row with missing required fields: ${JSON.stringify(row)}`);
            continue;
          }
          
          relatedPartyEntries.push(entry);
        } catch (error) {
          console.error(`Error processing row: ${JSON.stringify(row)}`, error);
          // Continue processing other rows
        }
      }

      // Save to database
      const results = [];
      for (const entry of relatedPartyEntries) {
        const created = await db.relatedPartyTransaction.create({
          data: entry,
        });
        results.push(created);
      }

      // Clean up uploaded file
      await minioClient.removeObject(bucketName, input.objectName);

      return {
        success: true,
        entriesProcessed: results.length,
        entries: results,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to process related parties file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
