# 📊 Admin Panel Database Schema Documentation

## 🎯 Overview

This document provides comprehensive documentation for all database schemas, parameters, and management structures used in the Mini Catalog E-commerce Admin Panel.

---

## 🧑‍💼 Client Management Database Schema

### **`users` Table** (Main Client/User Table)
> **Note**: Integrated with Supabase Auth - `users.id` references `auth.users(id)`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, FK to auth.users(id) | Unique user identifier from Supabase Auth |
| `email` | `text` | NOT NULL, UNIQUE | User email address |
| `role` | `text` | NOT NULL, DEFAULT: 'user' | System role (user/admin) |
| `full_name` | `text` | NULLABLE | User full name |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT: now() | Creation timestamp |
| `updated_at` | `timestamp with time zone` | NOT NULL, DEFAULT: now() | Last update timestamp |
| `user_role` | `text` | NULLABLE, DEFAULT: 'standard' | Business role level |
| `business_name` | `text` | NULLABLE | Business/company name |
| `phone_number` | `varchar(50)` | NULLABLE | Contact phone number |
| `address` | `jsonb` | NULLABLE | Structured address object |
| `status` | `varchar(20)` | NULLABLE, DEFAULT: 'active' | Account status |
| `last_login` | `timestamp with time zone` | NULLABLE | Last login timestamp |

### **Role Enum Values**
```typescript
type Role = 'user' | 'admin'
```

### **User Role Enum Values**
```typescript
type UserRole = 'standard' | 'verified_members' | 'customer' | 'admin'
```

### **Status Enum Values**
```typescript
type Status = 'active' | 'inactive' | 'suspended'
```

### **Address Object Structure**
```typescript
interface Address {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}
```

### **Database Constraints**
- `users_role_check`: role ∈ ['user', 'admin']
- `users_status_check`: status ∈ ['active', 'inactive', 'suspended']  
- `users_user_role_check`: user_role ∈ ['standard', 'verified_members', 'customer', 'admin']
- `users_id_fkey`: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE

### **Indexes**
- `idx_users_email` - btree(email)
- `idx_users_role` - btree(role)
- `idx_users_user_role` - btree(user_role)
- `idx_users_status` - btree(status)
- `idx_users_business_name` - btree(business_name)
- `idx_users_phone_number` - btree(phone_number)

### **Triggers**
- `update_users_updated_at` - Auto-update updated_at on row changes
- `sync_user_metadata_trigger` - Sync with auth.users metadata

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
| `active_ingredients_he` | `text` | NULLABLE | Active ingredients (Hebrew) |
| `skin_type_he` | `string` | NULLABLE | Suitable skin types (Hebrew) |
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
| `id` | `uuid` | PRIMARY KEY, DEFAULT: uuid_generate_v4() | Unique order identifier |
| `items` | `jsonb` | NOT NULL, DEFAULT: '[]' | Order items array |
| `total_amount` | `numeric(10,2)` | NOT NULL, DEFAULT: 0.00 | Total order amount |
| `status` | `text` | NOT NULL, DEFAULT: 'pending' | Order status |
| `notes` | `text` | NULLABLE | Order notes/comments |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT: now() | Order creation time |
| `updated_at` | `timestamp with time zone` | NOT NULL, DEFAULT: now() | Last update time |
| `client_id` | `uuid` | NULLABLE, FK to users(id) | Reference to client/user |

### **Order Status Enum Values**
```typescript
type OrderStatus = 
  | 'pending'     // ממתין
  | 'confirmed'   // אושר
  | 'processing'  // מעובד
  | 'shipped'     // נשלח
  | 'delivered'   // נמסר
  | 'cancelled';  // בוטל
```

### **Database Constraints**
- `orders_pkey`: PRIMARY KEY (id)
- `fk_orders_client_id`: FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL
- `orders_status_check`: status ∈ ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

### **Indexes**
- `idx_orders_status` - btree(status)
- `idx_orders_created_at` - btree(created_at)
- `idx_orders_client_id` - btree(client_id)

### **Triggers**
- `update_orders_updated_at` - Auto-update updated_at on row changes

### **Relationships**
- `orders.client_id` → `users.id` (Many-to-One)
- Orders are linked to users (clients) through client_id
- If user is deleted, client_id is set to NULL (soft reference)

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
| `tax_rate` | `number` | DEFAULT: `0.18` | Tax rate (VAT) |
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

### **`users` Table** (System Users & Clients)
> **Note**: This is the same table documented above in Client Management - serves dual purpose

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, FK to auth.users(id) | User identifier from Supabase Auth |
| `email` | `text` | NOT NULL, UNIQUE | User email |
| `full_name` | `text` | NULLABLE | User full name |
| `role` | `text` | NOT NULL, DEFAULT: 'user' | System role (user/admin) |
| `user_role` | `text` | NULLABLE, DEFAULT: 'standard' | Business role level |
| `business_name` | `text` | NULLABLE | Business/company name |
| `phone_number` | `varchar(50)` | NULLABLE | Contact phone number |
| `address` | `jsonb` | NULLABLE | Structured address object |
| `status` | `varchar(20)` | NULLABLE, DEFAULT: 'active' | Account status |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT: now() | Creation timestamp |
| `updated_at` | `timestamp with time zone` | NOT NULL, DEFAULT: now() | Last update timestamp |
| `last_login` | `timestamp with time zone` | NULLABLE | Last login timestamp |

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
