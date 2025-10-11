import { z } from "zod";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "../main";
import { db } from "../../db";
import { env } from "../../env";

export const register = baseProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const { email, password, firstName, lastName } = input;
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User with this email already exists",
      });
    }
    
    // Hash password
    const passwordHash = await bcryptjs.hash(password, 12);
    
    // Create user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
    });
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  });

export const login = baseProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string(),
  }))
  .mutation(async ({ input }) => {
    const { email, password } = input;
    
    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });
    
    if (!user || !user.isActive) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }
    
    // Verify password
    const isValidPassword = await bcryptjs.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  });

export const logout = baseProcedure
  .input(z.object({
    token: z.string(),
  }))
  .mutation(async ({ input }) => {
    const { token } = input;
    
    // Delete session
    await db.session.deleteMany({
      where: { token },
    });
    
    return { success: true };
  });

export const getCurrentUser = baseProcedure
  .input(z.object({
    token: z.string(),
  }))
  .query(async ({ input }) => {
    const { token } = input;
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      
      // Check if session exists and is valid
      const session = await db.session.findUnique({
        where: { token },
        include: { user: true },
      });
      
      if (!session || session.expiresAt < new Date()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Session expired or invalid",
        });
      }
      
      if (!session.user.isActive) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User account is inactive",
        });
      }
      
      return {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        role: session.user.role,
      };
    } catch (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }
  });
