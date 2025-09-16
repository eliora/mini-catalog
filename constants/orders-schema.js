// ============================================================================
// ORDERS TABLE SCHEMA - Database Constants
// ============================================================================
// Complete schema definition for the orders table
// ============================================================================

export const ORDERS_TABLE = {
  name: 'orders',
  schema: 'public',
  
  // Column definitions
  columns: {
    id: {
      type: 'uuid',
      nullable: false,
      primary: true,
      default: 'extensions.uuid_generate_v4()'
    },
    items: {
      type: 'jsonb',
      nullable: false,
      default: '[]'
    },
    total_amount: {
      type: 'numeric(10,2)',
      nullable: false,
      default: 0.00
    },
    status: {
      type: 'text',
      nullable: false,
      default: 'pending',
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    notes: {
      type: 'text',
      nullable: true
    },
    created_at: {
      type: 'timestamp with time zone',
      nullable: false,
      default: 'now()'
    },
    updated_at: {
      type: 'timestamp with time zone',
      nullable: false,
      default: 'now()'
    },
    client_id: {
      type: 'uuid',
      nullable: true,
      references: 'users(id)',
      onDelete: 'SET NULL'
    }
  },

  // Constraints
  constraints: {
    primary: 'orders_pkey',
    foreign: ['fk_orders_client_id'],
    check: ['orders_status_check']
  },

  // Indexes
  indexes: [
    'idx_orders_status',
    'idx_orders_created_at',
    'idx_orders_client_id'
  ],

  // Triggers
  triggers: [
    'update_orders_updated_at'
  ],

  // Enums for validation
  enums: {
    STATUS: {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      PROCESSING: 'processing',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled'
    }
  },

  // Status flow definitions
  statusFlow: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [], // Final status
    cancelled: [] // Final status
  },

  // RLS Policies
  policies: [
    'Users can view own orders',
    'Users can create orders',
    'Users can update own orders',
    'Users can delete own orders',
    'Admins can manage all orders',
    'Staff can view processing orders'
  ]
};

// Helper functions for working with orders
export const ORDERS_HELPERS = {
  // Check if status can be changed
  canChangeStatus: (currentStatus, newStatus) => {
    return ORDERS_TABLE.statusFlow[currentStatus]?.includes(newStatus) || false;
  },
  
  // Check if order can be edited by user
  canUserEdit: (order) => {
    return ['pending', 'confirmed'].includes(order?.status);
  },
  
  // Check if order can be cancelled
  canCancel: (order) => {
    return ['pending', 'confirmed', 'processing'].includes(order?.status);
  },
  
  // Calculate total from items
  calculateTotal: (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  },
  
  // Format order status for display
  formatStatus: (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  },
  
  // Get status color for UI
  getStatusColor: (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'primary',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  },
  
  // Validate order items structure
  validateItems: (items) => {
    if (!Array.isArray(items)) return false;
    return items.every(item => 
      item.product_id && 
      item.product_name && 
      typeof item.quantity === 'number' && 
      typeof item.unit_price === 'number'
    );
  }
};

// SQL queries for common operations
export const ORDERS_QUERIES = {
  // Select order by ID
  SELECT_BY_ID: `
    SELECT * FROM public.orders WHERE id = $1
  `,
  
  // Select user's orders
  SELECT_USER_ORDERS: `
    SELECT * FROM public.orders 
    WHERE client_id = $1 
    ORDER BY created_at DESC
  `,
  
  // Select orders with client info (using view)
  SELECT_WITH_CLIENTS: `
    SELECT * FROM public.orders_with_clients 
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `,
  
  // Create new order
  INSERT_ORDER: `
    INSERT INTO public.orders (client_id, items, total_amount, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
  
  // Update order status
  UPDATE_STATUS: `
    UPDATE public.orders 
    SET status = $2, notes = COALESCE($3, notes)
    WHERE id = $1
    RETURNING *
  `,
  
  // Update order items and total
  UPDATE_ORDER: `
    UPDATE public.orders 
    SET items = $2, total_amount = $3, notes = $4
    WHERE id = $1 AND client_id = $5
    RETURNING *
  `,
  
  // Get orders by status
  SELECT_BY_STATUS: `
    SELECT * FROM public.orders 
    WHERE status = $1 
    ORDER BY created_at DESC
  `,
  
  // Get order statistics
  SELECT_STATS: `
    SELECT 
      status,
      COUNT(*) as count,
      SUM(total_amount) as total_value
    FROM public.orders 
    GROUP BY status
  `,
  
  // Search orders
  SEARCH_ORDERS: `
    SELECT o.*, u.full_name as client_name, u.email as client_email
    FROM public.orders o
    LEFT JOIN public.users u ON o.client_id = u.id
    WHERE 
      u.full_name ILIKE $1 OR 
      u.email ILIKE $1 OR 
      o.notes ILIKE $1
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3
  `
};

// Order item structure template
export const ORDER_ITEM_TEMPLATE = {
  product_id: '', // Product reference/SKU
  product_name: '', // Product display name
  quantity: 1, // Number of items
  unit_price: 0.00, // Price per unit
  total_price: 0.00, // quantity * unit_price
  // Optional fields
  product_image: '',
  product_description: '',
  discount: 0.00
};

export default ORDERS_TABLE;

