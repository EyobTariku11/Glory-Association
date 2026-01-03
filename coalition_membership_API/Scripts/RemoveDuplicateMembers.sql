-- SQL Script to Remove Duplicate Members from Database
-- This script identifies and removes duplicate members based on PhoneNumber and FullName
-- It keeps the most recent member (by CreatedDate) and transfers payments to that member
--
-- WARNING: Backup your database before running this script!
-- Run this script during maintenance window as it may take time on large databases

BEGIN TRANSACTION;

-- Step 1: Identify duplicates (for review)
SELECT 
    LOWER(LTRIM(RTRIM(PhoneNumber))) AS NormalizedPhone,
    LOWER(LTRIM(RTRIM(FullName))) AS NormalizedName,
    COUNT(*) AS DuplicateCount,
    STRING_AGG(CAST(Id AS VARCHAR(36)), ', ') AS MemberIds,
    STRING_AGG(CAST(CreatedDate AS VARCHAR(50)), ', ') AS CreatedDates
FROM Members
WHERE RowStatus = 0  -- Assuming 0 = Active
GROUP BY LOWER(LTRIM(RTRIM(PhoneNumber))), LOWER(LTRIM(RTRIM(FullName)))
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- Step 2: Create a temporary table to store members to keep (most recent by CreatedDate)
CREATE TABLE #MembersToKeep (
    PhoneNumber NVARCHAR(450),
    FullName NVARCHAR(MAX),
    MemberIdToKeep UNIQUEIDENTIFIER
);

INSERT INTO #MembersToKeep (PhoneNumber, FullName, MemberIdToKeep)
SELECT 
    LOWER(LTRIM(RTRIM(m1.PhoneNumber))),
    LOWER(LTRIM(RTRIM(m1.FullName))),
    m1.Id
FROM Members m1
INNER JOIN (
    SELECT 
        LOWER(LTRIM(RTRIM(PhoneNumber))) AS PhoneNumber,
        LOWER(LTRIM(RTRIM(FullName))) AS FullName,
        MAX(CreatedDate) AS MaxCreatedDate
    FROM Members
    WHERE RowStatus = 0
    GROUP BY LOWER(LTRIM(RTRIM(PhoneNumber))), LOWER(LTRIM(RTRIM(FullName)))
    HAVING COUNT(*) > 1
) duplicates ON LOWER(LTRIM(RTRIM(m1.PhoneNumber))) = duplicates.PhoneNumber
            AND LOWER(LTRIM(RTRIM(m1.FullName))) = duplicates.FullName
WHERE m1.CreatedDate = duplicates.MaxCreatedDate
  AND m1.RowStatus = 0;

-- Step 3: Transfer payments from duplicate members to the kept members
UPDATE mp
SET mp.MemberId = mtk.MemberIdToKeep
FROM MemberPayments mp
INNER JOIN Members m ON mp.MemberId = m.Id
INNER JOIN #MembersToKeep mtk ON LOWER(LTRIM(RTRIM(m.PhoneNumber))) = mtk.PhoneNumber
                              AND LOWER(LTRIM(RTRIM(m.FullName))) = mtk.FullName
WHERE m.Id != mtk.MemberIdToKeep
  AND m.RowStatus = 0;

-- Step 4: Delete payments that couldn't be transferred (shouldn't happen, but safety check)
DELETE mp
FROM MemberPayments mp
INNER JOIN Members m ON mp.MemberId = m.Id
INNER JOIN #MembersToKeep mtk ON LOWER(LTRIM(RTRIM(m.PhoneNumber))) = mtk.PhoneNumber
                              AND LOWER(LTRIM(RTRIM(m.FullName))) = mtk.FullName
WHERE m.Id != mtk.MemberIdToKeep
  AND m.RowStatus = 0;

-- Step 5: Delete duplicate members (keeping only the most recent one)
DELETE m
FROM Members m
INNER JOIN #MembersToKeep mtk ON LOWER(LTRIM(RTRIM(m.PhoneNumber))) = mtk.PhoneNumber
                              AND LOWER(LTRIM(RTRIM(m.FullName))) = mtk.FullName
WHERE m.Id != mtk.MemberIdToKeep
  AND m.RowStatus = 0;

-- Step 6: Clean up temporary table
DROP TABLE #MembersToKeep;

-- Step 7: Verify no duplicates remain
SELECT 
    LOWER(LTRIM(RTRIM(PhoneNumber))) AS NormalizedPhone,
    LOWER(LTRIM(RTRIM(FullName))) AS NormalizedName,
    COUNT(*) AS RemainingCount
FROM Members
WHERE RowStatus = 0
GROUP BY LOWER(LTRIM(RTRIM(PhoneNumber))), LOWER(LTRIM(RTRIM(FullName)))
HAVING COUNT(*) > 1;

-- If the above query returns no rows, all duplicates have been removed successfully

-- COMMIT TRANSACTION;  -- Uncomment this line to commit the changes
-- ROLLBACK TRANSACTION;  -- Uncomment this line to rollback if something went wrong

-- Note: Review the results before committing!
-- Replace COMMIT/ROLLBACK with the appropriate action based on your review

