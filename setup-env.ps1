# Quick Environment Setup Script
# Run this after Git operations to restore your .env.local file

Write-Host "🔧 Setting up environment file..." -ForegroundColor Cyan

if (Test-Path ".env.local") {
    Write-Host "✅ .env.local already exists!" -ForegroundColor Green
    exit 0
}

if (Test-Path ".env.template") {
    Copy-Item ".env.template" ".env.local"
    Write-Host "✅ Created .env.local from template" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env.local and add your actual Supabase anon key!" -ForegroundColor Yellow
    Write-Host "   Get it from: https://supabase.com/dashboard → Settings → API" -ForegroundColor Gray
} else {
    Write-Host "❌ .env.template not found. Creating basic template..." -ForegroundColor Red
    @"
REACT_APP_SUPABASE_URL=https://erpufcvhxxulxmldikfp.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Created basic .env.local" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env.local and add your actual Supabase anon key!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Next steps:"
Write-Host "1. Edit .env.local with your real Supabase anon key"
Write-Host "2. Run: npm start"
Write-Host ""
