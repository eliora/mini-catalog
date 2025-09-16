# Bazaar Pro Admin Endpoints Mapping

## Overview
This document maps all admin endpoints and components extracted from the Bazaar Pro template to our mini-catalog admin panel implementation.

## Template Source Structure
Based on: `bazaar_pro_template/src/app/(admin-dashboard)/` and `bazaar_pro_template/src/pages-sections/vendor-dashboard/`

---

## 1. Admin Dashboard Structure

### Layout Components (✅ Implemented)
| Bazaar Pro Component | Our Implementation | Status |
|---------------------|-------------------|---------|
| `VendorDashboardLayout` | `src/components/layouts/vendor-dashboard/dashboard-layout.tsx` | ✅ Adapted |
| `DashboardSidebar` | `src/components/layouts/vendor-dashboard/dashboard-sidebar/dashboard-sidebar.tsx` | ✅ Simplified |
| `DashboardNavbar` | `src/components/layouts/vendor-dashboard/dashboard-navbar/dashboard-navbar.tsx` | ✅ Simplified |
| `BodyWrapper` | `src/components/layouts/vendor-dashboard/dashboard-body-wrapper.tsx` | ✅ Copied |
| `LayoutProvider` | `src/components/layouts/vendor-dashboard/dashboard-layout-context.tsx` | ✅ Copied |
| `PageWrapper` | `src/pages-sections/admin-dashboard/page-wrapper.tsx` | ✅ Adapted |

---

## 2. Admin Endpoints Mapping

### Core Admin Routes (Bazaar Pro → Our Implementation)

#### **Dashboard/Overview**
- **Bazaar Pro**: `/vendor/dashboard`
- **Our Route**: `/admin`
- **Page**: `src/app/(admin-dashboard)/admin/page.tsx`
- **Component**: Dashboard overview with stats cards
- **Status**: ✅ Implemented

---

### **Products Management**

#### Product List
- **Bazaar Pro**: `/admin/products`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/products/page-view/products.tsx`
- **Our Route**: `/admin/products-management`
- **Our Page**: `src/app/(admin-dashboard)/admin/products-management/page.tsx`
- **Our Component**: `src/pages-sections/admin-dashboard/products-management/page-view/products-management.tsx`
- **Status**: 🔄 Placeholder (Ready for Bazaar Pro components)

**Bazaar Pro Features Available:**
- `product-row.tsx` - Product table row component
- `product-form.tsx` - Product create/edit form
- `table-heading.ts` - Table column definitions
- Advanced data table with sorting, filtering
- Bulk operations support

#### Product Create
- **Bazaar Pro**: `/admin/products/create`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/products/page-view/product-create.tsx`
- **Our Route**: `/admin/products-management/create` (Future)
- **Status**: 📋 Planned

#### Product Edit
- **Bazaar Pro**: `/admin/products/[slug]`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/products/page-view/product-edit.tsx`
- **Our Route**: `/admin/products-management/[id]` (Future)
- **Status**: 📋 Planned

#### Product Reviews
- **Bazaar Pro**: `/admin/products/reviews`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/products/page-view/product-reviews.tsx`
- **Our Route**: `/admin/products-management/reviews` (Future)
- **Status**: 📋 Planned

---

### **Orders Management**

#### Order List
- **Bazaar Pro**: `/admin/orders`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/orders/page-view/orders.tsx`
- **Our Route**: `/admin/orders-management`
- **Our Page**: `src/app/(admin-dashboard)/admin/orders-management/page.tsx`
- **Our Component**: `src/pages-sections/admin-dashboard/orders-management/page-view/orders-management.tsx`
- **Status**: 🔄 Placeholder (Ready for Bazaar Pro components)

**Bazaar Pro Features Available:**
- `order-row.tsx` - Order table row component
- `order-actions.tsx` - Order action buttons
- `ordered-product.tsx` - Order items display
- `shipping-address.tsx` - Address display component
- `total-summery.tsx` - Order totals component
- `table-heading.ts` - Table column definitions

#### Order Details
- **Bazaar Pro**: `/admin/orders/[id]`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/orders/page-view/order-details.tsx`
- **Our Route**: `/admin/orders-management/[id]` (Future)
- **Status**: 📋 Planned

---

### **Customer/Client Management**

