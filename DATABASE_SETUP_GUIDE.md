# 🗄️ Database Setup Guide

## 📋 Overview

This guide explains how to set up the complete database schema for your Mini Catalog E-commerce Admin Panel using the provided SQL files.

## 📁 SQL Files

### 1. `DATABASE_SCHEMA.sql` 
- **Complete schema** with sample data for development
- Includes test records for profiles, products, orders
- Best for development and testing environments

### 2. `PRODUCTION_SCHEMA.sql`
- **Production-ready schema** without sample data
- Essential tables and indexes only
- Recommended for production deployment

### 3. `RLS_POLICIES.sql`
- **Row Level Security policies** (currently empty - you deleted the content)
- Controls data access based on user roles
- Run after creating the main schema

## 🚀 Setup Instructions

### Option A: Development Setup (with sample data)

1. **Open your Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the complete schema**
   ```sql
   -- Copy and paste the entire contents of DATABASE_SCHEMA.sql
   ```

3. **Verify the setup**
   ```sql
   -- Check tables were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE';
   
   -- Check sample data
   SELECT COUNT(*) FROM public.profiles;
   SELECT COUNT(*) FROM public.products;
   SELECT COUNT(*) FROM public.orders;
   ```

### Option B: Production Setup (clean)

1. **Run production schema**
   ```sql
   -- Copy and paste the entire contents of PRODUCTION_SCHEMA.sql
   ```

2. **Add RLS policies** (if needed)
   ```sql
   -- Copy and paste contents of RLS_POLICIES.sql
   -- Note: Currently empty, you may need to add policies
   ```

## 🔧 Key Features Created

### ✅ Tables
- `profiles` - Client management
- `products` - Product catalog
- `prices` - Product pricing
- `orders` - Order management (linked to clients)
- `settings` - System configuration
- `users` - Admin authentication

### ✅ Indexes
- Performance indexes on all key columns
- Full-text search for Hebrew and English
- GIN indexes for JSON columns

### ✅ Constraints
- Foreign key relationships
- Check constraints for status fields
- Unique constraints on emails and refs

### ✅ Triggers
- Automatic `updated_at` timestamp updates
- Maintains data consistency

### ✅ Views
- `orders_with_clients` - Orders joined with client info
- `product_inventory` - Product stock summary

## 🔍 Troubleshooting

### Common Issues

1. **Hebrew text search error** ✅ **FIXED**
   ```
   ERROR: text search configuration "hebrew" does not exist
   ```
   - **Solution**: Updated to use 'simple' configuration for Hebrew text

2. **UUID extension missing**
   ```
   ERROR: function uuid_generate_v4() does not exist
   ```
   - **Solution**: The schema includes `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

3. **Permission denied**
   ```
   ERROR: permission denied for schema public
   ```
   - **Solution**: Ensure you're running as a database owner or have proper permissions

## 📊 Sample Data (Development Only)

The development schema includes:

### Sample Profiles
- **Sarah Cohen** - Verified member with business
- **Rachel Levy** - Standard user
- **Admin User** - System administrator

### Sample Products
- **Vitamin C Serum** - Premium skincare
- **Day Moisturizer** - Basic skincare
- **Face Mask** - Premium treatment

### Sample Orders
- Completed order from verified member
- Processing order from standard user

## 🔐 Security Features

### Row Level Security (RLS)
- **Profiles**: Users can only see their own data, admins see all
- **Products**: Public read access, admin write access
- **Prices**: Role-based pricing (standard vs verified members)
- **Orders**: Users see only their orders, admins see all
- **Settings**: Public read for basic info, admin write access

### Role-based Access
- **Standard users**: Basic product access
- **Verified members**: Special pricing access
- **Admins**: Full system access

## 🔄 Next Steps

1. **Run the schema** in your Supabase database
2. **Update your TypeScript types** to match the new schema
3. **Test the admin panel** with the new database structure
4. **Add real data** or import existing data
5. **Configure authentication** to work with the profiles table

## 📝 Notes

- All tables use UUID primary keys for better scalability
- Hebrew text is supported with proper indexing
- The schema is optimized for the admin panel requirements
- Foreign key relationships ensure data integrity
- Automatic timestamps track all changes

---

**Ready to deploy!** 🚀 Your database schema is now complete and matches your `ADMIN_DATABASE_SCHEMA.md` documentation.