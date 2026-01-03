-- Add AssociationId column to GeneralCodes table
ALTER TABLE [CoalitionMembership].[dbo].[GeneralCodes]
ADD [AssociationId] UNIQUEIDENTIFIER NULL;

-- Add foreign key constraint to Association table
ALTER TABLE [CoalitionMembership].[dbo].[GeneralCodes]
ADD CONSTRAINT FK_GeneralCodes_AssociationId 
FOREIGN KEY ([AssociationId]) 
REFERENCES [CoalitionMembership].[dbo].[Association]([Id]);

-- Create index for better performance
CREATE INDEX IX_GeneralCodes_AssociationId 
ON [CoalitionMembership].[dbo].[GeneralCodes] ([AssociationId]);

-- Update existing records to have a default association (if needed)
-- You may need to adjust this based on your existing data
UPDATE [CoalitionMembership].[dbo].[GeneralCodes] 
SET [AssociationId] = (SELECT TOP 1 [Id] FROM [CoalitionMembership].[dbo].[Association] WHERE [RowStatus] = 1)
WHERE [AssociationId] IS NULL;

-- Make AssociationId NOT NULL after updating existing records
ALTER TABLE [CoalitionMembership].[dbo].[GeneralCodes]
ALTER COLUMN [AssociationId] UNIQUEIDENTIFIER NOT NULL;
