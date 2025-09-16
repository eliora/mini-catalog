import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const clientId = searchParams.get('client_id');
    const search = searchParams.get('search');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query with client information joined
    let query = supabase
      .from('orders')
      .select(`
        *,
        client:profiles!orders_client_id_fkey (
          id,
          name,
          email,
          phone_number,
          business_name,
          address,
          user_roles,
          status
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (search) {
      // Search in client name or email
      query = query.or(`client.name.ilike.%${search}%, client.email.ilike.%${search}%`);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('orders')
      .select('count', { count: 'exact' });

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    if (clientId) {
      countQuery = countQuery.eq('client_id', clientId);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching orders count:', countError);
      return NextResponse.json({ error: 'Failed to fetch orders count' }, { status: 500 });
    }

    // Process orders data
    const processedOrders = orders?.map(order => ({
      ...order,
      parsedItems: Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]'),
      formattedTotal: new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS'
      }).format(order.total_amount),
      statusLabel: getStatusLabel(order.status)
    })) || [];

    return NextResponse.json({
      orders: processedOrders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { client_id, items, total_amount, notes, status = 'pending' } = body;

    // Validate required fields
    if (!client_id || !items || !total_amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: client_id, items, total_amount' 
      }, { status: 400 });
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id,
        items: JSON.stringify(items),
        total_amount,
        notes,
        status
      })
      .select(`
        *,
        client:profiles!orders_client_id_fkey (
          id,
          name,
          email,
          phone_number,
          business_name,
          address,
          user_roles,
          status
        )
      `)
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({ order }, { status: 201 });

  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: 'ממתין',
    processing: 'מעובד',
    shipped: 'נשלח',
    delivered: 'נמסר',
    completed: 'הושלם',
    cancelled: 'בוטל'
  };
  return statusLabels[status] || status;
}

