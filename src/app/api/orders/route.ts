import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { OrderRow, OrderInsert, OrderUpdate } from '@/types/order';
import { ApiResponse } from '@/types/api';

// GET /api/orders - Get all orders
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, data } as ApiResponse<OrderRow[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    // Validate required fields
    if (!body.customer_name || !body.total_amount || !body.items) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: customer_name, total_amount, items' 
        } as ApiResponse<null>,
        { status: 400 }
      );
    }
    
    // Prepare order data according to the database schema
    const orderData: OrderInsert = {
      client_id: body.client_id || null, // Optional for anonymous orders
      total_amount: parseFloat(body.total_amount),
      items: body.items, // JSON field
      status: body.status || 'pending',
      notes: body.notes || body.customer_name, // Use customer_name as notes if no notes provided
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, data } as ApiResponse<OrderRow>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// PUT /api/orders - Update order (requires order ID in body)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: id' 
        } as ApiResponse<null>,
        { status: 400 }
      );
    }
    
    // Prepare update data according to the database schema
    const updateData: OrderUpdate = {
      client_id: body.client_id,
      total_amount: body.total ? parseFloat(body.total) : undefined,
      items: body.items,
      status: body.status,
      notes: body.notes,
      updated_at: new Date().toISOString(),
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof OrderUpdate] === undefined) {
        delete updateData[key as keyof OrderUpdate];
      }
    });
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Order not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data } as ApiResponse<OrderRow>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in PUT /api/orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// DELETE /api/orders - Delete order (requires order ID in body or query)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    if (!orderId) {
      // Try to get ID from body
      try {
        const body = await request.json();
        if (!body.id) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Missing required parameter: id (in query or body)' 
            } as ApiResponse<null>,
            { status: 400 }
          );
        }
        
        const { data, error } = await supabase
          .from('orders')
          .delete()
          .eq('id', body.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error deleting order:', error);
          return NextResponse.json(
            { success: false, error: error.message } as ApiResponse<null>,
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { success: true, data } as ApiResponse<OrderRow>,
          { status: 200 }
        );
      } catch {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Missing required parameter: id' 
          } as ApiResponse<null>,
          { status: 400 }
        );
      }
    }
    
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      console.error('Error deleting order:', error);
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Order not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data } as ApiResponse<OrderRow>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
