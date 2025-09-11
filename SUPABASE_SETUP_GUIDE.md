# 🚀 Supabase Setup Guide

## ❌ Current Issue
You're seeing the error **"שגיאה בשמירת הגדרות החברה"** (Error saving company settings) because Supabase is not configured.

## ✅ Quick Fix

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### Step 2: Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefg.supabase.co`)
   - **Public anon key** (starts with `eyJ...`)

### Step 3: Configure Environment Variables
1. Copy the `.env.example` file to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values:
   ```env
   REACT_APP_SUPABASE_URL=https://your-actual-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

### Step 4: Create Database Tables
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `company-settings-setup.sql`
3. Paste it into the SQL Editor and click **Run**

### Step 5: Restart Your Application
```bash
npm start
```

## 🔧 Alternative: Use Without Supabase
If you don't want to set up Supabase right now, the app will use default company settings and show a warning message. The catalog will still work, but you won't be able to save custom company information.

## ✅ Verification
After setup, you should be able to:
- ✅ Edit company settings in the Admin panel
- ✅ Save settings without errors
- ✅ See your custom company name in the catalog header
- ✅ Use custom company info in printed orders

## 🆘 Need Help?
If you're still seeing errors after following these steps:
1. Check the browser console for detailed error messages
2. Verify your `.env.local` file has the correct values
3. Make sure you ran the SQL script in Supabase
4. Restart your development server after changing environment variables
