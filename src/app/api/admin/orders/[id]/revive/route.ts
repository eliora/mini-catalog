import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const params = await context.params;
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      client_id, 
      items, 
      total_amount, 
      notes, 
      payment_status = 'pending' 
    } = body;

    // Validate required fields
    if (!client_id || !items || !total_amount) {
      return NextResponse.json({ 
        error: 'Missing required fields for order revival: client_id, items, total_amount' 
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

    // Check if order exists and can be revived
    const { data: existingOrder, error: orderCheckError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', params.id)
      .single();

    if (orderCheckError || !existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow revival of completed or cancelled orders
    if (!['completed', 'cancelled'].includes(existingOrder.status)) {
      return NextResponse.json({ 
        error: 'Only completed or cancelled orders can be revived' 
      }, { status: 400 });
    }

    // Update order with new data and set status to processing
    const { data: revivedOrder, error: reviveError } = await supabase
      .from('orders')
      .update({
        client_id,
        items: JSON.stringify(items),
        total_amount,
        notes,
        status: 'processing', // Revival automatically sets to processing
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
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

    if (reviveError) {
      console.error('Error reviving order:', reviveError);
      return NextResponse.json({ error: 'Failed to revive order' }, { status: 500 });
    }

    // Process revived order data
    const processedOrder = {
      ...revivedOrder,
      parsedItems: Array.isArray(revivedOrder.items) ? revivedOrder.items : JSON.parse(revivedOrder.items || '[]'),
      formattedTotal: new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS'
      }).format(revivedOrder.total_amount),
      statusLabel: 'מעובד' // Processing in Hebrew
    };

    return NextResponse.json({ 
      order: processedOrder,
      message: 'Order revived successfully and set to processing status'
    });

  } catch (error) {
    console.error('Revive order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

