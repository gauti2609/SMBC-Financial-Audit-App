import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const addGrouping = baseProcedure
  .input(z.object({ 
    name: z.string().min(1, "Grouping name is required"),
    minorHeadId: z.string().min(1, "Minor Head selection is required - Grouping must be mapped to a Minor Head")
  }))
  .mutation(async ({ input }) => {
    // Validate that the minor head exists
    const minorHead = await db.minorHead.findUnique({
      where: { id: input.minorHeadId },
      include: { majorHead: true }
    });
    
    if (!minorHead) {
      throw new Error("Selected Minor Head does not exist. Please create the Minor Head first.");
    }

    return await db.grouping.create({
      data: { 
        name: input.name,
        minorHeadId: input.minorHeadId
      },
      include: {
        minorHead: {
          include: {
            majorHead: true // Return the full hierarchy
          }
        }
      }
    });
  });
