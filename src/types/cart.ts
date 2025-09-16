import { Product } from './product';

// Cart-specific interfaces
export interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_type?: string;
  notes?: string;
  // Optional product details for display
  product?: Partial<Product>;
  // UI state
  isUpdating?: boolean;
  hasError?: boolean;
  // Legacy compatibility fields
  product_ref?: string; // Maps to product_id
  ref?: string; // Maps to product_id
  productName?: string; // Maps to product_name
  productName2?: string; // For secondary name
  product_name_2?: string; // For secondary name
  unitPrice?: number; // Maps to unit_price
  size?: string; // Product size
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  lastUpdated: Date;
}

export interface CartState {
  cart: Cart;
  isLoading: boolean;
  error?: string;
  // Actions
  addItem: (product: Product, quantity: number, notes?: string) => Promise<void>;
  updateItem: (productId: string, quantity: number, notes?: string) => Promise<void>;
  updateItemPrice: (productId: string, unitPrice: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  // Legacy aliases for backward compatibility
  addToCart: (product: Product, quantity: number, notes?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  // Calculations
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  // Utilities
  hasItem: (productId: string) => boolean;
  getItem: (productId: string) => CartItem | undefined;
}

export interface CartStorageData {
  items: CartItem[];
  lastUpdated: string;
  version: string;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
  notes?: string;
}

export interface UpdateCartItemRequest {
  product_id: string;
  quantity: number;
  notes?: string;
}

export interface CartCalculation {
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total: number;
  savings?: number;
}
