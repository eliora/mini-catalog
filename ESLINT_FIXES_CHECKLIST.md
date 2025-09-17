# ESLint Fixes Checklist

## 🎯 **Priority Levels:**
- 🔴 **CRITICAL** - Breaks functionality or security
- 🟠 **HIGH** - Performance or accessibility issues  
- 🟡 **MEDIUM** - Code quality improvements
- 🔵 **LOW** - Cosmetic/style improvements

## 📊 **Current Status:**
- ✅ **COMPLETED**: Unescaped HTML entities (all fixed)
- ✅ **COMPLETED**: Empty object types (all fixed)
- 🔄 **IN PROGRESS**: TypeScript `any` types (336 errors remaining)
- 🔄 **IN PROGRESS**: Unused variables/imports (154 warnings remaining)
- ⏳ **PENDING**: React hooks dependencies
- ⏳ **PENDING**: Missing React keys
- ⏳ **PENDING**: Component display names

---

## 🔴 **CRITICAL FIXES (Must Fix)**

### TypeScript Any Types (ERRORS - Block Build)
- [ ] `src/app/api/admin/client-management/route.ts` - 3 `any` types (lines 135, 195, 227)
- [ ] `src/app/api/admin/orders/route.ts` - 4 `any` types (lines 57, 58, 59, 62, 82, 99)
- [ ] `src/app/api/admin/orders/[id]/revive/route.ts` - 1 `any` type (line 140)
- [ ] `src/app/api/admin/orders/[id]/route.ts` - 1 `any` type (line 96)
- [ ] `src/app/api/admin/products/route.ts` - 6 `any` types (lines 57, 83, 127, 183, 213)
- [ ] `src/app/api/admin/settings/route.ts` - 2 `any` types (lines 33, 68)
- [ ] `src/app/api/prices/route.ts` - 1 `any` type (line 57)
- [ ] `src/app/api/products/route.ts` - 7 `any` types (lines 32, 46, 262, 272, 291, 294, 316)
- [ ] `src/app/api/settings/route.ts` - 1 `any` type (line 219)

### Empty Object Types (ERRORS)
- [x] `src/pages-sections/admin-dashboard/orders-management/page-view/orders-management.tsx:97` - Empty interface
- [x] `src/pages-sections/admin-dashboard/products-management/page-view/products-management.tsx:88` - Empty interface
- [x] `src/utils/dataHelpers.ts:11` - Empty interface

### Unescaped HTML Entities (ERRORS)
- [x] `src/components/orderform/OrderSuccessView.tsx` - 3 quotes (lines 115, 167, 172)
- [x] `src/components/orderform/OrderSummary.tsx` - 2 quotes (lines 109, 122)
- [x] `src/pages-sections/admin-dashboard/orders-management/order-revival-dialog.tsx` - 4 quotes (lines 264, 276, 419)
- [x] `src/pages-sections/admin-dashboard/orders-management/orders-data-table.tsx` - 1 quote (line 235)
- [x] `src/pages-sections/admin-dashboard/settings/tax-settings.tsx` - 2 quotes (lines 89, 107), `pagination.page`
- [ ] `src/pages-sections/admin-dashboard/products-management/page-view/products-management.tsx:175` - Missing dependency `fetchProducts`

### Missing React Keys
- [ ] `src/components/admin/data-tables/ClientDataTable.tsx:176` - Missing key prop
- [ ] `src/components/admin/data-tables/ClientDataTable.tsx:182` - Missing key prop  
- [ ] `src/pages-sections/admin-dashboard/products-management/products-data-table.tsx:174` - Missing key prop
- [ ] `src/pages-sections/admin-dashboard/products-management/products-data-table.tsx:180` - Missing key prop

### React Component Issues
- [ ] `src/components/catalog/ImageGallery.tsx:29` - Missing display name
- [ ] `src/components/catalog/LoadingIndicator.tsx:22` - Missing display name
- [ ] `src/components/catalog/LoadingIndicator.tsx:31` - Missing display name

---

## 🟠 **HIGH PRIORITY (Performance & Accessibility)**

