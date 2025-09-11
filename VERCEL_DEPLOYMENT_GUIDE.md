# Vercel Deployment Guide - Mini Catalog

## Quick Fix for Blank Page

### Most Common Cause: Missing Environment Variables

1. **Go to Vercel Dashboard:**
   - Open your project in Vercel
   - Navigate to "Settings" → "Environment Variables"

2. **Add Required Variables:**
   ```
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"

### Other Potential Issues:

#### Build Configuration
- ✅ `vercel.json` added for SPA routing
- ✅ Build process tested locally
- ✅ Error boundaries implemented

#### Environment Variables to Set in Vercel:
```bash
# Required for Supabase
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Node environment
NODE_ENV=production
```

#### Debugging Steps:

1. **Check Build Logs:**
   - In Vercel dashboard → Deployments → View Function Logs
   - Look for any build errors

2. **Check Browser Console:**
   - Open deployed site
   - F12 → Console tab
   - Look for JavaScript errors

3. **Test Environment Variables:**
   - The app will log missing env vars to console
   - Check for warnings about Supabase configuration

4. **Common Error Messages:**
   - `Supabase client not configured` → Missing env vars
   - `Cannot read properties of undefined` → Component loading issues
   - Blank white page → Usually env vars or routing issues

#### Files Added/Modified for Vercel:

1. **`vercel.json`** - SPA routing configuration
2. **`src/components/ErrorBoundary.js`** - Catches React errors
3. **`src/App.js`** - Added error boundary and safer imports
4. **`src/config/supabase.js`** - Better env var handling

#### Manual Testing:

```bash
# Test build locally
npm run build

# Serve production build
npx serve -s build

# Check for errors in console
```

#### Supabase Setup Checklist:

- [ ] Project created in Supabase
- [ ] Database schema deployed (run SQL scripts)
- [ ] RLS policies configured
- [ ] API keys copied to Vercel
- [ ] Public URL accessible

#### Contact Information:
If the above doesn't resolve the issue, check:
1. Supabase dashboard for service status
2. Vercel function logs for detailed errors
3. Browser network tab for failed requests

---

**Note:** The application now includes error boundaries and fallback handling for missing environment variables, so it should display helpful error messages instead of a blank page.
