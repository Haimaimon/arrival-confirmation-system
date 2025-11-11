@echo off
echo 🔧 Initializing Database...
echo.

REM Set PostgreSQL bin path (adjust if needed)
set PGBIN="C:\Program Files\PostgreSQL\16\bin"
set PATH=%PGBIN%;%PATH%

echo 📊 Creating database...
psql -U postgres -c "CREATE DATABASE arrival_confirmation;" 2>nul

echo 📋 Creating schema...
psql -U postgres -d arrival_confirmation -f src/infrastructure/database/schema.sql

echo 🌱 Seeding data...
psql -U postgres -d arrival_confirmation -f src/infrastructure/database/seed.sql

echo.
echo ✅ Database initialized successfully!
pause

