# 🔍 Hard-Coded Values Documentation

## Overview
This document catalogs all hard-coded values found in the codebase, organized by category and location. These values should be considered for migration to configuration files, environment variables, or centralized constants.

## 📊 Summary by Category

| Category | Count | Priority | Notes |
|----------|-------|----------|-------|
| **UI/Layout** | 45+ | High | Drawer widths, heights, spacing |
| **Business Logic** | 30+ | Critical | Stock thresholds, pricing rules |
| **API/Configuration** | 20+ | Medium | Timeouts, retries, endpoints |
| **Colors/Branding** | 15+ | Medium | Color codes, themes |
| **Validation Rules** | 15+ | High | Min/max values, patterns |
| **Status Values** | 10+ | Low | Order/product statuses |
| **Console/Debug** | 50+ | Low | Debug strings |

---

## 🎨 **UI/Layout Constants**

### Drawer & Sidebar Dimensions
```typescript
// Location: src/components/layout/AdminLayout.tsx
const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 64;

// Location: src/components/admin/layout/AdminSidebar.tsx
const DRAWER_WIDTH = 280;

// Location: src/components/layouts/vendor-dashboard/dashboard-sidebar/dashboard-sidebar.tsx
const DRAWER_WIDTH = 280;
const COMPACT_WIDTH = 86;

// Location: src/components/layout/dashboard/DashboardStyles.ts
export const drawerWidth = 280;
```

### Table & Grid Heights
```typescript
// Location: src/components/admin/shared/tables/AdminDataTable.tsx
height = 600

// Location: src/components/admin/shared/AdminDataGrid.tsx
height = 600
```

### Icon Sizes
```typescript
// Location: src/components/catalog/ProductListItem.tsx
size={isUltraSmall ? 51 : 60} // 15% smaller: 60 * 0.85 = 51
```

---

## 💼 **Business Logic Constants**

### Stock Management
```typescript
// Location: src/lib/api/admin/product-service.ts
const lowStockCount = data.filter(p => p.qty > 0 && p.qty <= 10).length;

// Location: src/config/admin-tables/products-config.tsx
if (qty === 0) return 'error.main';
if (qty < 10) return 'warning.main';

// Location: src/components/catalog/ProductListItem.tsx
{(product.qty ?? 0) > 0 && (  // Stock check
{product.qty === 0 && (  // Out of stock display

// Location: src/pages-sections/admin-dashboard/products-management/product-form-dialog.tsx
low_stock_threshold: 10
```

### Pricing Rules
```typescript
// Location: src/pages-sections/admin-dashboard/settings/tax-settings.tsx
freeShippingThreshold: yup.number().min(0)

// Location: src/context/CompanyContext.tsx
free_shipping_threshold: 0

// Location: src/pages-sections/admin-dashboard/orders-management/order-revival-dialog.tsx
price: 0  // Default price
```

### Order Status Values
```typescript
// Location: src/config/admin-tables/orders-config.tsx
status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'primary',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'error'
}

const statusLabels = {
  pending: 'ממתין',
  confirmed: 'אושר',
  processing: 'מעובד',
  shipped: 'נשלח',
  delivered: 'נמסר',
  cancelled: 'בוטל'
}
```

---

## ⚙️ **API/Configuration Constants**

### Pagination Defaults
```typescript
// Location: src/components/admin/shared/tables/AdminDataTable.tsx
pageSize = 20

// Location: src/lib/api/admin/product-service.ts
limit = 20  // Default 20 rows per page

// Location: src/hooks/useClientManagement.ts
limit = 20

// Location: src/hooks/useAdminResource.ts
limit = 20  // Default 20 rows per page
```

### HTTP Status Codes
```typescript
// Location: src/hooks/useAdminResource.ts
if (response.status === 401) {
if (response.status === 403) {

// Location: src/lib/api/base.ts
return this.errorResponse(adminResult.error!, 403);
```

### Timeouts & Retries
```typescript
// Location: src/lib/api/database.ts
const { maxRetries = 2, retryDelay = 1000, timeout = 8000 } = config;

// Location: src/pages-sections/admin-dashboard/settings/system-settings.tsx
sessionTimeout: yup.number().min(300).max(86400)

// Location: src/context/CompanyContext.tsx
session_timeout: 3600
max_login_attempts: 5
```

---

## 🎨 **Colors & Branding**

### Theme Colors
```typescript
// Location: src/context/CompanyContext.tsx
primary_color: '#1976d2'
secondary_color: '#dc004e'

// Location: src/app/api/settings/route.ts
primary_color: '#1976d2'
secondary_color: '#dc004e'

// Location: src/components/layout/dashboard/DashboardStyles.ts
background: '#F8F9FA'
surface: '#FFFFFF'
primary: '#4E97FD'
secondary: '#2B3445'
```

