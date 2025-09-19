/**
 * Orders Management Service Layer
 */

export interface OrderItem {
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

export interface Order {
  id: string;
  client_id: string;
  items: OrderItem[] | string;
  total_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Record<string, unknown>;
}

export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: 'ממתין',
    confirmed: 'אושר',
    processing: 'מעובד',
    shipped: 'נשלח',
    delivered: 'נמסר',
    completed: 'הושלם',
    cancelled: 'בוטל'
  };
  return statusLabels[status] || status;
}

export function transformOrder(order: Record<string, unknown>) {
  const client = order.client as Record<string, unknown> | null;
  
  // Determine customer name: use client full_name if available, otherwise use notes field
  const customerName = client?.full_name || order.notes || 'לקוח אנונימי';
  
  return {
    ...order,
    customer_name: customerName, // Add customer_name for easy access
    parsedItems: Array.isArray(order.items) ? order.items : JSON.parse(String(order.items || '[]')),
    formattedTotal: new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(order.total_amount as number),
    statusLabel: getStatusLabel(order.status as string),
    formattedDate: new Date(order.created_at as string).toLocaleDateString('he-IL'),
    itemsCount: Array.isArray(order.items) 
      ? order.items.length 
      : JSON.parse(String(order.items || '[]')).length
  };
}

export async function getOrders(supabase: any, filters: Record<string, unknown>, pagination: Record<string, unknown>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { page, limit } = pagination;
  const offset = ((page as number) - 1) * (limit as number);

  // Build main query - include client data only if client_id exists
  let query = supabase
    .from('orders')
    .select(`
      *,
      client:users!left (
        id,
        full_name,
        email,
        phone_number,
        business_name,
        address,
        user_role,
        status
      )
    `, { count: 'exact' })
    .range(offset, offset + (limit as number) - 1)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.client_id) {
    query = query.eq('client_id', filters.client_id);
  }

  if (filters.search) {
    // Search in order ID, notes (customer names), client name, or email
    query = query.or(`id.ilike.%${filters.search}%, notes.ilike.%${filters.search}%, client.full_name.ilike.%${filters.search}%, client.email.ilike.%${filters.search}%`);
  }

  const { data: orders, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    orders: orders?.map(transformOrder) || [],
    total: count || 0
  };
}

export async function createOrder(supabase: any, orderData: Record<string, unknown>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  // Validate client exists
  const { data: client, error: clientError } = await supabase
    .from('users')
    .select('id')
    .eq('id', orderData.client_id)
    .single();

  if (clientError || !client) {
    throw new Error('Invalid client_id');
  }

  // Create order
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      client_id: orderData.client_id,
      items: JSON.stringify(orderData.items),
      total_amount: orderData.total_amount,
      notes: orderData.notes,
      status: orderData.status || 'pending'
    })
    .select(`
      *,
      client:users!orders_client_id_fkey (
        id,
        full_name,
        email,
        phone_number,
        business_name,
        address,
        user_role,
        status
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return transformOrder(order);
}

export async function deleteOrder(supabase: any, orderId: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
  // Instead of hard deleting, we'll mark the order as cancelled
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cancel order: ${error.message}`);
  }

  return data;
}

export function validateOrder(data: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.client_id) {
    errors.push('Client ID is required');
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (!data.total_amount || typeof data.total_amount !== 'number' || data.total_amount <= 0) {
    errors.push('Total amount must be a positive number');
  }

  // Validate items
  if (data.items && Array.isArray(data.items)) {
    data.items.forEach((item: Record<string, unknown>, index: number) => {
      if (!item.product_id) {
        errors.push(`Item ${index + 1}: Product ID is required`);
      }
      if (!item.quantity || (item.quantity as number) <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be positive`);
      }
      if (!item.unit_price || (item.unit_price as number) <= 0) {
        errors.push(`Item ${index + 1}: Unit price must be positive`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