#### Customers List
- **Bazaar Pro**: `/admin/customers`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/customers/page-view/customers.tsx`
- **Our Route**: `/admin/client-management`
- **Our Page**: `src/app/(admin-dashboard)/admin/client-management/page.tsx`
- **Our Component**: `src/pages-sections/admin-dashboard/client-management/page-view/client-management.tsx`
- **Status**: ✅ Implemented (Custom enhanced version)

**Bazaar Pro Features Available:**
- `customer-row.tsx` - Customer table row component
- `table-heading.ts` - Table column definitions
- Data table with search and pagination

**Our Enhancements:**
- Role management system
- Address management
- Business information
- Status management
- Bulk operations
- CRUD dialogs

---

### **Categories Management**

#### Category List
- **Bazaar Pro**: `/admin/categories`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/categories/page-view/categories.tsx`
- **Our Route**: `/admin/categories` (Future)
- **Status**: 📋 Planned

**Bazaar Pro Features Available:**
- `category-form.tsx` - Category create/edit form
- `category-row.tsx` - Category table row
- `table-heading.ts` - Table columns

#### Category Create
- **Bazaar Pro**: `/admin/categories/create`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/categories/page-view/create-category.tsx`
- **Status**: 📋 Planned

#### Category Edit
- **Bazaar Pro**: `/admin/categories/[slug]`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/categories/page-view/category-edit.tsx`
- **Status**: 📋 Planned

---

### **Brands Management**

#### Brand List
- **Bazaar Pro**: `/admin/brands`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/brands/page-view/brands.tsx`
- **Our Route**: `/admin/brands` (Future)
- **Status**: 📋 Planned

**Bazaar Pro Features Available:**
- `brand-form.tsx` - Brand create/edit form
- `brand-row.tsx` - Brand table row
- `table-heading.ts` - Table columns

#### Brand Create
- **Bazaar Pro**: `/admin/brands/create`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/brands/page-view/brand-create.tsx`
- **Status**: 📋 Planned

#### Brand Edit
- **Bazaar Pro**: `/admin/brands/[slug]`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/brands/page-view/brand-edit.tsx`
- **Status**: 📋 Planned

---

### **Settings Management**

#### Site Settings
- **Bazaar Pro**: `/vendor/site-settings`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/site-settings/page-view/site-settings.tsx`
- **Our Route**: `/admin/settings`
- **Our Page**: `src/app/(admin-dashboard)/admin/settings/page.tsx`
- **Our Component**: `src/pages-sections/admin-dashboard/settings/page-view/settings.tsx`
- **Status**: 🔄 Placeholder (Ready for Bazaar Pro components)

**Bazaar Pro Features Available:**
- `general-form.tsx` - General settings form
- `banner-slider.tsx` - Banner management
- `footer-form.tsx` - Footer settings
- `social-links-form.tsx` - Social media links
- `topbar-form.tsx` - Top bar settings
- `shipping-vat-form.tsx` - Shipping and tax settings

#### Shop Settings
- **Bazaar Pro**: `/vendor/shop-settings`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/shop-settings/page-view/shop-settings.tsx`
- **Status**: 📋 Planned for integration

**Bazaar Pro Features Available:**
- `settings-form.tsx` - Shop settings form
- `page-settings.tsx` - Page-specific settings

---

### **Financial Management**

#### Earning History
- **Bazaar Pro**: `/admin/earning-history`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/earning-history/page-view/earning-history.tsx`
- **Our Route**: `/admin/analytics` (Future)
- **Status**: 📋 Planned

**Bazaar Pro Features Available:**
- `history-row.tsx` - Earning history row
- `table-heading.ts` - Table columns
- `types.ts` - TypeScript definitions

#### Payouts
- **Bazaar Pro**: `/admin/payouts`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/payouts/page-view/payouts.tsx`
- **Status**: 📋 Planned

#### Payout Requests
- **Bazaar Pro**: `/admin/payout-requests`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/payout-requests/page-view/payout-requests.tsx`
- **Status**: 📋 Planned

#### Package Payments
- **Bazaar Pro**: `/admin/package-payments`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/package-payments/page-view/package-payment.tsx`
- **Status**: 📋 Planned

---

### **Seller Management**

#### Sellers List
- **Bazaar Pro**: `/admin/sellers`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/sellers/page-view/sellers.tsx`
- **Status**: 📋 Planned (Not needed for mini-catalog)

#### Seller Package
- **Bazaar Pro**: `/admin/seller-package`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/seller-package/page-view/seller-package.tsx`
- **Status**: 📋 Not needed for mini-catalog

---

### **Support & Refunds**

#### Refund Requests
- **Bazaar Pro**: `/admin/refund-request`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/refund-request/page-view/refund-request.tsx`
- **Status**: 📋 Planned

