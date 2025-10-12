import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { minioClient } from "~/server/minio";
import * as XLSX from 'xlsx';

export const getShareCapitalUploadUrl = baseProcedure
  .input(z.object({
    fileName: z.string(),
    fileType: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      const bucketName = 'file-uploads';
      const objectName = `share-capital/${Date.now()}-${input.fileName}`;
      
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

export const processShareCapitalFile = baseProcedure
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
      
      const shareCapitalEntries = [];
      for (const row of dataRows) {
        // Skip empty rows
        if (!row || row.length === 0 || !row[0]) continue;
        
        try {
          const entry = {
            classOfShare: String(row[0] || "Equity Shares"),
            numberOfShares: BigInt(Number(row[1] || 0)),
            faceValue: Number(row[2] || 10),
            amountCY: Number(row[3] || 0),
            amountPY: Number(row[4] || 0),
            shareholderName: row[5] ? String(row[5]) : undefined,
            holdingPercentageCY: row[6] ? Number(row[6]) : undefined,
            numberOfSharesPY: row[7] ? BigInt(Number(row[7])) : undefined,
          };
          
          shareCapitalEntries.push(entry);
        } catch (error) {
          console.error(`Error processing row: ${JSON.stringify(row)}`, error);
          // Continue processing other rows
        }
      }

      // Save to database
      const results = [];
      for (const entry of shareCapitalEntries) {
        const created = await db.shareCapitalEntry.create({
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
        message: `Failed to process share capital file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
