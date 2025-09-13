# Environment File Protection Script
Write-Host "Environment File Protection" -ForegroundColor Green

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    $lines = $envContent -split "`n"
    
    $validUrl = $lines | Where-Object { $_ -match "^REACT_APP_SUPABASE_URL=https://.*\.supabase\.co$" }
    $validKey = $lines | Where-Object { $_ -match "^REACT_APP_SUPABASE_ANON_KEY=eyJ.*" }
    
    if ($validUrl -and $validKey) {
        Write-Host " .env file is valid" -ForegroundColor Green
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item ".env" ".env.backup.$timestamp"
        Write-Host "Backup created: .env.backup.$timestamp" -ForegroundColor Blue
    } else {
        Write-Host " .env file is corrupted!" -ForegroundColor Red
        if (Test-Path ".env.backup") {
            Copy-Item ".env.backup" ".env" -Force
            Write-Host " .env restored from backup" -ForegroundColor Green
        }
    }
} else {
    Write-Host " .env file not found!" -ForegroundColor Red
    if (Test-Path ".env.backup") {
        Copy-Item ".env.backup" ".env"
        Write-Host " .env restored from backup" -ForegroundColor Green
    }
}
