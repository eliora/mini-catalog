/**
 * Admin Panel Type Definitions
 * 
 * TypeScript interfaces and types for admin functionality.
 */

// Client Management Types
export interface Client {
  id: string;
  email: string;
  name: string;
  business_name?: string;
  phone_number?: string;
  address?: Address;
  user_roles: UserRole[];
  status: ClientStatus;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

export type ClientStatus = 'active' | 'inactive' | 'suspended';

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// Settings Management Types
export interface CompanySettings {
  id?: number;
  company_name: string;
  tagline?: string;
  description?: string;
  email: string;
  phone: string;
  address: Address;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  tax_rate: number;
  currency: string;
  timezone: string;
  enable_reviews: boolean;
  enable_wishlist: boolean;
  enable_notifications: boolean;
  maintenance_mode: boolean;
  debug_mode: boolean;
  created_at?: string;
  updated_at?: string;
}

// Data Table Types
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}

export interface ColumnConfig<T = any> {
  id: string;
  label: string;
  field: keyof T;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ListResponse<T> {
  items: T[];
  pagination: PaginationConfig;
}

// Bulk Operations
export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

// Admin Permissions
export type AdminPermission = 
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

// Export/Import Types
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  fields?: string[];
  filters?: FilterConfig[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ImportOptions {
  format: 'csv' | 'xlsx' | 'json';
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
}

// Notification Types
export interface AdminNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
}
