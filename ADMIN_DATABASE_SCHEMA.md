# 📊 Admin Panel Database Schema Documentation

## 🎯 Overview

This document provides comprehensive documentation for all database schemas, parameters, and management structures used in the Mini Catalog E-commerce Admin Panel.

---

## 🧑‍💼 Client Management Database Schema

### **`profiles` Table** (Main Client Table)
> **Note**: Currently referenced as `public.profiles` but may need to be created or mapped to existing user tables.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `string` | PRIMARY KEY | Unique client identifier (UUID) |
| `email` | `string` | NOT NULL, UNIQUE | Client email address |
| `name` | `string` | NOT NULL | Client full name |
| `business_name` | `string` | NULLABLE | Business/company name (optional) |
| `phone_number` | `string` | NULLABLE | Client phone number |
| `address` | `JSON` | NULLABLE | Structured address object |
| `user_roles` | `JSON[]` | DEFAULT: `[]` | Array of user roles |
| `status` | `enum` | DEFAULT: `'active'` | Client status |
| `created_at` | `timestamp` | DEFAULT: `now()` | Creation timestamp |
| `updated_at` | `timestamp` | DEFAULT: `now()` | Last update timestamp |
| `last_login` | `timestamp` | NULLABLE | Last login timestamp |

### **Client Status Enum Values**
```typescript
type ClientStatus = 'active' | 'inactive' | 'suspended'
```

### **Address Object Structure**
```typescript
interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}
```

### **User Role Object Structure**
```typescript
interface UserRole {
  id: string;
  name: 'customer' | 'premium_customer' | 'admin';
  permissions: string[];
  description: string;
}
```

### **Client Management API Endpoints**
- `GET /api/admin/client-management` - List clients with pagination
- `POST /api/admin/client-management` - Create new client
- `PUT /api/admin/client-management/[id]` - Update client
- `DELETE /api/admin/client-management/[id]` - Delete client

---

## 📦 Product Management Database Schema

### **`products` Table** (Main Products Table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `string` | PRIMARY KEY | Unique product identifier (UUID) |
| `ref` | `string` | NOT NULL, UNIQUE | Product reference/SKU |
| `product_name` | `string` | NULLABLE | Primary product name |
| `product_name_2` | `string` | NULLABLE | Secondary product name |
| `hebrew_name` | `string` | NULLABLE | Hebrew product name |
| `english_name` | `string` | NULLABLE | English product name |
| `french_name` | `string` | NULLABLE | French product name |
| `product_line` | `string` | NULLABLE | Product line/brand |
| `product_type` | `string` | NULLABLE | Product category/type |
| `type` | `string` | NULLABLE | Additional type classification |
| `size` | `string` | NULLABLE | Product size/volume |
| `qty` | `number` | NULLABLE | Stock quantity |
| `unit_price` | `number` | NULLABLE | Base unit price |
| `description` | `text` | NULLABLE | English description |
| `description_he` | `text` | NULLABLE | Hebrew description |
| `short_description_he` | `text` | NULLABLE | Short Hebrew description |
| `header` | `string` | NULLABLE | Product header/title |
| `ingredients` | `text` | NULLABLE | Product ingredients list |
| `active_ingredients` | `text` | NULLABLE | Active ingredients (English) |
| `active_ingredients_he` | `text` | NULLABLE | Active ingredients (Hebrew) |
| `skin_type_he` | `string` | NULLABLE | Suitable skin types (Hebrew) |
| `usage_instructions` | `text` | NULLABLE | Usage instructions (English) |
| `usage_instructions_he` | `text` | NULLABLE | Usage instructions (Hebrew) |
| `notice` | `text` | NULLABLE | Important notices |
| `main_pic` | `string` | NULLABLE | Main product image URL |
| `pics` | `JSON` | NULLABLE | Additional product images |
| `created_at` | `timestamp` | DEFAULT: `now()` | Creation timestamp |
| `updated_at` | `timestamp` | DEFAULT: `now()` | Last update timestamp |

### **`prices` Table** (Product Pricing)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `string` | PRIMARY KEY | Unique price record identifier |
| `product_ref` | `string` | FOREIGN KEY | References `products.ref` |
| `unit_price` | `number` | NOT NULL | Product price |
| `cost_price` | `number` | NULLABLE | Product cost price |
| `discount_price` | `number` | NULLABLE | Discounted price |
| `price_tier` | `string` | NULLABLE | Price tier (e.g., 'standard', 'premium') |
| `currency` | `string` | DEFAULT: `'ILS'` | Currency code |
| `created_at` | `timestamp` | DEFAULT: `now()` | Creation timestamp |
| `updated_at` | `timestamp` | DEFAULT: `now()` | Last update timestamp |

