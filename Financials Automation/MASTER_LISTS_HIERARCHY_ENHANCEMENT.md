# Master Lists Enhancement: Hierarchical Structure for Major/Minor Heads and Groupings

## Overview

This enhancement implements the hierarchical mapping structure for Major Heads, Minor Heads, and Groupings as specified in the VBA code and Schedule III requirements. Every entry must follow the hierarchy: **Grouping → MinorHead → MajorHead**.

## Changes Made

### 1. Database Schema Updates (`prisma/schema.prisma`)

**Added Classification Fields to MajorHead:**
```prisma
model MajorHead {
  id                String              @id @default(cuid())
  name              String              @unique
  statementType     String              // "BS" (Balance Sheet) or "PL" (Profit & Loss)
  category          String              // For BS: "Asset" or "Liability", For PL: "Income" or "Expense"
  createdAt         DateTime            @default(now())
  minorHeads        MinorHead[]         // One Major Head can have many Minor Heads
  trialBalanceEntries TrialBalanceEntry[]
}
```

**Added Parent Relationship to MinorHead:**
```prisma
model MinorHead {
  id                String              @id @default(cuid())
  name              String              @unique
  majorHeadId       String              // Maps to parent Major Head
  majorHead         MajorHead           @relation(fields: [majorHeadId], references: [id], onDelete: Cascade)
  createdAt         DateTime            @default(now())
  groupings         Grouping[]          // One Minor Head can have many Groupings
  trialBalanceEntries TrialBalanceEntry[]
}
```

**Added Parent Relationship to Grouping:**
```prisma
model Grouping {
  id                String              @id @default(cuid())
  name              String              @unique
  minorHeadId       String              // Maps to parent Minor Head
  minorHead         MinorHead           @relation(fields: [minorHeadId], references: [id], onDelete: Cascade)
  createdAt         DateTime            @default(now())
  trialBalanceEntries TrialBalanceEntry[]
}
```

### 2. Standard Master Lists Seed Script (`prisma/seed-master-lists.ts`)

Created comprehensive seed script with:
- **33 Major Heads** from VBA (with classification)
- **26 Minor Heads** (mapped to parents)
- **70+ Groupings** (mapped to parents)

All data sourced from `VBA_Module1.bas` Setup_CommonControlSheet.

### 3. Enhanced API Procedures

**Created New Procedures:**
- `getMajorHeads.ts` - Returns Major Heads with counts and hierarchy
- `addMajorHead.ts` - Creates Major Head with required classification
- `getGroupings.ts` - Returns Groupings with full hierarchy
- `addGrouping.ts` - Creates Grouping with parent validation

**Updated Existing:**
- `addMinorHead.ts` - Now requires majorHeadId and validates parent exists
- `getMinorHeads.ts` - Now includes parent Major Head info

### 4. Validation Logic

**All Add Operations Include:**
1. **Required Fields Validation:**
   - Major Head: name, statementType (BS/PL), category (Asset/Liability/Income/Expense)
   - Minor Head: name, majorHeadId
   - Grouping: name, minorHeadId

2. **Business Logic Validation:**
   - Major Head: category must match statementType (e.g., BS → Asset or Liability)
   - Minor Head: majorHeadId must reference existing Major Head
   - Grouping: minorHeadId must reference existing Minor Head

3. **Cascade Delete Protection:**
   - Deleting Major Head cascades to Minor Heads and Groupings
   - Deleting Minor Head cascades to Groupings
   - User warned before cascade operations

## Usage Instructions

### Database Migration

**Important**: The schema changes require database migration. Follow these steps:

1. **Generate Prisma Client:**
   ```bash
   cd "Financials Automation"
   npx prisma generate
   ```

2. **Create Migration:**
   ```bash
   npx prisma migrate dev --name add_hierarchical_structure
   ```

3. **Run Seed Script:**
   ```bash
   npx tsx prisma/seed-master-lists.ts
   ```

### API Usage Examples

**Creating a New Major Head:**
```typescript
const majorHead = await trpc.addMajorHead.mutate({
  name: "New Major Head Name",
  statementType: "BS", // or "PL"
  category: "Asset" // or "Liability", "Income", "Expense"
});
```

**Creating a New Minor Head:**
```typescript
const minorHead = await trpc.addMinorHead.mutate({
  name: "New Minor Head Name",
  majorHeadId: "clx..." // ID of parent Major Head
});
```

**Creating a New Grouping:**
```typescript
const grouping = await trpc.addGrouping.mutate({
  name: "New Grouping Name",
  minorHeadId: "clx..." // ID of parent Minor Head
});
```

### UI Integration Recommendations

