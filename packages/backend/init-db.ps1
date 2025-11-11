# PowerShell script to initialize the database

Write-Host "Initializing Database..." -ForegroundColor Cyan
Write-Host ""

# Get PostgreSQL path
$pgPath = "C:\Program Files\PostgreSQL\16\bin"
if (-not (Test-Path $pgPath)) {
    $pgPath = "C:\Program Files\PostgreSQL\15\bin"
}
if (-not (Test-Path $pgPath)) {
    Write-Host "ERROR: PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    exit 1
}

$env:Path = "$pgPath;$env:Path"

# Create database
Write-Host "Creating database..." -ForegroundColor Yellow
& "$pgPath\psql.exe" -U postgres -c "CREATE DATABASE arrival_confirmation;" 2>$null

# Create schema
Write-Host "Creating schema..." -ForegroundColor Yellow
& "$pgPath\psql.exe" -U postgres -d arrival_confirmation -f "src/infrastructure/database/schema.sql"

# Seed data
Write-Host "Seeding data..." -ForegroundColor Yellow
& "$pgPath\psql.exe" -U postgres -d arrival_confirmation -f "src/infrastructure/database/seed.sql"

Write-Host ""
Write-Host "Database initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

