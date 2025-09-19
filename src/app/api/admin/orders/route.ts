/**
 * Orders Management API Routes - REFACTORED VERSION
 * 
 * Handles order listing and creation using modular utilities.
 */

import { NextRequest } from 'next/server';
import { Order } from '@/types/order';

// Import utilities
import { createAuthedAdminClient } from '@/lib/api/admin/auth';
import { parsePaginationParams, buildPaginationResponse } from '@/lib/api/admin/query-helpers';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  internalErrorResponse
} from '@/lib/api/admin/responses';
import {
  getOrders,
  createOrder,
  validateOrder
} from '@/lib/api/admin/orders-service';

// GET - List orders with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    // Parse parameters
    const { searchParams } = new URL(request.url);
    const pagination = parsePaginationParams(searchParams);
    
    const filters = {
      status: searchParams.get('status') || undefined,
      client_id: searchParams.get('client_id') || undefined,
      search: searchParams.get('search')?.trim() || undefined,
    };

    // Get orders
    try {
      const result = await getOrders(supabaseAdmin, filters, pagination as unknown as Record<string, unknown>);
      
      return successResponse({
        orders: result.orders,
        pagination: buildPaginationResponse(pagination, result.total),
        filters: {
          applied: filters,
          available: {
            statuses: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']
          }
        },
        stats: {
          total: result.total,
          pending: result.orders.filter((o: Order) => o.status === 'pending').length,
          processing: result.orders.filter((o: Order) => o.status === 'processing').length,
          completed: result.orders.filter((o: Order) => ['delivered', 'completed'].includes(o.status)).length,
        }
      });
    } catch (error: unknown) {
      console.error('Error fetching orders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return internalErrorResponse('Failed to fetch orders', errorMessage);
    }

  } catch (error) {
    console.error('Orders GET API error:', error);
    return internalErrorResponse();
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON in request body', 400);
    }

    // Validate order data
    const validation = validateOrder(body);
    if (!validation.isValid) {
      return validationErrorResponse(validation.errors);
    }

    // Create order
    try {
      const order = await createOrder(supabaseAdmin, body);
      return successResponse({
        order,
        message: 'Order created successfully'
      }, 201);
    } catch (error: unknown) {
      console.error('Error creating order:', error);
      
      if (error instanceof Error && error.message === 'Invalid client_id') {
        return errorResponse('Invalid client ID', 400);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return internalErrorResponse('Failed to create order', errorMessage);
    }

  } catch (error) {
    console.error('Order creation API error:', error);
    return internalErrorResponse();
  }
}