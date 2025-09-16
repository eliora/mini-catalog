# 📁 Project Structure Overview

## 🚀 Current Structure (After Reorganization)

```
mini-catalog-deployment/                    # Root directory
├── src/                                    # Next.js source code
│   ├── app/                               # App Router pages & layouts
│   │   ├── (admin-dashboard)/             # Admin route group
│   │   ├── api/                           # API routes
│   │   ├── auth/                          # Authentication pages
│   │   └── catalog/                       # Catalog pages
│   ├── components/                        # React components
│   │   ├── admin/                         # Admin panel components
│   │   ├── auth/                          # Auth components
│   │   ├── catalog/                       # Catalog components
│   │   ├── layouts/                       # Layout components
│   │   └── pages-sections/                # Page-specific sections
│   ├── hooks/                             # Custom React hooks
│   ├── lib/                               # Utilities & configurations
│   ├── types/                             # TypeScript type definitions
│   └── utils/                             # Helper functions
├── temp/                                  # Archived/reference files
│   ├── react-ecommerce-mui/              # Original React project
│   ├── temp-packages/                     # External templates
│   │   └── bazaar_pro_template/           # Bazaar Pro template
│   └── tmp-sql/                           # Database scripts archive
├── supabase/                              # Supabase configuration
├── z-tasks/                               # Task management files
├── DATABASE_MIGRATION_TO_SCHEMA.sql       # Database migration script
└── package.json                          # Next.js project dependencies
```

## 🎯 Key Changes Made

### ✅ **Next.js Project (Root Level)**
- **Location**: `/` (root directory)
- **Status**: **Active Development** 🟢
- **Framework**: Next.js 15.5.3 with App Router
- **UI**: Material-UI v7 + Bazaar Pro components
- **Database**: Supabase with TypeScript integration

### 📦 **Original React Project (Archived)**
- **Location**: `/temp/react-ecommerce-mui/`
- **Status**: **Reference Only** 🟡
- **Purpose**: Backup of original implementation
- **Framework**: Create React App + MUI v5

### 🎨 **Bazaar Pro Template (Reference)**
- **Location**: `/temp/temp-packages/bazaar_pro_template/`
- **Status**: **Component Library** 🟡
- **Purpose**: Source for admin dashboard components
- **Usage**: Import components as needed

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run TypeScript checks
npm run type-check

# Generate Supabase types
npm run generate-types

# Lint code
npm run lint
```

## 📊 Database Setup

Run the database migration script to set up your schema:

1. Open your Supabase SQL Editor
2. Copy and paste the contents of `DATABASE_MIGRATION_TO_SCHEMA.sql`
3. Execute the script
4. Verify all tables are created correctly

## 🔗 Important File Mappings

| Component Type | New Location | Old Location |
|----------------|-------------|--------------|
| Admin Components | `/src/components/admin/` | `/temp/react-ecommerce-mui/src/components/admin/` |
| API Routes | `/src/app/api/` | `/temp/react-ecommerce-mui/src/api/` |
| Auth Components | `/src/components/auth/` | `/temp/react-ecommerce-mui/src/components/auth/` |
| Catalog Components | `/src/components/catalog/` | `/temp/react-ecommerce-mui/src/components/catalog/` |
| Hooks | `/src/hooks/` | `/temp/react-ecommerce-mui/src/hooks/` |
| Types | `/src/types/` | New TypeScript definitions |
| Bazaar Components | `/temp/temp-packages/bazaar_pro_template/` | External template |

## 🎨 Admin Panel Integration

The admin panel now uses:
- **Layout**: Bazaar Pro's `VendorDashboardLayout`
- **Components**: Material-UI v7 + Bazaar Pro components
- **Routing**: Next.js App Router with route groups
- **Language**: Hebrew RTL support
- **Authentication**: Supabase Auth with middleware protection

## 📝 Next Steps

1. ✅ Database migration completed
2. 🔄 Continue admin panel feature implementation
3. 🧪 Test all functionality
4. 🚀 Deploy to production

---

*This structure provides a clean separation between active development (root) and reference materials (temp), making it easier to manage the codebase while preserving access to original implementations.*
