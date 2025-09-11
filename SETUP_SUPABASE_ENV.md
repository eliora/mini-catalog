# 🔧 Quick Supabase Environment Setup

## ⚠️ IMPORTANT: Mock Data Removed
The application now **requires** Supabase configuration to display products. Mock data has been completely removed.

## 🚀 Quick Setup Steps

### 1. Create .env.local file
Create a file named `.env.local` in your project root directory with this content:

```env
# Replace with your actual Supabase credentials
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_key_here
```

### 2. Get Your Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Create account and new project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **Public anon key**

### 3. Restart Development Server
```bash
# Stop current server (Ctrl+C) then:
npm start
```

## ✅ What Happens Now

### ✅ With Supabase Configured:
- ✅ Products load from your database
- ✅ Accordion and card views work perfectly
- ✅ Admin panel can save settings
- ✅ Orders are stored in database

### ❌ Without Supabase:
- ❌ Application shows setup instructions
- ❌ No products displayed
- ❌ Clear error messages guide you to setup

## 🆘 Need Help?
- Check `SUPABASE_SETUP_GUIDE.md` for detailed instructions
- Look at browser console for specific error messages
- Ensure `.env.local` file is in project root (same folder as package.json)