### Status Colors
```typescript
// Location: src/components/layout/header/MainToolbar.tsx
color: '#333'
borderColor: '#ccc'
borderColor: '#999'
borderColor: '#333'
```

---

## ✅ **Validation Rules**

### Numeric Constraints
```typescript
// Location: src/pages-sections/admin-dashboard/settings/tax-settings.tsx
taxRate: yup.number().min(0).max(100)
freeShippingThreshold: yup.number().min(0)

// Location: src/pages-sections/admin-dashboard/settings/system-settings.tsx
sessionTimeout: yup.number().min(300).max(86400)
maxLoginAttempts: yup.number().min(1).max(20)
cacheDuration: yup.number().min(60).max(3600)
```

### String Length Limits
```typescript
// Location: src/lib/api/validation.ts
search: { type: "string" as const, maxLength: 500 }
hebrew_name: { type: "string" as const, maxLength: 200 }
english_name: { type: "string" as const, maxLength: 200 }
size: { type: "string" as const, maxLength: 50 }
qty: { type: "number" as const, min: 0 }
```

---

## 🐛 **Console/Debug Strings**

### Logging Messages (50+ instances)
```typescript
// Location: src/context/CompanyContext.tsx
console.log('🏢 Loading company settings...');
console.log('📝 No company settings found, using defaults');
console.log('✅ Company settings loaded:', data);
console.error('❌ Error loading company settings:', error);

// Location: src/app/api/settings/route.ts
console.log('RLS permission denied for settings update');
console.error('Unexpected error in GET /api/settings:', error);

// Location: src/components/layout/header/TopBar.tsx
console.log('Institute search clicked');
```

---

## 🔧 **Environment Variables**

### Properly Configured (✅)
```typescript
// Location: src/lib/supabaseServer.ts
process.env.NEXT_PUBLIC_SUPABASE_URL!
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Location: src/utils/imageHelpers.ts
if (process.env.NODE_ENV === 'development')

// Location: src/components/ui/ErrorBoundary.tsx
if (process.env.NODE_ENV === 'development')
```

### Hard-coded Values that Should Be Environment Variables
```typescript
// Location: src/app/api/products/route.ts
const pricesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/prices?refs=${productRefs.join(',')}`, {

// Location: src/context/CompanyContext.tsx
timezone: 'Asia/Jerusalem'
```

---

## 📱 **Mobile/Responsive Breakpoints**

### Hard-coded Screen Sizes
```typescript
// Location: src/components/catalog/ProductListItem.tsx
const isUltraSmall = useMediaQuery('(max-width:450px)');

// Location: src/components/ui/OptimizedImage.tsx
sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
```

---

## 🚀 **Performance Constants**

### Cache Settings
```typescript
// Location: src/lib/api/cache.ts
private readonly maxSize = 100;

// Location: src/pages-sections/admin-dashboard/settings/system-settings.tsx
cacheDuration: yup.number().min(60).max(3600)
```

### Loading States
```typescript
// Location: src/pages-sections/admin-dashboard/settings/system-settings.tsx
await new Promise(resolve => setTimeout(resolve, 2000));
```

---

## 📝 **Recommendations by Priority**

### 🔴 **Critical (Business Logic)**
1. **Stock thresholds** (10 items) - Move to settings table
2. **Pricing calculations** - Centralize in pricing service
3. **Order status flows** - Make configurable
4. **Validation rules** - Externalize to config files

### 🟡 **High (UI/UX)**
1. **Drawer widths** - Make responsive/configurable
2. **Table heights** - Calculate based on viewport
3. **Icon sizes** - Use theme constants
4. **Spacing values** - Use MUI theme spacing

### 🟢 **Medium (Configuration)**
1. **API timeouts** - Environment variables
2. **Color schemes** - Theme configuration
3. **Pagination defaults** - User preferences
4. **Timezones** - User settings

### 🔵 **Low (Debugging)**
1. **Console messages** - Remove or make conditional
2. **Debug strings** - Use logging library
3. **Development checks** - Environment-aware

---

## 📊 **Migration Strategy**

### Phase 1: Critical Business Logic
- Move stock thresholds to settings table
- Centralize pricing calculations
- Externalize validation rules

### Phase 2: UI/Configuration
- Create theme configuration system
- Move layout constants to configuration
- Add environment variable support

### Phase 3: Code Quality
- Remove debug strings
- Add proper logging
- Implement configuration validation

### Phase 4: Advanced Features
- User preferences for UI settings
- Dynamic configuration loading
- A/B testing for constants

---

## 🔗 **Related Files**
- `src/constants/` - Current constants structure
- `src/types/` - TypeScript interfaces
- `src/context/CompanyContext.tsx` - Settings management
- `src/lib/api/validation.ts` - Validation rules
- `src/pages-sections/admin-dashboard/settings/` - Settings UI

---

*Generated on: $(date)*
*Total hard-coded values found: 200+*