### **Product Images JSON Structure**
```typescript
interface ProductImages {
  main: string;
  gallery: string[];
  thumbnails: string[];
}
```

### **Product Management Features**
- ✅ Advanced data table with sorting & filtering
- ✅ Inline editing for all fields
- ✅ Bulk operations (delete, export, status change)
- ✅ CSV export functionality
- ✅ Column visibility controls
- ✅ Search and category filtering
- ✅ Stock status management

---

## 🛒 Order Management Database Schema

### **`orders` Table** (Main Orders Table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `string` | PRIMARY KEY | Unique order identifier (UUID) |
| `customer_name` | `string` | NOT NULL | Customer full name |
| `customer_email` | `string` | NULLABLE | Customer email address |
| `customer_phone` | `string` | NULLABLE | Customer phone number |
| `customer_address` | `string` | NULLABLE | Customer delivery address |
| `items` | `JSON` | NOT NULL | Order items array |
| `total_amount` | `number` | NOT NULL | Total order amount |
| `status` | `string` | DEFAULT: `'pending'` | Order status |
| `notes` | `text` | NULLABLE | Order notes/comments |
| `created_at` | `timestamp` | DEFAULT: `now()` | Order creation time |
| `updated_at` | `timestamp` | DEFAULT: `now()` | Last update time |

### **Order Status Enum Values**
```typescript
type OrderStatus = 
  | 'pending'     // ממתין
  | 'processing'  // מעובד
  | 'shipped'     // נשלח
  | 'delivered'   // נמסר
  | 'completed'   // הושלם
  | 'cancelled';  // בוטל
```

### **Order Items JSON Structure**
```typescript
interface OrderItem {
  product_id: string;
  product_name: string;
  product_ref: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_type?: string;
  notes?: string;
  product_line?: string;
  size?: string;
}
```

### **Order Management Advanced Features**

#### 🔄 **Order Revival System**
- **Purpose**: Allows editing and reactivating completed/cancelled orders
- **Features**:
  - Edit customer information
  - Modify order items (add/remove/edit)
  - Update quantities and prices
  - Real-time total calculation
  - Automatic status change to "processing"

#### 💻 **SQL Editor**
- **Purpose**: Direct database access for advanced order management
- **Features**:
  - Execute custom SQL queries
  - View database schema
  - Query history tracking
  - Sample query templates
  - Results visualization
  - Safety warnings for dangerous operations

#### 📊 **Bulk Operations**
- Status updates for multiple orders
- Bulk email notifications
- Bulk print/export functionality
- Bulk deletion with confirmation

---

## ⚙️ System Settings Database Schema

### **`settings` Table** (System Configuration)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `string` | PRIMARY KEY | Settings record identifier |
| `company_name` | `string` | NULLABLE | Company name |
| `company_description` | `text` | NULLABLE | Company description |
| `company_email` | `string` | NULLABLE | Company contact email |
| `company_phone` | `string` | NULLABLE | Company phone number |
| `company_address` | `string` | NULLABLE | Company address |
| `company_logo` | `string` | NULLABLE | Company logo URL |
| `currency` | `string` | DEFAULT: `'ILS'` | Default currency |
| `tax_rate` | `number` | DEFAULT: `0.17` | Tax rate (VAT) |
| `created_at` | `timestamp` | DEFAULT: `now()` | Creation timestamp |
| `updated_at` | `timestamp` | DEFAULT: `now()` | Last update timestamp |

### **Settings Management Categories**

#### 🏢 **1. General Settings**
```typescript
interface GeneralSettings {
  company_name: string;
  tagline?: string;
  description?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  timezone: string;
}
```

#### 🏪 **2. Company Settings**
```typescript
interface CompanySettings {
  company_name: string;
  business_name?: string;
  email: string;
  phone: string;
  address: Address;
  registration_number?: string;
  tax_id?: string;
  isVatRegistered: boolean;
}
```

#### 💰 **3. Tax & Shipping Settings**
```typescript
interface TaxSettings {
  tax_rate: number;
  currency: string;
  pricesIncludeTax: boolean;
  showPricesWithTax: boolean;
  enableTaxExempt: boolean;
  invoiceFooterText: string;
}

interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  enableLocalDelivery: boolean;
}
```

#### 🔔 **4. Notification Settings**
```typescript
interface NotificationSettings {
  categories: {
    orders: NotificationCategory;
    inventory: NotificationCategory;
    customers: NotificationCategory;
    system: NotificationCategory;
  };
}

interface NotificationCategory {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}
```

