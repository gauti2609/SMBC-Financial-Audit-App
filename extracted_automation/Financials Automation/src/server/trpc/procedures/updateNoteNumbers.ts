import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const updateNoteNumbers = baseProcedure
  .input(z.object({
    companyId: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Get all selected notes for the specific company
    const selectedNotes = await db.noteSelection.findMany({
      where: { 
        finalSelected: true,
        companyId: input.companyId,
      },
      orderBy: { noteRef: 'asc' },
    });

    // Auto-numbering logic based on noteRef hierarchy
    let noteCounter = 1;
    const updatedNotes = [];

    for (const note of selectedNotes) {
      let autoNumber = '';
      
      // Handle different note reference patterns
      if (note.noteRef.startsWith('A.')) {
        // Accounting policies - keep original reference
        autoNumber = note.noteRef;
      } else if (note.noteRef.startsWith('B.') || note.noteRef.startsWith('C.') || note.noteRef.startsWith('D.')) {
        // Financial statement notes - assign sequential numbers
        autoNumber = noteCounter.toString();
        noteCounter++;
      } else if (note.noteRef.startsWith('E.') || note.noteRef.startsWith('F.') || note.noteRef.startsWith('G.')) {
        // Additional disclosures - assign sequential numbers
        autoNumber = noteCounter.toString();
        noteCounter++;
      } else {
        // Default sequential numbering
        autoNumber = noteCounter.toString();
        noteCounter++;
      }

      // Update the note with auto number
      const updatedNote = await db.noteSelection.update({
        where: { id: note.id },
        data: { autoNumber },
      });
      updatedNotes.push(updatedNote);
    }

    return {
      success: true,
      updatedCount: updatedNotes.length,
      notes: updatedNotes,
    };
  });
