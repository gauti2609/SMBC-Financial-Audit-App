import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const deleteNoteSelection = baseProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    // Check if note is system recommended
    const note = await db.noteSelection.findUnique({
      where: { id: input.id },
    });
    
    if (note?.systemRecommended) {
      throw new Error('Cannot delete system recommended notes');
    }
    
    return await db.noteSelection.delete({
      where: { id: input.id },
    });
  });
