USE [CoalitionMembership]
GO

ALTER TABLE [dbo].[Associations]
ADD [BackgroundImage] NVARCHAR(MAX) NULL;
GO

ALTER TABLE [dbo].[Associations]
ADD [PhotoStamp] NVARCHAR(MAX) NULL;
GO
