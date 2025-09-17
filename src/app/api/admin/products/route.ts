/**
 * @file Admin Products API Route
 * @description Handles CRUD operations for products management.
 */

import { NextRequest } from 'next/server';
import { createAuthedAdminClient, AuthError } from '@/lib/api/admin/auth';
import { validateCreateProduct, validateUpdateProduct } from '@/lib/api/admin/product-validation';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getProducts, 
  getProductStats,
  getProductLines,
  getProductTypes,
  checkRefExists 
} from '@/lib/api/admin/product-service';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  conflictResponse, 
  notFoundResponse,
  internalErrorResponse,
  handleAuthError 
} from '@/lib/api/admin/responses';

/**
 * GET handler for retrieving products with filtering and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const product_line = searchParams.get('product_line') || '';
    const product_type = searchParams.get('product_type') || '';
    const stock_status = searchParams.get('stock_status') || '';
    const include_stats = searchParams.get('include_stats') === 'true';
    const include_filters = searchParams.get('include_filters') === 'true';

    // Get products
    const result = await getProducts(supabaseAdmin, {
      page,
      limit,
      search,
      product_line,
      product_type,
      stock_status
    });

    const responseData: Record<string, unknown> = {
      products: result.products,
      pagination: result.pagination
    };

    // Include stats if requested
    if (include_stats) {
      responseData.stats = await getProductStats(supabaseAdmin);
    }

    // Include filter options if requested
    if (include_filters) {
      const [productLines, productTypes] = await Promise.all([
        getProductLines(supabaseAdmin),
        getProductTypes(supabaseAdmin)
      ]);

      responseData.filters = {
        available_product_lines: productLines,
        available_product_types: productTypes,
        available_stock_statuses: ['in_stock', 'low_stock', 'out_of_stock']
      };
    }

    return successResponse(responseData);

  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    console.error('Products GET API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return internalErrorResponse('Failed to fetch products', errorMessage);
  }
}

/**
 * POST handler for creating a new product.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);
    
    // Parse and validate the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return errorResponse('Invalid JSON in request body', 400);
    }

    const validation = validateCreateProduct(body);
    if (!validation.isValid) {
      return validationErrorResponse(validation.errors);
    }
    
    const { ref } = validation.cleanData!;
    
    // Check if a product with this reference already exists
    const refExists = await checkRefExists(supabaseAdmin, ref);
    if (refExists) {
      return conflictResponse('A product with this reference already exists.');
    }

    // Create the new product in the database
    const product = await createProduct(supabaseAdmin, validation.cleanData);
    return successResponse({
      product,
      message: 'Product created successfully'
    }, 201);

  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    console.error('Product creation API error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return conflictResponse('A product with this reference already exists.');
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return internalErrorResponse('Failed to create product', errorMessage);
  }
}

/**
 * PUT handler for updating an existing product.
 */
export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return errorResponse('Invalid JSON in request body', 400);
    }

    const { id, ...updateData } = body;
    if (!id) {
      return errorResponse('Product ID is required for updates', 400);
    }

    // Validate the update data
    const validation = validateUpdateProduct(updateData);
    if (!validation.isValid) {
      return validationErrorResponse(validation.errors);
    }

    if (Object.keys(validation.cleanData!).length === 0) {
      return errorResponse('No valid fields were provided for update', 400);
    }

    // If reference is being updated, check if the new reference is already taken
    if (validation.cleanData!.ref) {
      const refExists = await checkRefExists(supabaseAdmin, validation.cleanData!.ref, id);
      if (refExists) {
        return conflictResponse('The new reference is already in use by another product.');
      }
    }

    // Perform the update
    const product = await updateProduct(supabaseAdmin, id, validation.cleanData);
    return successResponse({
      product,
      message: 'Product updated successfully'
    });

  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    console.error('Product update API error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      return notFoundResponse('Product not found');
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return internalErrorResponse('Failed to update product', errorMessage);
  }
}

/**
 * DELETE handler for removing a product.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Product ID is required', 400);
    }

    await deleteProduct(supabaseAdmin, id);
    return successResponse({
      message: 'Product deleted successfully'
    });

  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    console.error('Product deletion API error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      return notFoundResponse('Product not found');
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return internalErrorResponse('Failed to delete product', errorMessage);
  }
}
