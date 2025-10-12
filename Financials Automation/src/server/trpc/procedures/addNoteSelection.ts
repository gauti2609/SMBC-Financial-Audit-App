import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const noteSelectionSchema = z.object({
  companyId: z.string(),
  noteRef: z.string().min(1, 'Note reference is required'),
  description: z.string().min(1, 'Description is required'),
  linkedMajorHead: z.string().optional(),
});

export const addNoteSelection = baseProcedure
  .input(noteSelectionSchema)
  .mutation(async ({ input }) => {
    return await db.noteSelection.create({
      data: {
        ...input,
        systemRecommended: false,
        userSelected: true,
        finalSelected: true,
      },
    });
  });
