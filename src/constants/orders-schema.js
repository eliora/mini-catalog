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

  // Order status definitions
  statuses: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  // Status flow definitions
  statusFlow: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
  },

  // Status display names
  statusLabels: {
    pending: 'ממתין לאישור',
    confirmed: 'מאושר',
    processing: 'בעיבוד',
    shipped: 'נשלח',
    delivered: 'נמסר',
    cancelled: 'בוטל'
  },

  // Status colors for UI
  statusColors: {
    pending: '#ff9800',
    confirmed: '#2196f3',
    processing: '#9c27b0',
    shipped: '#00bcd4',
    delivered: '#4caf50',
    cancelled: '#f44336'
  },

  // Item structure for JSONB items field
  itemStructure: {
    product_ref: 'string',
    quantity: 'number',
    unit_price: 'number',
    total_price: 'number',
    product_name: 'string'
  },

  // RLS Policies
  policies: [
    'Users can view their own orders',
    'Admins can view all orders',
    'Users can create orders',
    'Admins can update order status'
  ]
};

// Helper functions for working with orders
export const ORDERS_HELPERS = {
  // Calculate total from items
  calculateTotal: (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      return total + (item.total_price || (item.unit_price * item.quantity) || 0);
    }, 0);
  },

  // Validate order items
  validateItems: (items) => {
    if (!Array.isArray(items)) return { isValid: false, errors: ['Items must be an array'] };
    
    const errors = [];
    items.forEach((item, index) => {
      if (!item.product_ref) {
        errors.push(`Item ${index + 1}: Product reference is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Valid quantity is required`);
      }
      if (!item.unit_price || item.unit_price < 0) {
        errors.push(`Item ${index + 1}: Valid unit price is required`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Get status display name
  getStatusLabel: (status) => {
    return ORDERS_TABLE.statusLabels[status] || status;
  },

  // Get status color
  getStatusColor: (status) => {
    return ORDERS_TABLE.statusColors[status] || '#666';
  },

  // Check if status transition is valid
  canTransitionTo: (currentStatus, newStatus) => {
    const allowedTransitions = ORDERS_TABLE.statusFlow[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  },

  // Get next possible statuses
  getNextStatuses: (currentStatus) => {
    return ORDERS_TABLE.statusFlow[currentStatus] || [];
  },

  // Format order number
  formatOrderNumber: (orderId) => {
    if (!orderId) return '';
    return `#${orderId.substring(0, 8).toUpperCase()}`;
  },

  // Calculate order age in days
  getOrderAge: (createdAt) => {
    if (!createdAt) return 0;
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Check if order is overdue
  isOverdue: (order, maxDays = 7) => {
    const age = ORDERS_HELPERS.getOrderAge(order.created_at);
    return age > maxDays && ['pending', 'confirmed', 'processing'].includes(order.status);
  },

  // Get order summary
  getOrderSummary: (order) => {
    const itemCount = Array.isArray(order.items) ? order.items.length : 0;
    const totalQuantity = Array.isArray(order.items) 
      ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      : 0;
    
    return {
      itemCount,
      totalQuantity,
      totalAmount: order.total_amount || 0,
      status: order.status,
      statusLabel: ORDERS_HELPERS.getStatusLabel(order.status),
      statusColor: ORDERS_HELPERS.getStatusColor(order.status),
      orderNumber: ORDERS_HELPERS.formatOrderNumber(order.id),
      age: ORDERS_HELPERS.getOrderAge(order.created_at),
      isOverdue: ORDERS_HELPERS.isOverdue(order)
    };
  },

  // Validate order data
  validateOrder: (orderData) => {
    const errors = [];
    
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.push('Order must contain at least one item');
    }
    
    if (orderData.total_amount === undefined || orderData.total_amount < 0) {
      errors.push('Valid total amount is required');
    }
    
    if (orderData.status && !Object.values(ORDERS_TABLE.statuses).includes(orderData.status)) {
      errors.push('Invalid order status');
    }
    
    const itemsValidation = ORDERS_HELPERS.validateItems(orderData.items);
    if (!itemsValidation.isValid) {
      errors.push(...itemsValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// SQL queries for common operations
export const ORDERS_QUERIES = {
  // Select order by ID
  SELECT_BY_ID: `
    SELECT * FROM public.orders 
    WHERE id = $1
  `,
  
  // Select orders by client ID
  SELECT_BY_CLIENT: `
    SELECT * FROM public.orders 
    WHERE client_id = $1 
    ORDER BY created_at DESC
  `,
  
  // Select orders by status
  SELECT_BY_STATUS: `
    SELECT * FROM public.orders 
    WHERE status = $1 
    ORDER BY created_at DESC
  `,
  
  // Select recent orders
  SELECT_RECENT: `
    SELECT * FROM public.orders 
    ORDER BY created_at DESC 
    LIMIT $1 OFFSET $2
  `,
  
  // Insert new order
  INSERT_ORDER: `
    INSERT INTO public.orders (items, total_amount, status, notes, client_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
  
  // Update order status
  UPDATE_STATUS: `
    UPDATE public.orders 
    SET status = $2, updated_at = now()
    WHERE id = $1
    RETURNING *
  `,
  
  // Update order
  UPDATE_ORDER: `
    UPDATE public.orders 
    SET items = $2, total_amount = $3, status = $4, notes = $5, updated_at = now()
    WHERE id = $1
    RETURNING *
  `,
  
  // Delete order
  DELETE_ORDER: `
    DELETE FROM public.orders 
    WHERE id = $1 
    RETURNING *
  `,
  
  // Get orders with client info
  SELECT_WITH_CLIENT: `
    SELECT o.*, u.email as client_email, u.full_name as client_name
    FROM public.orders o
    LEFT JOIN public.users u ON o.client_id = u.id
    ORDER BY o.created_at DESC
    LIMIT $1 OFFSET $2
  `,
  
  // Get order statistics
  SELECT_STATS: `
    SELECT 
      status,
      COUNT(*) as count,
      SUM(total_amount) as total_revenue,
      AVG(total_amount) as avg_order_value
    FROM public.orders 
    WHERE created_at >= $1
    GROUP BY status
  `,
  
  // Get overdue orders
  SELECT_OVERDUE: `
    SELECT * FROM public.orders 
    WHERE status IN ('pending', 'confirmed', 'processing')
      AND created_at < NOW() - INTERVAL '$1 days'
    ORDER BY created_at ASC
  `,
  
  // Search orders
  SEARCH_ORDERS: `
    SELECT o.*, u.email as client_email, u.full_name as client_name
    FROM public.orders o
    LEFT JOIN public.users u ON o.client_id = u.id
    WHERE 
      o.id::text ILIKE $1 OR 
      u.email ILIKE $1 OR 
      u.full_name ILIKE $1 OR
      o.notes ILIKE $1
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3
  `
};

// Order template for new orders
export const ORDER_TEMPLATE = {
  items: [],
  total_amount: 0.00,
  status: 'pending',
  notes: null,
  client_id: null
};

// Order item template
export const ORDER_ITEM_TEMPLATE = {
  product_ref: '',
  quantity: 1,
  unit_price: 0.00,
  total_price: 0.00,
  product_name: ''
};

export default ORDERS_TABLE;