**1. Cascading Dropdowns:**
When users create entries, implement cascading dropdowns:
```
Step 1: Select/Create Major Head (with classification)
   ↓
Step 2: Select/Create Minor Head (filtered by selected Major Head)
   ↓
Step 3: Select/Create Grouping (filtered by selected Minor Head)
```

**2. Inline Creation:**
If parent doesn't exist, show inline creation form:
```
Creating Grouping: "New Grouping"
  └─ Minor Head not found → [+ Create Minor Head]
      └─ Major Head not found → [+ Create Major Head]
```

**3. Hierarchy Visualization:**
Display full path in UI:
```
Grouping: "Land"
  └─ Minor Head: "Tangible Assets"
      └─ Major Head: "Property, Plant and Equipment" (BS - Asset)
```

### File Upload Integration

When uploading Trial Balance or other schedules:

**Current Behavior (app.trysolid.com):**
- Creates entries independently
- No validation of hierarchy

**New Behavior (this enhancement):**
1. Check if Grouping exists
2. If not, check if parent Minor Head exists
3. If not, check if parent Major Head exists
4. Create from top-down: Major Head → Minor Head → Grouping

**Implementation in upload procedures:**
```typescript
// Example in uploadTrialBalanceFromFile.ts
if (entry.grouping) {
  let grouping = await db.grouping.findUnique({ where: { name: entry.grouping } });
  
  if (!grouping) {
    // Need to create, but first ensure parents exist
    const minorHeadName = mapGroupingToMinorHead(entry.grouping); // User-defined mapping
    let minorHead = await db.minorHead.findUnique({ where: { name: minorHeadName } });
    
    if (!minorHead) {
      const majorHeadName = mapMinorHeadToMajorHead(minorHeadName); // User-defined mapping
      let majorHead = await db.majorHead.findUnique({ where: { name: majorHeadName } });
      
      if (!majorHead) {
        // Create Major Head with user prompt for classification
        majorHead = await db.majorHead.create({
          data: {
            name: majorHeadName,
            statementType: userProvidedType, // Prompt user
            category: userProvidedCategory // Prompt user
          }
        });
      }
      
      minorHead = await db.minorHead.create({
        data: { name: minorHeadName, majorHeadId: majorHead.id }
      });
    }
    
    grouping = await db.grouping.create({
      data: { name: entry.grouping, minorHeadId: minorHead.id }
    });
  }
}
```

## Testing Checklist

- [ ] Run database migration successfully
- [ ] Seed script populates all 33 Major Heads
- [ ] Seed script populates all 26 Minor Heads with correct parents
- [ ] Seed script populates all 70+ Groupings with correct parents
- [ ] API: getMajorHeads returns classification and counts
- [ ] API: getMinorHeads returns parent Major Head info
- [ ] API: getGroupings returns full hierarchy
- [ ] API: addMajorHead validates statementType and category
- [ ] API: addMinorHead requires and validates majorHeadId
- [ ] API: addGrouping requires and validates minorHeadId
- [ ] UI: Cascading dropdowns filter correctly
- [ ] UI: Inline creation workflow works for missing parents
- [ ] Upload: Trial Balance respects hierarchy on creation
- [ ] Delete: Cascade deletes work correctly with warnings

## Benefits

1. **Data Integrity:** Ensures every Grouping/Minor Head/Major Head follows proper hierarchy
2. **Schedule III Compliance:** Matches VBA structure exactly
3. **Reporting Accuracy:** Financial statements can traverse hierarchy correctly
4. **User Guidance:** Cascading dropdowns prevent orphaned entries
5. **Standard Lists:** Pre-populated with all Schedule III standard entries
6. **Flexibility:** Users can still add custom entries while maintaining hierarchy

## Migration Path for Existing Data

If database already has orphaned entries:

```sql
-- Find orphaned Minor Heads (no Major Head link)
SELECT * FROM "MinorHead" WHERE "majorHeadId" IS NULL;

-- Find orphaned Groupings (no Minor Head link)
SELECT * FROM "Grouping" WHERE "minorHeadId" IS NULL;
```

**Resolution Options:**
1. Run seed script to populate standard lists
2. Manually map orphaned entries to standard parents
3. Delete orphaned entries if no longer needed

## Support

For issues or questions:
1. Check error messages - they now include helpful context
2. Review validation logic in procedure files
3. Verify parent entities exist before creating children
4. Use GET procedures to inspect full hierarchy

## Future Enhancements

1. **SQLite Migration:** Once hierarchy is stable, document migration from PostgreSQL to SQLite for truly standalone operation
2. **Bulk Import:** Add procedure to bulk import hierarchical master lists from Excel
3. **Hierarchy Validation Report:** Generate report showing any data integrity issues
4. **Auto-mapping:** Machine learning to suggest parent mappings for new entries
