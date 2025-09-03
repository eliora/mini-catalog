# Supabase Migration Guide

This guide will help you migrate from SQLite to Supabase for your Mini Catalog application.

## Prerequisites

1. **Create a Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project** in your Supabase dashboard

## Step 1: Set up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql` into the SQL Editor
4. Click **Run** to create the tables and policies

## Step 2: Get your Supabase credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Public anon key** (starts with `eyJ...`)
   - **Service role key** (starts with `eyJ...`) - **Keep this secret!**

## Step 3: Configure environment variables

Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=qprffo

# Server Configuration
PORT=5000
```

Replace the placeholder values with your actual Supabase credentials.

## Step 4: Migrate existing data (Optional)

If you have existing data in SQLite that you want to migrate:

```bash
npm run migrate:supabase
```

This script will:
- Create a backup of your SQLite database
- Export all products and orders from SQLite
- Import them into your Supabase database

## Step 5: Switch to Supabase

### Option A: Replace existing server (Recommended)
```bash
# Backup your current server
cp server.js server-sqlite.js

# Replace with Supabase version
cp server-supabase.js server.js

# Start the application
npm run dev
```

### Option B: Run parallel (For testing)
```bash
# Run with Supabase on a different port
npm run dev:supabase
```

## Step 6: Test the migration

1. Start your application
2. Test the following features:
   - ✅ Product catalog loading
   - ✅ Product filtering and search
   - ✅ Adding products to cart
   - ✅ Creating orders
   - ✅ Admin login
   - ✅ Admin product management
   - ✅ Admin order management
   - ✅ CSV import/export

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure your `.env` file is in the project root
   - Check that all required variables are set
   - Restart your server after adding environment variables

2. **"Invalid API key"**
   - Verify you're using the correct anon key for frontend
   - Verify you're using the service role key for backend operations

3. **"Permission denied" errors**
   - Check that Row Level Security policies are set up correctly
   - Ensure the service role key has the necessary permissions

4. **JSON parsing errors**
   - The migration script handles converting SQLite JSON strings to Supabase JSONB
   - If you see parsing errors, check your data format

### Performance Considerations

Supabase offers several advantages over SQLite:
- **Scalability**: Handles multiple concurrent users
- **Real-time updates**: Built-in real-time subscriptions
- **Built-in API**: RESTful API with automatic documentation
- **Security**: Row Level Security and built-in authentication
- **Backups**: Automatic daily backups

### Rolling Back

If you need to roll back to SQLite:

```bash
# Restore original server
cp server-sqlite.js server.js

# Start with SQLite
npm run dev
```

Your SQLite database backup will be available as `catalog-backup-[timestamp].db`.

## Next Steps

After successful migration, consider:
1. Setting up automatic backups in Supabase
2. Configuring email notifications for orders
3. Adding real-time features using Supabase subscriptions
4. Implementing user authentication for customers
5. Setting up production environment variables

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables
3. Test your database connection using the Supabase SQL Editor
4. Check the browser console for frontend errors
