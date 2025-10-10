import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const calculateTaxExpense = baseProcedure.query(async () => {
  try {
    // Get all tax entries
    const taxEntries = await db.taxEntry.findMany({
      orderBy: { particulars: 'asc' },
    });

    // Calculate current and previous year tax expenses
    const currentYearTax = taxEntries.reduce((sum, entry) => {
      return sum + Number(entry.currentYear);
    }, 0);

    const previousYearTax = taxEntries.reduce((sum, entry) => {
      return sum + Number(entry.previousYear);
    }, 0);

    // Categorize tax entries for detailed breakdown
    const currentTax = taxEntries
      .filter(entry => 
        entry.particulars.toLowerCase().includes('current') ||
        entry.particulars.toLowerCase().includes('provision')
      )
      .reduce((sum, entry) => sum + Number(entry.currentYear), 0);

    const deferredTax = taxEntries
      .filter(entry => 
        entry.particulars.toLowerCase().includes('deferred')
      )
      .reduce((sum, entry) => sum + Number(entry.currentYear), 0);

    const previousCurrentTax = taxEntries
      .filter(entry => 
        entry.particulars.toLowerCase().includes('current') ||
        entry.particulars.toLowerCase().includes('provision')
      )
      .reduce((sum, entry) => sum + Number(entry.previousYear), 0);

    const previousDeferredTax = taxEntries
      .filter(entry => 
        entry.particulars.toLowerCase().includes('deferred')
      )
      .reduce((sum, entry) => sum + Number(entry.previousYear), 0);

    return {
      totalCurrentYear: currentYearTax,
      totalPreviousYear: previousYearTax,
      breakdown: {
        currentTax: {
          currentYear: currentTax,
          previousYear: previousCurrentTax,
        },
        deferredTax: {
          currentYear: deferredTax,
          previousYear: previousDeferredTax,
        }
      },
      entries: taxEntries,
    };
  } catch (error) {
    console.error('Failed to calculate tax expense:', error);
    return {
      totalCurrentYear: 0,
      totalPreviousYear: 0,
      breakdown: {
        currentTax: { currentYear: 0, previousYear: 0 },
        deferredTax: { currentYear: 0, previousYear: 0 },
      },
      entries: [],
    };
  }
});
