# Emergency Environment File Restore Script
# Use this if .env gets corrupted again

Write-Host "🚨 Emergency .env Restore" -ForegroundColor Yellow

# Correct Supabase credentials (keep these secure!)
$envContent = @"
REACT_APP_SUPABASE_URL=https://erputcvhxxulxmldikfp.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycHV0Y3ZoeHh1bHhtbGRpa2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4ODEzODgsImV4cCI6MjA3MjQ1NzM4OH0.ygSVDr1KTMQGHFG-vlFMgBmY94zrdM0UWNCWYTDApkA
"@

try {
    # Remove corrupted file if it exists
    if (Test-Path ".env") {
        Remove-Item ".env" -Force
        Write-Host "🗑️ Removed corrupted .env file" -ForegroundColor Red
    }
    
    # Create clean .env file with proper encoding
    [System.IO.File]::WriteAllText("$(Get-Location)\.env", $envContent, [System.Text.Encoding]::ASCII)
    
    Write-Host "✅ .env file restored successfully!" -ForegroundColor Green
    Write-Host "🔄 Please restart your dev server (npm start)" -ForegroundColor Blue
    
    # Verify the restoration
    $restored = Get-Content ".env"
    Write-Host "📋 Restored content:" -ForegroundColor Gray
    $restored | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    
} catch {
    Write-Host "❌ Failed to restore .env file: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📝 Manual steps:" -ForegroundColor Yellow
    Write-Host "   1. Create .env file manually" -ForegroundColor White
    Write-Host "   2. Add the two lines shown above" -ForegroundColor White
    Write-Host "   3. Save with UTF-8 encoding" -ForegroundColor White
}
