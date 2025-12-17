-- Run this query in Visual Studio SQL Server Object Explorer
-- to verify emails are in the database

SELECT 
    Id,
    Username,
    Email,
    Role,
    CreatedAt
FROM Users
ORDER BY Id;

-- Expected results: All users should have email addresses
-- dr.smith@clinic.com, dr.johnson@clinic.com, etc.