### Unescaped HTML Entities (Accessibility)
- [ ] `src/components/common/UnifiedCartItem.tsx:356` - `"` should be `&quot;`
- [ ] `src/components/orderform/CartItemsTable.tsx:84` - `"` should be `&quot;`
- [ ] `src/components/orderform/CartItemsTable.tsx:138` - `"` should be `&quot;`
- [ ] `src/components/orderform/OrderSuccessView.tsx:115` - `"` should be `&quot;`
- [ ] `src/components/orderform/OrderSuccessView.tsx:167` - `"` should be `&quot;`
- [ ] `src/components/orderform/OrderSuccessView.tsx:172` - `"` should be `&quot;`
- [ ] `src/components/orderform/OrderSummary.tsx:109` - `"` should be `&quot;`
- [ ] `src/components/orderform/OrderSummary.tsx:122` - `"` should be `&quot;`
- [ ] `src/pages-sections/admin-dashboard/orders-management/order-revival-dialog.tsx:264` - `"` should be `&quot;`
- [ ] `src/pages-sections/admin-dashboard/orders-management/order-revival-dialog.tsx:276` - `"` should be `&quot;`
- [ ] `src/pages-sections/admin-dashboard/orders-management/order-revival-dialog.tsx:419` - `"` should be `&quot;` (2 instances)
- [ ] `src/pages-sections/admin-dashboard/orders-management/orders-data-table.tsx:235` - `"` should be `&quot;`
- [ ] `src/pages-sections/admin-dashboard/settings/tax-settings.tsx:89` - `"` should be `&quot;`
- [ ] `src/pages-sections/admin-dashboard/settings/tax-settings.tsx:107` - `"` should be `&quot;`

### Image Optimization (Performance)
- [ ] `src/components/catalog/ImageGallery.tsx:88` - Replace `<img>` with Next.js `<Image>`
- [ ] `src/components/catalog/ImageGallery.tsx:152` - Replace `<img>` with Next.js `<Image>`
- [ ] `src/components/common/ProductImage.tsx:87` - Replace `<img>` with Next.js `<Image>`
- [ ] `src/components/ui/OptimizedImage.tsx:240` - Replace `<img>` with Next.js `<Image>`

---

## 🟡 **MEDIUM PRIORITY (Code Quality)**

### Empty Interfaces/Objects
- [ ] `src/pages-sections/admin-dashboard/orders-management/page-view/orders-management.tsx:97` - Empty interface
- [ ] `src/pages-sections/admin-dashboard/products-management/page-view/products-management.tsx:88` - Empty interface
- [ ] `src/utils/dataHelpers.ts:11` - Empty interface

### Unused Expressions
- [ ] `src/components/common/UnifiedCartItem.tsx:77` - Unused expression

---

## 🔵 **LOW PRIORITY (Cleanup)**

### Unused Variables/Imports (200+ instances)
#### API Routes
- [ ] `src/api/prices.ts:94` - Unused variable `data`
- [ ] `src/app/api/admin/client-management/route.ts:111,161` - Unused `parseError`
- [ ] `src/app/api/admin/orders/route.ts:8,11,17,18,82` - Multiple unused imports
- [ ] `src/app/api/admin/orders/[id]/revive/route.ts:14,15,20,49` - Multiple unused imports
- [ ] `src/app/api/admin/orders/[id]/route.ts:10,14,15,16,20,89,196` - Multiple unused imports
- [ ] `src/app/api/admin/products/route.ts:103,149` - Unused `parseError`
- [ ] `src/app/api/admin/settings/route.ts:51` - Unused `parseError`
- [ ] `src/app/api/orders/route.ts:7` - Unused `request`
- [ ] `src/app/api/prices/check-access/route.ts:7,12` - Unused variables
- [ ] `src/app/api/products/route.ts:4,36` - Unused imports/variables
- [ ] `src/app/api/products/[ref]/details/route.ts:3` - Unused `Database`
- [ ] `src/app/api/settings/route.ts:7,31,278,282` - Multiple unused variables

