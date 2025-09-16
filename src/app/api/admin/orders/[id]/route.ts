import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
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

    const { data: order, error } = await supabase
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
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Process order data
    const processedOrder = {
      ...order,
      parsedItems: Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]'),
      formattedTotal: new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS'
      }).format(order.total_amount),
      statusLabel: getStatusLabel(order.status)
    };

    return NextResponse.json({ order: processedOrder });

  } catch (error) {
    console.error('Get order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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
    const { client_id, items, total_amount, notes, status } = body;

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (client_id !== undefined) {
      // Verify client exists if client_id is being updated
      const { data: client, error: clientError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', client_id)
        .single();

      if (clientError || !client) {
        return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });
      }
      updateData.client_id = client_id;
    }

    if (items !== undefined) {
      updateData.items = JSON.stringify(items);
    }

    if (total_amount !== undefined) {
      updateData.total_amount = total_amount;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
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

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Update order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting order:', error);
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Order deleted successfully' });

  } catch (error) {
    console.error('Delete order API error:', error);
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

