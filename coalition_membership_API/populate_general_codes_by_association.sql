-- Script to populate GeneralCodes table with association-specific entries
-- This will create separate GeneralCodes entries for each association

-- First, let's see what associations exist
SELECT Id, Name FROM [CoalitionMembership].[dbo].[Associations] WHERE RowStatus = 1;

-- Insert GeneralCodes entries for each association
-- You may need to adjust the InitialName, Pad, and CurrentNumber values based on your requirements

-- Example: Insert for each association (replace with actual association IDs)
INSERT INTO [CoalitionMembership].[dbo].[GeneralCodes] 
(Id, GeneralCodeType, InitialName, Pad, CurrentNumber, AssociationId, CreatedDate, CreatedById, RowStatus)
SELECT 
    NEWID() as Id,
    0 as GeneralCodeType, -- Assuming 0 is for Member ID generation
    'EPLFFC' as InitialName, -- You can customize this per association
    6 as Pad, -- 6-digit padding
    0 as CurrentNumber, -- Start from 0
    Id as AssociationId,
    GETDATE() as CreatedDate,
    'SYSTEM' as CreatedById,
    1 as RowStatus
FROM [CoalitionMembership].[dbo].[Associations] 
WHERE RowStatus = 1;

-- Verify the data was inserted correctly
SELECT 
    gc.Id,
    gc.GeneralCodeType,
    gc.InitialName,
    gc.Pad,
    gc.CurrentNumber,
    gc.AssociationId,
    a.Name as AssociationName
FROM [CoalitionMembership].[dbo].[GeneralCodes] gc
LEFT JOIN [CoalitionMembership].[dbo].[Associations] a ON gc.AssociationId = a.Id
WHERE gc.RowStatus = 1;
