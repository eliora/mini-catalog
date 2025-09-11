# 🔐 Pricing Security Migration Guide

**Project**: `eliora/mini-catalog`  
**Purpose**: Implement role-based pricing access with verified member system  
**Date**: September 11, 2025

## 📋 **Migration Overview**

This migration separates pricing data from the public `products` table into a secure `prices` table, implementing role-based access control where only verified members and admins can view pricing information.

## 🎯 **Business Goals**

- **Hide pricing** from anonymous (non-logged-in) users
- **Show pricing** only to verified members and administrators
- **Maintain catalog functionality** for product browsing without pricing
- **Enable future pricing tiers** (wholesale, retail, member discounts)

## 📁 **Migration Files**

Execute these SQL files **in order** via Supabase SQL Editor:

1. `001-create-verified-members-role.sql` - Create the verified_members role
2. `002-create-prices-table.sql` - Create the prices table with foreign keys
3. `003-migrate-pricing-data.sql` - Move existing pricing data safely
4. `004-create-prices-rls-policies.sql` - Set up Row Level Security policies
5. `005-remove-unit-price-column.sql` - Remove pricing from products table

## ⚠️ **CRITICAL: Pre-Migration Checklist**

- [ ] **Backup your database** using Supabase Dashboard
- [ ] **Test in staging environment** first if available
- [ ] **Verify user roles** are properly set up
- [ ] **Check application code** is updated to handle new pricing system
- [ ] **Confirm RLS policies** are correctly configured

## 🚀 **Step-by-Step Execution**

### **Step 1: Create Verified Members Role**
```sql
-- Execute: 001-create-verified-members-role.sql
-- Creates the verified_members PostgreSQL role
-- Grants basic permissions for product viewing
```

### **Step 2: Create Prices Table**
```sql
-- Execute: 002-create-prices-table.sql
-- Creates prices table with product_ref foreign key
-- Sets up indexes and constraints
-- Adds updated_at trigger
```

### **Step 3: Migrate Existing Data**
```sql
-- Execute: 003-migrate-pricing-data.sql
-- Copies all unit_price data from products to prices table
-- Preserves existing pricing information
-- Handles NULL and empty values safely
```

**Verification after Step 3:**
```sql
-- Check migration success
SELECT 
    'products_with_prices' as source,
    COUNT(*) as count 
FROM products 
WHERE unit_price IS NOT NULL

UNION ALL

SELECT 
    'migrated_prices' as source,
    COUNT(*) as count 
FROM prices;

-- Should show matching counts
```

### **Step 4: Create RLS Policies**
```sql
-- Execute: 004-create-prices-rls-policies.sql
-- Enables Row Level Security on prices table
-- Creates policies for admin and verified member access
-- Blocks anonymous access to pricing
```

**Test RLS after Step 4:**
```sql
-- Test anonymous access (should return 0 rows)
SET ROLE anon;
SELECT COUNT(*) FROM prices;

-- Test authenticated access (depends on user role)
SET ROLE authenticated;
SELECT COUNT(*) FROM prices;

-- Reset role
RESET ROLE;
```

### **Step 5: Remove Old Pricing Column**
```sql
-- Execute: 005-remove-unit-price-column.sql
-- DESTRUCTIVE: Removes unit_price from products table
-- Only execute after confirming app works with new system
```

## 👥 **User Role Management**

### **Add user_role Column to Users Table**
```sql
-- Add role column if not exists
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'standard';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_user_role 
ON public.users(user_role);
```

### **Assign User Roles**
```sql
-- Make specific users verified members
UPDATE public.users 
SET user_role = 'verified_member' 
WHERE email IN ('member1@example.com', 'member2@example.com');

-- Make admin users
UPDATE public.users 
SET user_role = 'admin' 
WHERE email IN ('admin@example.com');
```

### **Check User Roles**
```sql
-- View current user roles
SELECT 
    email, 
    user_role, 
    created_at 
FROM public.users 
ORDER BY user_role, email;
```

## 🧪 **Testing the Migration**

### **Test 1: Anonymous User (No Pricing Access)**
```javascript
// Should return empty prices object
const prices = await getPrices(['PROD001', 'PROD002']);
console.log(prices); // {}

const canView = await canViewPrices();
console.log(canView); // false
```

### **Test 2: Verified Member (Has Pricing Access)**
```javascript
// Should return pricing data
const prices = await getPrices(['PROD001', 'PROD002']);
console.log(prices); // { PROD001: { unitPrice: 50, currency: 'ILS' }, ... }

const canView = await canViewPrices();
console.log(canView); // true
```

### **Test 3: Catalog Still Works Without Pricing**
- Browse products as anonymous user
- Verify product information displays correctly
- Confirm "Login to view prices" message appears
- Ensure quantity controls are disabled for anonymous users

## 🔧 **Application Code Changes**

The following files have been updated to support the new pricing system:

- ✅ `src/api/prices.js` - New pricing API
- ✅ `src/hooks/usePricing.js` - Pricing permissions hook
- ✅ `src/api/products.js` - Updated to fetch prices separately
- ✅ `src/components/ProductCard.js` - Role-based pricing display
- ✅ `src/components/ProductListItem.js` - Role-based pricing display

## 📊 **Expected Results**

### **Anonymous Users See:**
- ✅ Product catalog with images and descriptions
- ✅ "Sign in to view prices" message
- ❌ No actual pricing numbers
- ❌ Disabled quantity controls

### **Verified Members See:**
- ✅ Full product catalog
- ✅ All pricing information
- ✅ Functional quantity controls
- ✅ Discount pricing if available

### **Admins See:**
- ✅ Everything verified members see
- ✅ Admin panel access (if implemented)
- ✅ Ability to modify pricing

## 🚨 **Rollback Plan**

If issues occur, rollback in reverse order:

1. **Restore unit_price column:**
```sql
ALTER TABLE public.products ADD COLUMN unit_price NUMERIC(10,2);
UPDATE public.products 
SET unit_price = p.unit_price 
FROM public.prices p 
WHERE products.ref = p.product_ref;
```

2. **Drop prices table:**
```sql
DROP TABLE public.prices CASCADE;
```

3. **Update application code** to use old pricing system

## 📈 **Future Enhancements**

After successful migration, consider:

- **Pricing Tiers**: Implement wholesale/retail pricing
- **Dynamic Discounts**: Member-specific discount percentages  
- **Price History**: Track pricing changes over time
- **Bulk Pricing**: Volume-based pricing rules
- **Currency Support**: Multi-currency pricing
- **Regional Pricing**: Location-based pricing

## ✅ **Success Criteria**

Migration is successful when:

- [ ] Anonymous users cannot see any pricing
- [ ] Verified members can see all pricing
- [ ] Product catalog works for all user types
- [ ] No data loss during migration
- [ ] Application performance is maintained
- [ ] RLS policies are properly enforced

---

**⚠️ Remember**: Always test in a staging environment first and maintain database backups!
