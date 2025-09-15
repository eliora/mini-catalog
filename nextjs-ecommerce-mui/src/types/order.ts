import { Database } from './supabase';
import { Product } from './product';

// Supabase generated types
export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

// Application-specific Order interfaces
export interface Order extends OrderRow {
  // Parse items JSON into structured data
  parsedItems?: OrderItem[];
  formattedTotal?: string;
  statusLabel?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_type?: string;
  notes?: string;
  // Optional product details for display
  product?: Partial<Product>;
}

export interface OrderFormData {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  notes?: string;
  items: OrderItem[];
}

export interface OrderSummary {
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total: number;
  itemCount: number;
}

export interface OrderStatus {
  value: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface OrderFilter {
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  customerName?: string;
  minAmount?: number;
  maxAmount?: number;
}
