/**
 * Individual Order Management API Routes - REFACTORED VERSION
 * 
 * Handles single order operations using modular utilities.
 */

import { NextRequest } from 'next/server';

// Import utilities
import { createAuthedAdminClient } from '@/lib/api/admin/auth';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  internalErrorResponse
} from '@/lib/api/admin/responses';
import { transformOrder } from '@/lib/api/admin/orders-service';

// Helper function to extract order ID from URL
function extractOrderId(url: string): string {
  const pathSegments = url.split('/');
  return pathSegments[pathSegments.length - 1] || '';
}

// GET - Fetch single order
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    const orderId = extractOrderId(request.url);
    if (!orderId) {
      return errorResponse('Invalid order ID in URL', 400);
    }

    // Fetch order with client details
    const { data: order, error } = await supabaseAdmin
      .from('orders')
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
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      if (error.code === 'PGRST116') {
        return notFoundResponse('Order not found');
      }
      return internalErrorResponse('Failed to fetch order', error.message);
    }

    return successResponse({ 
      order: transformOrder(order)
    });

  } catch (error) {
    console.error('Get order API error:', error);
    return internalErrorResponse();
  }
}

// PUT - Update order
export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    const orderId = extractOrderId(request.url);
    if (!orderId) {
      return errorResponse('Invalid order ID in URL', 400);
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON in request body', 400);
    }

    const { client_id, items, total_amount, notes, status } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    // Validate and set fields if provided
    if (client_id !== undefined) {
      // Verify client exists
      const { data: client, error: clientError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', client_id)
        .single();

      if (clientError || !client) {
        return errorResponse('Invalid client ID', 400);
      }
      updateData.client_id = client_id;
    }

    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return errorResponse('Items must be an array', 400);
      }
      updateData.items = JSON.stringify(items);
    }

    if (total_amount !== undefined) {
      if (typeof total_amount !== 'number' || total_amount < 0) {
        return errorResponse('Total amount must be a non-negative number', 400);
      }
      updateData.total_amount = total_amount;
    }

    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    if (status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
      updateData.status = status;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 1) { // Only updated_at
      return errorResponse('No valid fields provided for update', 400);
    }

    // Update order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
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
      console.error('Error updating order:', error);
      if (error.code === 'PGRST116') {
        return notFoundResponse('Order not found');
      }
      return internalErrorResponse('Failed to update order', error.message);
    }

    return successResponse({
      order: transformOrder(order),
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Update order API error:', error);
    return internalErrorResponse();
  }
}

// DELETE - Delete order
export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    const orderId = extractOrderId(request.url);
    if (!orderId) {
      return errorResponse('Invalid order ID in URL', 400);
    }

    // Check if order exists before deletion
    const { error: checkError } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return notFoundResponse('Order not found');
      }
      console.error('Error checking order existence:', checkError);
      return internalErrorResponse('Failed to verify order existence');
    }

    // Delete order
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error);
      return internalErrorResponse('Failed to delete order', error.message);
    }

    return successResponse({
      message: 'Order deleted successfully',
      deletedOrderId: orderId
    });

  } catch (error) {
    console.error('Delete order API error:', error);
    return internalErrorResponse();
  }
}