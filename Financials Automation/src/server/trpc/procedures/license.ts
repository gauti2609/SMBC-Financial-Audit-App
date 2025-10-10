import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "../main";
import { db } from "../../db";

export const validateLicense = baseProcedure
  .input(z.object({
    licenseKey: z.string(),
    clientIp: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const { licenseKey, clientIp } = input;
    
    const license = await db.license.findUnique({
      where: { licenseKey },
    });
    
    if (!license) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invalid license key",
      });
    }
    
    if (!license.isActive) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "License is inactive",
      });
    }
    
    if (license.expiresAt && license.expiresAt < new Date()) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "License has expired",
      });
    }
    
    // Check IP restrictions if configured
    if (license.allowedIPs.length > 0 && clientIp) {
      if (!license.allowedIPs.includes(clientIp)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "IP address not authorized for this license",
        });
      }
    }
    
    // Update last used timestamp
    await db.license.update({
      where: { id: license.id },
      data: { lastUsedAt: new Date() },
    });
    
    return {
      isValid: true,
      companyName: license.companyName,
      expiresAt: license.expiresAt,
      maxUsers: license.maxUsers,
      maxCompanies: license.maxCompanies,
      networkPath: license.networkPath,
      features: license.features,
    };
  });

export const getLicenseInfo = baseProcedure
  .input(z.object({
    licenseKey: z.string(),
  }))
  .query(async ({ input }) => {
    const { licenseKey } = input;
    
    const license = await db.license.findUnique({
      where: { licenseKey },
    });
    
    if (!license) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "License not found",
      });
    }
    
    return {
      companyName: license.companyName,
      contactEmail: license.contactEmail,
      issuedAt: license.issuedAt,
      expiresAt: license.expiresAt,
      isActive: license.isActive,
      maxUsers: license.maxUsers,
      maxCompanies: license.maxCompanies,
      activeUsers: license.activeUsers,
      activeCompanies: license.activeCompanies,
      lastUsedAt: license.lastUsedAt,
      features: license.features,
    };
  });

export const updateLicenseUsage = baseProcedure
  .input(z.object({
    licenseKey: z.string(),
    activeUsers: z.number().optional(),
    activeCompanies: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    const { licenseKey, activeUsers, activeCompanies } = input;
    
    const license = await db.license.findUnique({
      where: { licenseKey },
    });
    
    if (!license) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "License not found",
      });
    }
    
    const updateData: any = { lastUsedAt: new Date() };
    
    if (activeUsers !== undefined) {
      if (activeUsers > license.maxUsers) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Maximum users exceeded. License allows ${license.maxUsers} users.`,
        });
      }
      updateData.activeUsers = activeUsers;
    }
    
    if (activeCompanies !== undefined) {
      if (activeCompanies > license.maxCompanies) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Maximum companies exceeded. License allows ${license.maxCompanies} companies.`,
        });
      }
      updateData.activeCompanies = activeCompanies;
    }
    
    await db.license.update({
      where: { id: license.id },
      data: updateData,
    });
    
    return { success: true };
  });
