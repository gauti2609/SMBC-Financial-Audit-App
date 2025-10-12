import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const addMinorHead = baseProcedure
  .input(z.object({ 
    name: z.string().min(1, "Minor Head name is required"),
    majorHeadId: z.string().min(1, "Major Head selection is required - Minor Head must be mapped to a Major Head")
  }))
  .mutation(async ({ input }) => {
    // Validate that the major head exists
    const majorHead = await db.majorHead.findUnique({
      where: { id: input.majorHeadId }
    });
    
    if (!majorHead) {
      throw new Error("Selected Major Head does not exist. Please create the Major Head first.");
    }

    return await db.minorHead.create({
      data: { 
        name: input.name,
        majorHeadId: input.majorHeadId
      },
      include: {
        majorHead: true // Return the parent Major Head info
      }
    });
  });
