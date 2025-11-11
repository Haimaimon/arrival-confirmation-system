# PowerShell script to run database migration
# Makes the phone field optional in guests table

Write-Host "Running database migration: Make phone optional" -ForegroundColor Cyan
Write-Host ""

$dbName = "arrival_confirmation"
$migrationFile = "migrations\002_make_phone_optional.sql"

# Check if migration file exists
if (-not (Test-Path $migrationFile)) {
    Write-Host "Error: Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Migration file: $migrationFile" -ForegroundColor Yellow
Write-Host "Database: $dbName" -ForegroundColor Yellow
Write-Host ""

# Try to find psql.exe
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe"
)

$psqlExe = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlExe = $path
        break
    }
}

if ($null -eq $psqlExe) {
    Write-Host "Error: PostgreSQL psql.exe not found" -ForegroundColor Red
    Write-Host "Please install PostgreSQL or update the paths in this script" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found psql: $psqlExe" -ForegroundColor Green
Write-Host ""
Write-Host "Running migration..." -ForegroundColor Cyan

# Run the migration
& $psqlExe -U postgres -d $dbName -f $migrationFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Migration completed successfully! ✅" -ForegroundColor Green
    Write-Host ""
    Write-Host "Phone field is now optional in the guests table." -ForegroundColor Green
    Write-Host "You can now import guests without phone numbers." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Migration failed! ❌" -ForegroundColor Red
    Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
}