#### 🔧 **5. System Settings**
```typescript
interface SystemSettings {
  maintenance_mode: boolean;
  debug_mode: boolean;
  enable_reviews: boolean;
  enable_wishlist: boolean;
  enable_notifications: boolean;
  session_timeout: number;
  max_login_attempts: number;
  backup_frequency: string;
  cache_duration: number;
}
```

---

## 🔐 User Authentication & Permissions

### **`users` Table** (System Users)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `string` | PRIMARY KEY | User identifier (UUID) |
| `email` | `string` | NOT NULL, UNIQUE | User email |
| `full_name` | `string` | NULLABLE | User full name |
| `role` | `string` | NOT NULL | User role |
| `user_role` | `string` | NULLABLE | Additional role info |
| `created_at` | `timestamp` | DEFAULT: `now()` | Creation timestamp |
| `updated_at` | `timestamp` | DEFAULT: `now()` | Last update timestamp |

### **Admin Permissions System**
```typescript
type AdminPermission = 
  | 'admin.clients.read'
  | 'admin.clients.write'
  | 'admin.clients.delete'
  | 'admin.products.read'
  | 'admin.products.write'
  | 'admin.products.delete'
  | 'admin.orders.read'
  | 'admin.orders.write'
  | 'admin.orders.delete'
  | 'admin.settings.read'
  | 'admin.settings.write'
  | 'admin.analytics.read'
  | 'admin.system.manage';
```

---

## 📊 Data Management Features

### **Pagination Configuration**
```typescript
interface PaginationConfig {
  page: number;        // Current page (1-based)
  limit: number;       // Items per page
  total: number;       // Total items count
  totalPages: number;  // Total pages count
}
```

### **Sorting Configuration**
```typescript
interface SortConfig {
  field: string;                    // Field to sort by
  direction: 'asc' | 'desc';       // Sort direction
}
```

### **Filtering Configuration**
```typescript
interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}
```

### **Export/Import Options**
```typescript
interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  fields?: string[];
  filters?: FilterConfig[];
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ImportOptions {
  format: 'csv' | 'xlsx' | 'json';
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
}
```

---

## 🚀 API Endpoints Summary

### **Client Management**
- `GET /api/admin/client-management` - List clients
- `POST /api/admin/client-management` - Create client
- `PUT /api/admin/client-management/[id]` - Update client
- `DELETE /api/admin/client-management/[id]` - Delete client

### **Product Management**
- `GET /api/products` - List products with filtering
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product
- `GET /api/prices` - Get product pricing

### **Order Management**
- `GET /api/admin/orders` - List orders
- `POST /api/admin/orders` - Create order
- `PUT /api/admin/orders/[id]` - Update order
- `DELETE /api/admin/orders/[id]` - Delete order
- `POST /api/admin/orders/[id]/revive` - Revive order

### **Settings Management**
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update settings
- `POST /api/admin/settings/logo` - Upload logo

---

## 🎨 UI/UX Features

### **Hebrew RTL Support**
- ✅ Complete Hebrew interface
- ✅ RTL layout and text direction
- ✅ Hebrew date formatting
- ✅ Localized status labels

### **Responsive Design**
- ✅ Mobile-first approach
- ✅ Adaptive layouts for all screen sizes
- ✅ Touch-friendly interfaces
- ✅ Optimized for tablets and phones

### **Professional Design**
- ✅ Material-UI v7 components
- ✅ Consistent color schemes
- ✅ Modern card layouts
- ✅ Smooth animations and transitions
- ✅ Professional data tables
- ✅ Advanced filtering and search

---

## 📈 Performance & Scalability

### **Database Optimization**
- Indexed primary and foreign keys
- Optimized queries with proper joins
- Row Level Security (RLS) for data access
- Efficient pagination for large datasets

### **Caching Strategy**
- TanStack Query for client-side caching
- Optimistic updates for better UX
- Background data synchronization
- Smart cache invalidation

### **Security Features**
- Supabase authentication integration
- Role-based access control (RBAC)
- API route protection
- Input validation and sanitization

---

## 🔧 Development Tools

### **TypeScript Support**
- Full type safety across the application
- Interface definitions for all data structures
- Compile-time error checking
- IntelliSense support

### **Code Quality**
- ESLint configuration
- Prettier formatting
- Component-based architecture
- Reusable hooks and utilities

---

*This documentation covers all major database schemas and management features in the Mini Catalog E-commerce Admin Panel. The system is designed for scalability, maintainability, and excellent user experience.*
