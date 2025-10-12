import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const addMinorHead = baseProcedure
  .input(z.object({ name: z.string() }))
  .mutation(async ({ input }) => {
    return await db.minorHead.create({
      data: { name: input.name },
    });
  });