#### Refund Settings
- **Bazaar Pro**: `/admin/refund-setting`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/refund-setting/page-view/refund-setting.tsx`
- **Status**: 📋 Planned

#### Support Tickets
- **Bazaar Pro**: `/vendor/support-tickets`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/support-tickets/page-view/support-tickets.tsx`
- **Status**: 📋 Planned

---

### **Account Management**

#### Account Settings
- **Bazaar Pro**: `/vendor/account-settings`
- **Bazaar Pro Component**: `pages-sections/vendor-dashboard/account-settings/page-view/account-settings.tsx`
- **Our Route**: `/admin/profile` (Future)
- **Status**: 📋 Planned

**Bazaar Pro Features Available:**
- `cover-pic-section.tsx` - Profile picture upload
- `upload-button.tsx` - File upload component

---

## 3. Shared Components Available from Bazaar Pro

### Data Table Components
- `components/data-table/TableHeader.tsx` - Sortable table headers
- `components/data-table/TablePagination.tsx` - Pagination component
- `hooks/useMuiTable.ts` - Table state management hook

### Search & Filter Components
- `pages-sections/vendor-dashboard/search-box.tsx` - Search interface
- Filter and sorting functionality

### Form Components
- Various form components for each section
- Upload components
- Date pickers and selectors

### Chart & Analytics Components
- `pages-sections/vendor-dashboard/dashboard/analytics.tsx` - Analytics charts
- `pages-sections/vendor-dashboard/dashboard/apex-chart.tsx` - Chart implementation
- `pages-sections/vendor-dashboard/dashboard/chart-options.ts` - Chart configurations

---

## 4. Implementation Priority

### Phase 1: ✅ Completed
- [x] Admin layout system (VendorDashboardLayout)
- [x] Navigation and routing
- [x] Basic page structure
- [x] Client management (enhanced version)

### Phase 2: 🔄 In Progress (Settings Management)
- [ ] Integrate Bazaar Pro site-settings components
- [ ] Logo upload functionality
- [ ] Company information management
- [ ] General settings form

### Phase 3: 📋 Planned (Products Management)
- [ ] Integrate Bazaar Pro products components
- [ ] Product list with advanced table
- [ ] Product create/edit forms
- [ ] Bulk operations
- [ ] Product reviews management

### Phase 4: 📋 Planned (Orders Management)
- [ ] Integrate Bazaar Pro orders components
- [ ] Order list with status management
- [ ] Order details view
- [ ] Order revival system (custom enhancement)
- [ ] SQL editor for orders (custom enhancement)
- [ ] PDF export system (custom enhancement)

### Phase 5: 📋 Future Features
- [ ] Categories and brands management
- [ ] Analytics dashboard
- [ ] Refund management
- [ ] Support ticket system

---

## 5. Custom Enhancements Beyond Bazaar Pro

### Client Management Enhancements
- **Role-based access control** - Advanced permission system
- **Address management** - Full address CRUD
- **Business information** - Company details tracking
- **Status management** - Active/inactive/suspended states
- **Bulk operations** - Mass updates and actions

### Orders Management Enhancements
- **Order revival system** - Edit completed orders
- **SQL editor** - Direct database access for orders
- **Email integration** - Send order updates via email
- **Advanced PDF export** - Multiple template options

### Settings Management Enhancements
- **Multi-language support** - Hebrew/English interface
- **Advanced tax settings** - Israeli tax compliance
- **Currency management** - ILS-focused settings
- **Theme customization** - Brand color management

---

## 6. Available Bazaar Pro Components for Integration

### Ready to Use Components
1. **Data Tables**: Advanced sorting, filtering, pagination
2. **Form Components**: Validated forms with error handling
3. **Upload Components**: File and image upload with preview
4. **Chart Components**: Analytics and reporting charts
5. **Search Components**: Advanced search and filtering
6. **Modal/Dialog Components**: Consistent modal interfaces
7. **Status Components**: Chips, badges, and indicators

### Component Integration Strategy
1. **Copy base components** from Bazaar Pro template
2. **Adapt styling** to match our theme
3. **Enhance functionality** with custom features
4. **Maintain TypeScript** type safety
5. **Ensure responsiveness** for mobile devices

---

## 7. Migration Timeline

### Immediate (Next 2 weeks)
- Implement Settings Management using Bazaar Pro components
- Set up proper data table infrastructure
- Create reusable form components

### Short-term (Next month)
- Products Management with Bazaar Pro components
- Orders Management integration
- Advanced data table features

### Long-term (Next quarter)
- Analytics dashboard
- Categories and brands management
- Advanced reporting features
- Multi-language support

---

This mapping provides a comprehensive guide for integrating Bazaar Pro template components into our mini-catalog admin panel while maintaining our custom enhancements and requirements.
