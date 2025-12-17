# Script to delete the DmsDemoDb database
$connectionString = "Server=(localdb)\MSSQLLocalDB;Database=master;Trusted_Connection=True;"
$sql = @"
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'DmsDemoDb')
BEGIN
    ALTER DATABASE [DmsDemoDb] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [DmsDemoDb];
    PRINT 'Database DmsDemoDb deleted successfully';
END
ELSE
BEGIN
    PRINT 'Database DmsDemoDb does not exist';
END
"@

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $command = $connection.CreateCommand()
    $command.CommandText = $sql
    $command.ExecuteNonQuery()
    $connection.Close()
    Write-Host "Database deletion completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error deleting database: $_" -ForegroundColor Red
}

