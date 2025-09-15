# Database Schema Documentation

**Generated from**: Supabase Project `erputcvhxxulxmldikfp` (eliora's Project)  
**Date**: September 11, 2025  
**Connection**: ✅ Successfully connected via Supabase CLI

## 📊 Database Overview

| Table | Rows | Size | Status |
|-------|------|------|--------|
| **products** | 296 | 1024 kB | ✅ Active, populated |
| **settings** | 2 | 32 kB | ✅ Active, configured |
| **users** | 0 | 80 kB | 📝 Empty table |
| **orders** | 0 | 40 kB | 📝 Empty table |

## 🔑 Key Findings

### Products Table (Main Catalog Data)
- **296 products** currently in database
- **UUID primary key** (`id`) + business key (`ref`)
- **Multi-language support**: Hebrew (primary), English, French
- **HTML content** in description fields (rich text)
- **Images currently NULL** - need to be populated
- **Active inventory** with quantities and prices

### Critical Column Names (Different from assumptions!)
```javascript
// ❌ WRONG (old assumptions)
price: 'NUMERIC'
line: 'TEXT'

// ✅ CORRECT (actual database)
unit_price: 'NUMERIC'  // NOT 'price'
product_line: 'TEXT'   // NOT 'line'
```

### Settings Table (Company Configuration)
- **Company**: "Jean Darcel"
- **Currency**: "ILS" (Israeli Shekel ₪)
- **Tax Rate**: 18%
- **Description**: "קטלוג מוצרים" (Product Catalog)

## 🎯 Application Integration Status

### ✅ Working Correctly
- Product listing and display
- Hebrew/English name mapping
- Price display with correct `unit_price` column
- Inventory quantity tracking
- Product categorization

### ⚠️ Needs Attention
- **Image fields are NULL** - main_pic and pics need population
- **Users table empty** - authentication not set up
- **Orders table empty** - no order history yet

## 🔧 Development Notes

### API Keys
- **Project**: `erputcvhxxulxmldikfp`
- **URL**: `https://erputcvhxxulxmldikfp.supabase.co`
- **Anon Key**: Updated in `.env.local` (September 2025)

### Column Mapping Applied
The application correctly maps database columns to display properties:
- `hebrew_name` → Primary product name
- `english_name` → Secondary product name  
- `unit_price` → Price display
- `product_line` → Product series
- `short_description_he` → Quick description
- `description_he` → Full HTML description

## 📁 Files Generated
- `database-schema.js` - Complete schema documentation
- `README.md` - This summary file
- `inspect-db.js` - Database inspection script

## 🚀 Next Steps
1. **Populate image fields** (main_pic, pics) with actual product images
2. **Set up user authentication** if needed
3. **Implement order management** when ready for e-commerce
4. **Regular schema updates** as database evolves

---
*This documentation is generated from live database inspection and should be kept up-to-date as the schema evolves.*
