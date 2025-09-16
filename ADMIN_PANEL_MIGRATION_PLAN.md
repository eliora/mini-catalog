# Admin Panel Migration Plan - Bazaar Pro Template Integration

## Overview
This document outlines a comprehensive plan for migrating and enhancing the admin panel using the Bazaar Pro template structure, focusing on modern MUI components and e-commerce best practices.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Admin Endpoints Structure](#admin-endpoints-structure)
3. [Client Management System](#client-management-system)
4. [Settings Management](#settings-management)
5. [Products Management](#products-management)
6. [Orders Management](#orders-management)
7. [Component Structure](#component-structure)
8. [Implementation Timeline](#implementation-timeline)

## Architecture Overview

### Directory Structure
```
src/
├── app/(admin-dashboard)/
│   ├── admin/
│   │   ├── client-management/
│   │   ├── settings/
│   │   ├── products-management/
│   │   ├── orders-management/
│   │   └── layout.tsx
│   └── layout.tsx
├── pages-sections/admin-dashboard/
│   ├── client-management/
│   ├── settings/
│   ├── products-management/
│   └── orders-management/
├── components/admin/
│   ├── data-tables/
│   ├── forms/
│   ├── dialogs/
│   └── shared/
└── types/admin/
```

### Key Design Principles
- **MUI-First**: All components built with Material-UI v5
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **TypeScript**: Full type safety throughout the application
- **Reusable Components**: Modular design for easy maintenance
- **Performance**: Optimized data fetching and rendering

---

## Admin Endpoints Structure

### API Routes Structure
```
/api/admin/
├── client-management/
│   ├── route.ts (GET, POST - list/create clients)
│   ├── [id]/
│   │   ├── route.ts (GET, PUT, DELETE - single client operations)
│   │   └── roles/route.ts (PUT - update user roles)
├── settings/
│   ├── route.ts (GET, PUT - general settings)
│   ├── logo/route.ts (POST - logo upload)
│   ├── company/route.ts (GET, PUT - company info)
│   └── notifications/route.ts (GET, PUT - notification settings)
├── products-management/
│   ├── route.ts (GET, POST - list/create products)
│   ├── [id]/
│   │   ├── route.ts (GET, PUT, DELETE - single product operations)
│   │   └── bulk-edit/route.ts (PUT - bulk operations)
│   ├── export/route.ts (GET - CSV export)
│   └── import/route.ts (POST - CSV import)
└── orders-management/
    ├── route.ts (GET, POST - list/create orders)
    ├── [id]/
    │   ├── route.ts (GET, PUT, DELETE - single order operations)
    │   ├── revive/route.ts (POST - revive order for editing)
    │   └── pdf/route.ts (GET - PDF export)
    ├── sql-editor/route.ts (POST - SQL operations)
    └── export/route.ts (GET - bulk export)
```

---

## Client Management System

### Features
- **Client CRUD Operations**: Create, read, update, delete clients
- **Role Management**: Assign and modify user roles
- **Address Management**: Full address editing capabilities
- **Business Information**: Company details and contact info
- **Account Integration**: Components reusable in client account pages

### Components Structure

#### 1. Client Management Page (`/admin/client-management`)
```tsx
// pages-sections/admin-dashboard/client-management/page-view/client-management.tsx
interface ClientManagementProps {
  initialClients: Client[];
  userRoles: UserRole[];
}

// Features:
- DataGrid with search, filter, sort
- Bulk operations (delete, role changes)
- Export to CSV
- Real-time updates
```

#### 2. Client Data Table
```tsx
// components/admin/data-tables/ClientDataTable.tsx
interface ClientDataTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onBulkAction: (action: string, clientIds: string[]) => void;
}

// MUI Components Used:
- DataGrid (or custom Table with TableSortLabel)
- TablePagination
- Checkbox for bulk selection
- IconButton for actions
- Chip for role display
```

#### 3. Client Edit Dialog
```tsx
// components/admin/dialogs/ClientEditDialog.tsx
interface ClientEditDialogProps {
  client?: Client;
  open: boolean;
  onClose: () => void;
  onSave: (client: ClientFormData) => Promise<void>;
  userRoles: UserRole[];
}

// Form Fields:
- TextField for name, business name
- TextField for phone number
- Autocomplete for address
- Select/Chip for user roles
- FormControlLabel for status toggles
```

#### 4. Reusable Client Form Components
```tsx
// components/admin/forms/ClientForm.tsx
// This component will be reused in:
// 1. Admin client management
// 2. Client account page (self-editing)

interface ClientFormProps {
  client?: Partial<Client>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  userRoles?: UserRole[]; // Only available for admin
  readOnlyFields?: string[]; // For client self-editing
  showRoleManagement?: boolean; // Admin only
}
```

### Database Schema
```typescript
interface Client {
  id: string;
  name: string;
  business_name?: string;
  email: string;
  phone_number?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  user_roles: UserRole[];
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}
```

---

## Settings Management

### Redesigned Admin Settings
Based on e-commerce best practices with compact, modern design.

#### 1. Settings Page Structure
```tsx
// pages-sections/admin-dashboard/settings/page-view/settings.tsx
interface SettingsPageProps {
  settings: CompanySettings;
  logoUploadUrl?: string;
}

// Layout: Tabbed interface with sections:
- General Settings
- Company Information  
- Logo & Branding
- Notifications
- System Settings
```

#### 2. Settings Tabs Component
```tsx
// components/admin/forms/SettingsTabs.tsx
interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  settings: CompanySettings;
  onSettingsChange: (settings: Partial<CompanySettings>) => void;
}

// MUI Components Used:
- Tabs & Tab
- TabPanel
- Card & CardContent
- Grid system for layout
- Switch for toggles
- TextField for inputs
- Select for dropdowns
```

#### 3. Logo Upload Component
```tsx
// components/admin/forms/LogoUpload.tsx
interface LogoUploadProps {
  currentLogo?: string;
  onUpload: (file: File) => Promise<string>;
  onDelete: () => Promise<void>;
}

// Features:
- Drag & drop upload
- Image preview
- Progress indicator
- Error handling
- File validation
```

#### 4. Compact Settings Cards
```tsx
// components/admin/cards/SettingCard.tsx
interface SettingCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

// Design:
- Minimal padding
- Clear typography hierarchy
- Consistent spacing
- Action buttons aligned
```

### Settings Schema
```typescript
interface CompanySettings {
  // General
  company_name: string;
  tagline?: string;
  description?: string;
  
  // Contact
  email: string;
  phone: string;
  address: Address;
  
  // Branding
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  
  // Business
  tax_rate: number;
  currency: string;
  timezone: string;
  
  // Features
  enable_reviews: boolean;
  enable_wishlist: boolean;
  enable_notifications: boolean;
  
  // System
  maintenance_mode: boolean;
  debug_mode: boolean;
}
```

---

## Products Management

### Enhanced Product Management System
Comprehensive product management with inline editing, sorting, and advanced features.

#### 1. Products Management Page
```tsx
// pages-sections/admin-dashboard/products-management/page-view/products-management.tsx
interface ProductsManagementProps {
  products: Product[];
  categories: Category[];
  totalCount: number;
}

// Features:
- Advanced filtering & search
- Column visibility controls
- Bulk operations
- Export/Import functionality
- Real-time updates
```

#### 2. Enhanced Data Table
```tsx
// components/admin/data-tables/ProductsDataTable.tsx
interface ProductsDataTableProps {
  products: Product[];
  columns: ColumnConfig[];
  onEdit: (product: Product) => void;
  onBulkEdit: (productIds: string[], changes: Partial<Product>) => void;
  onExport: (format: 'csv' | 'xlsx') => void;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onColumnVisibilityChange: (columns: string[]) => void;
}

// MUI Components Used:
- Table with TableSortLabel for headers
- TablePagination
- Toolbar with custom actions
- IconButton for quick actions
- Chip for status indicators
- TextField for inline editing
```

#### 3. Column Configuration
```tsx
// components/admin/data-tables/ColumnSelector.tsx
interface ColumnSelectorProps {
  availableColumns: ColumnConfig[];
  visibleColumns: string[];
  onColumnToggle: (columnId: string) => void;
  onReset: () => void;
}

// Features:
- Drag & drop column reordering
- Show/hide columns
- Save column preferences
- Reset to default
```

#### 4. Inline Editing System
```tsx
// components/admin/data-tables/InlineEditCell.tsx
interface InlineEditCellProps {
  value: any;
  field: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: SelectOption[];
  onSave: (value: any) => Promise<void>;
  validation?: (value: any) => string | null;
}

// Features:
- Click to edit
- Auto-save on blur
- Validation feedback
- Loading states
- Undo functionality
```

#### 5. Bulk Operations
```tsx
// components/admin/dialogs/BulkEditDialog.tsx
interface BulkEditDialogProps {
  selectedProducts: Product[];
  open: boolean;
  onClose: () => void;
  onApply: (changes: Partial<Product>) => Promise<void>;
}

// Operations:
- Price adjustments
- Category changes
- Status updates
- Tag management
- Inventory updates
```

#### 6. Export/Import System
```tsx
// components/admin/forms/ExportImportPanel.tsx
interface ExportImportPanelProps {
  onExport: (options: ExportOptions) => Promise<void>;
  onImport: (file: File, options: ImportOptions) => Promise<void>;
}

// Export Features:
- CSV/Excel formats
- Custom field selection
- Date range filtering
- Template download

// Import Features:
- CSV validation
- Preview before import
- Error reporting
- Batch processing
```

### Product Schema Enhancement
```typescript
interface Product {
  // Basic Info
  id: string;
  ref: string;
  name: string;
  description?: string;
  
  // Pricing
  base_price: number;
  sale_price?: number;
  cost_price?: number;
  
  // Inventory
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  
  // Organization
  category_id: string;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  
  // Media
  images: ProductImage[];
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}
```

---

## Orders Management

### Advanced Order Management System
Comprehensive order management with editing capabilities and SQL tools.

#### 1. Orders Management Page
```tsx
// pages-sections/admin-dashboard/orders-management/page-view/orders-management.tsx
interface OrdersManagementProps {
  orders: Order[];
  orderStatuses: OrderStatus[];
  totalCount: number;
}

// Features:
- Order status management
- Advanced filtering
- Bulk operations
- Export capabilities
- Real-time updates
```

#### 2. Order Data Table
```tsx
// components/admin/data-tables/OrdersDataTable.tsx
interface OrdersDataTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onReviveOrder: (orderId: string) => Promise<void>;
  onExportPDF: (orderId: string) => Promise<void>;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
}

// Features:
- Status chips with colors
- Customer information display
- Order total calculations
- Action buttons
- Quick status updates
```

#### 3. Order Revival System
```tsx
// components/admin/dialogs/OrderRevivalDialog.tsx
interface OrderRevivalDialogProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onRevive: (orderId: string) => Promise<void>;
}

// Process:
1. Create editable copy of order
2. Open in order form interface
3. Maintain link to original order
4. Save updates back to order
```

#### 4. Order Form Integration
```tsx
// Reuse existing OrderForm components:
// - CartItemsTable
// - OrderSummary
// - Customer information
// - Payment details

// Enhanced for admin use:
interface AdminOrderFormProps {
  order?: Order;
  mode: 'create' | 'edit' | 'revive';
  onSave: (orderData: OrderFormData) => Promise<void>;
  onCancel: () => void;
}
```

#### 5. SQL Editor for Orders
```tsx
// components/admin/tools/SqlEditor.tsx
interface SqlEditorProps {
  onExecute: (query: string) => Promise<QueryResult>;
  onExport: (result: QueryResult) => void;
  readOnly?: boolean;
}

// Features:
- Syntax highlighting
- Query validation
- Result preview
- Export results
- Query history
- Safety checks
```

#### 6. PDF Export System
```tsx
// components/admin/export/OrderPdfExport.tsx
interface OrderPdfExportProps {
  order: Order;
  template: 'invoice' | 'receipt' | 'packing_slip';
  onGenerate: () => Promise<Blob>;
}

// Templates:
- Invoice with company branding
- Customer receipt
- Packing slip for fulfillment
- Custom templates
```

### Order Management Schema
```typescript
interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_info: CustomerInfo;
  
  // Items
  items: OrderItem[];
  
  // Totals
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  
  // Status
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  
  // Dates
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
  
  // Admin
  notes?: string;
  internal_notes?: string;
  revision_count: number;
  original_order_id?: string; // For revived orders
}

interface OrderStatus {
  id: string;
  name: string;
  color: string;
  description?: string;
  is_final: boolean;
}
```

---

## Component Structure

### Shared Admin Components

#### 1. Admin Layout
```tsx
// components/admin/layout/AdminLayout.tsx
interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

// Features:
- Responsive sidebar navigation
- Header with user menu
- Breadcrumb navigation
- Page actions area
- Mobile-friendly drawer
```

#### 2. Data Table Base
```tsx
// components/admin/data-tables/BaseDataTable.tsx
interface BaseDataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  sorting?: SortConfig;
  selection?: SelectionConfig;
  actions?: ActionConfig<T>;
}

// Features:
- Generic typing
- Virtualization for large datasets
- Custom cell renderers
- Built-in loading states
- Accessibility support
```

#### 3. Form Components
```tsx
// components/admin/forms/
├── AdminTextField.tsx      // Enhanced TextField with validation
├── AdminSelect.tsx         // Select with search and create options
├── AdminDatePicker.tsx     // Date picker with range support
├── AdminImageUpload.tsx    // Image upload with preview
├── AdminRichEditor.tsx     // Rich text editor
└── AdminFormSection.tsx    // Collapsible form sections
```

#### 4. Status Components
```tsx
// components/admin/status/
├── StatusChip.tsx          // Colored status indicators
├── ProgressIndicator.tsx   // Progress bars and rings
└── LoadingStates.tsx       // Various loading components
```

#### 5. Action Components
```tsx
// components/admin/actions/
├── BulkActions.tsx         // Bulk operation toolbar
├── QuickActions.tsx        // Floating action buttons
└── ConfirmDialog.tsx       // Confirmation dialogs
```

---

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- [ ] Set up admin directory structure
- [ ] Create base admin layout
- [ ] Implement admin routing
- [ ] Set up API endpoints structure
- [ ] Create shared admin components

### Phase 2: Client Management (Week 3-4)
- [ ] Client management API endpoints
- [ ] Client data table with CRUD operations
- [ ] Client edit dialog with role management
- [ ] Address management system
- [ ] Integration with account pages

### Phase 3: Settings Management (Week 5-6)
- [ ] Settings API endpoints
- [ ] bazzar pro settings interface
- [ ] Logo upload functionality
- [ ] Company information management
- [ ] Notification settings

### Phase 4: Products Management (Week 7-9)
- [ ] Enhanced products API
- [ ] Advanced data table with inline editing
- [ ] Column visibility controls
- [ ] Bulk operations system
- [ ] Export/Import functionality
- [ ] Product form enhancements

### Phase 5: Orders Management (Week 10-12)
- [ ] Orders management API
- [ ] Order data table with status management
- [ ] Order revival system
- [ ] SQL editor for orders
- [ ] PDF/send email export system
- [ ] Integration with existing order form

### Phase 6: Polish & Testing (Week 13-14)
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Mobile responsiveness testing
- [ ] User acceptance testing
- [ ] Documentation completion

---

## Technical Specifications

### MUI Components Priority List
1. **Data Display**: Table, DataGrid, Chip, Avatar, List
2. **Inputs**: TextField, Select, Autocomplete, DatePicker, Switch
3. **Navigation**: Tabs, Breadcrumbs, Pagination, Stepper
4. **Feedback**: Alert, Snackbar, Dialog, Progress, Skeleton
5. **Layout**: Grid, Box, Stack, Container, Paper, Card
6. **Surfaces**: AppBar, Toolbar, Drawer, Menu

### Performance Considerations
- **Virtualization**: For large data tables (>1000 rows)
- **Lazy Loading**: For images and heavy components
- **Memoization**: For expensive calculations
- **Debouncing**: For search and filter inputs
- **Caching**: For frequently accessed data

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Logical tab order
- **Alternative Text**: For all images and icons

### Security Considerations
- **Role-Based Access Control**: Granular permissions
- **Input Validation**: Client and server-side
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Security**: Type and size validation
- **Audit Logging**: Track all admin actions

---

## Conclusion

This comprehensive plan provides a roadmap for creating a modern, efficient admin panel using the Bazaar Pro template structure and MUI components. The focus on reusable components, TypeScript safety, and e-commerce best practices ensures a maintainable and scalable solution.

The modular approach allows for incremental implementation while maintaining consistency across all admin features. Each component is designed to be responsive, accessible, and performant, providing an excellent user experience for administrators managing the e-commerce platform.
