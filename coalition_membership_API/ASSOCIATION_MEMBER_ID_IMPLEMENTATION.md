# Association-Specific Consecutive Member ID Implementation

## Overview
This implementation adds association-specific consecutive member ID generation to the Coalition Membership system. Each association will now have its own sequence of member IDs that are consecutive within that association.

## Changes Made

### 1. Database Schema Changes

#### GeneralCodes Table
- **Added**: `AssociationId` column (UNIQUEIDENTIFIER, NOT NULL)
- **Added**: Foreign key constraint to `Associations` table
- **Added**: Index on `AssociationId` for performance

#### SQL Scripts Created
- `add_association_id_to_general_codes.sql` - Adds the AssociationId column
- `populate_general_codes_by_association.sql` - Populates GeneralCodes with association-specific entries

### 2. Model Changes

#### GeneralCodes Model (`MembershipInfrustructure/Model/Configuration/GeneralCodes.cs`)
- Added `AssociationId` property
- Added navigation property to `AssociationModel`
- Added proper using statement for `MembershipInfrustructure.Model.Association`

#### GeneralCodeDto (`MembershipImplementation/DTOS/Configuration/GeneralCodeDto.cs`)
- Added `AssociationId` property

### 3. Service Changes

#### IGeneralConfigService Interface
- Added `GenerateConsecutiveMemberId` method signature

#### GeneralConfigService Implementation
- **New Method**: `GenerateConsecutiveMemberId(GeneralCodeType, string memberType, Guid associationId)`
  - Generates consecutive member IDs based on association
  - Uses the association-specific GeneralCodes entry
  - Increments CurrentNumber for consecutive generation
  - Pads numbers with leading zeros

#### MemberService Updates
- Updated member ID generation to use `GenerateConsecutiveMemberId`
- Gets `AssociationId` from `MembershipType.AssociationId` (not from Member)
- Falls back to random generation if no association-specific GeneralCodes found

### 4. Migration
- Created migration: `AddAssociationIdToGeneralCodes`
- Run with: `dotnet ef migrations add AddAssociationIdToGeneralCodes`

## How It Works

### Member ID Generation Flow
1. When a member is created, the system gets the `MembershipType`
2. From `MembershipType`, it gets the `AssociationId`
3. It looks up the `GeneralCodes` entry for that specific association
4. It increments the `CurrentNumber` and generates a consecutive ID
5. Format: `{InitialName}-{MemberTypeShortCode}-{ConsecutiveNumber}`

### Example Member IDs
- Association A: `EPLFFC-STD-000001`, `EPLFFC-STD-000002`, etc.
- Association B: `EPLFFC-PRE-000001`, `EPLFFC-PRE-000002`, etc.

## Database Setup

### 1. Run Migration
```bash
dotnet ef database update --project MembershipInfrustructure --startup-project MembershipAPI
```

### 2. Populate GeneralCodes
Run the SQL script `populate_general_codes_by_association.sql` to create association-specific entries.

### 3. Verify Setup
Check that each association has its own GeneralCodes entry:
```sql
SELECT 
    gc.InitialName,
    gc.CurrentNumber,
    a.Name as AssociationName
FROM GeneralCodes gc
JOIN Associations a ON gc.AssociationId = a.Id
WHERE gc.GeneralCodeType = 0;
```

## Benefits

1. **Consecutive IDs**: Each association has its own consecutive sequence
2. **Association Isolation**: Member IDs are unique per association
3. **Scalable**: Easy to add new associations
4. **Backward Compatible**: Falls back to random generation if needed
5. **Traceable**: Easy to identify which association a member belongs to

## Testing

1. Create members for different associations
2. Verify that each association gets consecutive IDs starting from 1
3. Verify that different associations have independent sequences
4. Test fallback behavior when no association-specific GeneralCodes exist