#### Components
- [ ] `src/components/admin/data-tables/ClientDataTable.tsx:10` - Unused `Tooltip`
- [ ] `src/components/admin/dialogs/ClientEditDialog.tsx:23,31,32,33,41,161` - Multiple unused imports
- [ ] `src/components/admin/layout/AdminHeader.tsx:29` - Unused `AccountCircleIcon`
- [ ] `src/components/admin/layout/AdminPageHeader.tsx:15` - Unused `Divider`
- [ ] `src/components/admin/layout/AdminSidebar.tsx:20,35,106` - Multiple unused variables
- [ ] `src/components/catalog/CatalogClean.tsx:73,178` - Unused variables
- [ ] `src/components/catalog/ProductAccordionContent.tsx:64` - Unused `parseJsonField`
- [ ] `src/components/catalog/ProductCard.tsx:11,40,41` - Multiple unused imports
- [ ] `src/components/catalog/ProductListItem.tsx:3,41,49,50` - Multiple unused variables
- [ ] `src/components/common/PriceDisplay.tsx:20,28` - Multiple unused variables
- [ ] `src/components/common/ProductInfo.tsx:30` - Unused `variant`
- [ ] `src/components/common/SearchHeader.tsx:40,41` - Unused variables
- [ ] `src/components/layout/AppLayout.tsx:32,35,63,69,79` - Multiple unused variables

#### Context & Hooks
- [ ] `src/context/AuthContext.tsx:5,7,8,166,193` - Multiple unused imports/variables
- [ ] `src/context/CartContext.tsx:6,116` - Unused imports/variables
- [ ] `src/hooks/useAdminAccess.ts:18` - Unused `user`
- [ ] `src/hooks/useCatalogFilters.ts:15` - Unused `useEffect`
- [ ] `src/hooks/useCatalogPricing.ts:5` - Unused `useEffect`
- [ ] `src/hooks/useClientManagement.ts:106` - Unused `key`
- [ ] `src/hooks/usePricing.ts:6` - Unused `useEffect`

#### Admin Dashboard Pages
- [ ] `src/pages-sections/admin-dashboard/client-management/page-view/client-management.tsx:23,27,46` - Multiple unused variables
- [ ] `src/pages-sections/admin-dashboard/dashboard/analytics.tsx:3` - Unused `Grid`
- [ ] `src/pages-sections/admin-dashboard/dashboard/card-1.tsx:5,6` - Multiple unused imports
- [ ] `src/pages-sections/admin-dashboard/dashboard/page-view/dashboard.tsx:8` - Unused `Assessment`
- [ ] `src/pages-sections/admin-dashboard/dashboard/sales.tsx:5` - Unused `FlexBox`
- [ ] `src/pages-sections/admin-dashboard/dashboard/stock-out-products.tsx:8,14` - Multiple unused imports

### TypeScript `any` Types (200+ instances)
*Note: These are mostly type assertions we added for compatibility. Can be gradually improved with proper typing.*

#### API Files (50+ instances)
- [ ] All admin API routes have multiple `any` types for error handling
- [ ] Product and order services use `any` for database responses
- [ ] Validation helpers use `any` for flexible input handling

#### Component Files (100+ instances)  
- [ ] Most admin dashboard components use `any` for form data
- [ ] Catalog components use `any` for product data parsing
- [ ] Cart and order components use `any` for legacy compatibility

#### Utility Files (50+ instances)
- [ ] Theme files use `any` for MUI compatibility
- [ ] Type definition files use `any` for database schema flexibility
- [ ] Helper utilities use `any` for generic data processing

---

## 📊 **Statistics:**
- **Total Issues:** ~300
- **Critical:** 15
- **High Priority:** 20
- **Medium Priority:** 5  
- **Low Priority:** 260+

## 🎯 **Recommended Approach:**
1. **Phase 1:** Fix all CRITICAL issues (15 items)
2. **Phase 2:** Fix HIGH priority accessibility & performance (20 items)
3. **Phase 3:** Address MEDIUM priority code quality (5 items)
4. **Phase 4:** Gradually improve LOW priority items during regular development
