[CmdletBinding()]
param(
    [string]$PostgresHost = '127.0.0.1',
    [int]$PostgresPort = 5432,
    [string]$PostgresAdmin = 'postgres',
    [string]$DatabaseName = 'skin_intelligence',
    [string]$AppUser = 'postgres',
    [string]$AppPassword = 'root',
    [string]$PostgresPassword = 'root',
    [switch]$SkipMigrations
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$migrationDirectory = Join-Path $root 'mig'

function Resolve-Psql {
    $command = Get-Command psql.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }

    $candidates = Get-ChildItem 'C:\Program Files\PostgreSQL' -Filter psql.exe -Recurse -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending
    if ($candidates) { return $candidates[0].FullName }
    throw 'psql.exe was not found. Install PostgreSQL or add its bin folder to PATH.'
}

function Invoke-Psql {
    param(
        [string]$Database,
        [string]$Sql,
        [string]$File
    )

    $arguments = @('-h', $PostgresHost, '-p', $PostgresPort, '-U', $PostgresAdmin, '-d', $Database, '-v', 'ON_ERROR_STOP=1')
    if ($Sql) { $arguments += @('-c', $Sql) }
    if ($File) { $arguments += @('-f', $File) }
    & $psql @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL command failed for database '$Database'."
    }
}

if (-not (Test-Path $migrationDirectory)) {
    throw "Migration folder not found: $migrationDirectory"
}

$psql = Resolve-Psql
$usingDefaultCredentials = ($PostgresAdmin -eq 'postgres' -and $PostgresPassword -eq 'root' -and $AppUser -eq 'postgres' -and $AppPassword -eq 'root')
if ($usingDefaultCredentials) {
    Write-Warning "Using the application's existing PostgreSQL credentials (postgres/root). Change them for production."
}
if (-not $PostgresPassword) {
    $securePassword = Read-Host "PostgreSQL password for '$PostgresAdmin'" -AsSecureString
    $PostgresPassword = [System.Net.NetworkCredential]::new('', $securePassword).Password
}
if (-not $AppPassword) {
    $AppPassword = Read-Host "Password for application database user '$AppUser'" -AsSecureString |
        ForEach-Object { [System.Net.NetworkCredential]::new('', $_).Password }
}
if (-not $AppPassword) { throw 'Application database password cannot be empty.' }

$env:PGPASSWORD = $PostgresPassword
try {
    Write-Host "Creating database '$DatabaseName' if it does not exist..."
    $exists = & $psql -h $PostgresHost -p $PostgresPort -U $PostgresAdmin -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DatabaseName';"
    if ($LASTEXITCODE -ne 0) { throw 'Unable to connect to the PostgreSQL maintenance database.' }
    if ($exists.Trim() -ne '1') {
        Invoke-Psql -Database 'postgres' -Sql "CREATE DATABASE `"$DatabaseName`";"
    }

    $safeAppPassword = $AppPassword.Replace("'", "''")
    $roleSql = @"
DO `$`$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$AppUser') THEN
        CREATE ROLE "$AppUser" LOGIN PASSWORD '$safeAppPassword';
    ELSE
        ALTER ROLE "$AppUser" LOGIN PASSWORD '$safeAppPassword';
    END IF;
END
`$`$;
GRANT CONNECT ON DATABASE "$DatabaseName" TO "$AppUser";
"@
    Invoke-Psql -Database 'postgres' -Sql $roleSql

    if (-not $SkipMigrations) {
        $files = Get-ChildItem $migrationDirectory -Filter '*.sql' | Sort-Object Name
        foreach ($file in $files) {
            Write-Host "Applying $($file.Name)..."
            Invoke-Psql -Database $DatabaseName -File $file.FullName
        }
    }

    $grantSql = @"
GRANT USAGE, CREATE ON SCHEMA public TO "$AppUser";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "$AppUser";
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO "$AppUser";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "$AppUser";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO "$AppUser";
"@
    Invoke-Psql -Database $DatabaseName -Sql $grantSql

    Write-Host 'Verifying database...'
    Invoke-Psql -Database $DatabaseName -Sql 'SELECT current_database(), current_user; SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = ''public'';'
    Write-Host "Database setup completed: $DatabaseName"
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
