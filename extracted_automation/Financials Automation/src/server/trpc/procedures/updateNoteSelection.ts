import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const updateNoteSelectionSchema = z.object({
  id: z.string(),
  noteRef: z.string().min(1, 'Note reference is required'),
  description: z.string().min(1, 'Description is required'),
  linkedMajorHead: z.string().optional(),
});

export const updateNoteSelection = baseProcedure
  .input(updateNoteSelectionSchema)
  .mutation(async ({ input }) => {
    const { id, ...data } = input;
    return await db.noteSelection.update({
      where: { id },
      data,
    });
  });
