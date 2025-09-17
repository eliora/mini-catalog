/**
 * Order Revival API Route - REFACTORED VERSION
 * 
 * Handles order revival using modular utilities.
 */

import { NextRequest } from 'next/server';

// Import utilities
import { createAuthedAdminClient, AuthError } from '@/lib/api/admin/auth';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse
} from '@/lib/api/admin/responses';
import { transformOrder, validateOrder } from '@/lib/api/admin/orders-service';

// Helper function to extract order ID from URL
function extractOrderId(url: string): string {
  const pathSegments = url.split('/');
  const reviveIndex = pathSegments.findIndex(segment => segment === 'revive');
  return pathSegments[reviveIndex - 1] || '';
}

// Helper function to validate order can be revived
function canReviveOrder(status: string): boolean {
  return ['completed', 'cancelled', 'delivered'].includes(status);
}

// POST - Revive order
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    // Extract order ID from URL
    const orderId = extractOrderId(request.url);
    if (!orderId) {
      return errorResponse('Invalid order ID in URL', 400);
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return errorResponse('Invalid JSON in request body', 400);
    }

    const { client_id, items, total_amount, notes } = body;

    // Validate required fields
    if (!client_id || !items || !Array.isArray(items) || typeof total_amount !== 'number') {
      return errorResponse(
        'Missing or invalid required fields: client_id (string), items (array), total_amount (number)', 
        400
      );
    }

    if (items.length === 0) {
      return errorResponse('Order must contain at least one item', 400);
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      return errorResponse('Client not found or invalid client_id', 400);
    }

    // Check if order exists and get current status
    const { data: existingOrder, error: orderCheckError } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();

    if (orderCheckError || !existingOrder) {
      return notFoundResponse('Order not found');
    }

    // Validate order can be revived
    if (!canReviveOrder(existingOrder.status)) {
      return errorResponse(
        `Cannot revive order with status '${existingOrder.status}'. Only completed, cancelled, or delivered orders can be revived.`,
        400
      );
    }

    // Update order with new data
    const updateData = {
      client_id,
      items: JSON.stringify(items),
      total_amount,
      notes: notes || null,
      status: 'processing', // Revival automatically sets to processing
      updated_at: new Date().toISOString()
    };

    const { data: revivedOrder, error: reviveError } = await supabaseAdmin
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

    if (reviveError) {
      console.error('Error reviving order:', reviveError);
      return internalErrorResponse('Failed to revive order', reviveError.message);
    }

    // Format and return successful response
    const processedOrder = transformOrder(revivedOrder);

    return successResponse({
      order: processedOrder,
      message: 'Order revived successfully and set to processing status',
      previousStatus: existingOrder.status
    });

  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return forbiddenResponse('Admin access required');
    }
    console.error('Revive order API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return internalErrorResponse('Failed to revive order', errorMessage);
  }
}