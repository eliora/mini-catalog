/**
 * @file Client Management API Route
 * @description Handles all CRUD (Create, Read, Update, Delete) operations for users/clients
 * from the admin panel. Each handler is protected and uses a privileged Supabase client
 * obtained from the centralized `createAuthedAdminClient` utility.
 */

import { NextRequest } from 'next/server';
import { AuthError, createAuthedAdminClient } from '@/lib/api/admin/auth';
import { validateCreateClient, validateUpdateClient } from '@/lib/api/admin/validation';
import { 
  parsePaginationParams, 
  parseFilterParams, 
  parseSortParams,
  transformClient,
  buildClientQuery,
  calculateStats,
  buildPaginationResponse,
  buildFiltersResponse
} from '@/lib/api/admin/query-helpers';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  internalErrorResponse
} from '@/lib/api/admin/responses';
import {
  checkEmailExists,
  createClient as createClientService,
  updateClient as updateClientService,
  deleteClient as deleteClientService
} from '@/lib/api/admin/client-service';

/**
 * Handles AuthError by returning the appropriate HTTP response.
 * @param error The AuthError instance.
 * @returns A NextResponse object.
 */
function handleAuthError(error: AuthError) {
  if (error.statusCode === 401) {
    return unauthorizedResponse(error.message);
  }
  return forbiddenResponse(error.message);
}

/**
 * GET handler for listing and searching clients.
 * - Authenticates the request as an admin.
 * - Parses pagination, filtering, and sorting parameters from the URL.
 * - Queries the database and returns a list of clients with metadata.
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    // Parse parameters from the request URL
    const { searchParams } = new URL(request.url);
    const pagination = parsePaginationParams(searchParams);
    const filters = parseFilterParams(searchParams);
    const sort = parseSortParams(searchParams);

    // Build and execute the database query using the authenticated admin client
    const query = buildClientQuery(supabaseAdmin, filters, sort, pagination);
    const { data: clients, error: queryError, count } = await query;

    if (queryError) {
      console.error('Error fetching clients:', queryError);
      return internalErrorResponse('Failed to fetch clients', queryError.message);
    }

    // Transform data for the response
    const transformedClients = clients?.map(transformClient) || [];
    const stats = calculateStats(transformedClients);

    return successResponse({
      clients: transformedClients,
      pagination: buildPaginationResponse(pagination, count || 0),
      filters: buildFiltersResponse(filters),
      sorting: { sortBy: sort.sortBy, sortOrder: sort.sortOrder },
      stats,
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    console.error('Client management GET API error:', error);
    return internalErrorResponse();
  }
}

/**
 * POST handler for creating a new client.
 * - Authenticates the request as an admin.
 * - Validates the incoming request body.
 * - Checks for email conflicts.
 * - Creates the new user in the database.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);
    
    // Parse and validate the request body
    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON in request body', 400);
    }

    const validation = validateCreateClient(body);
    if (!validation.isValid) {
      return validationErrorResponse(validation.errors);
    }
    
    const { email } = validation.cleanData!;
    
    // Check if a user with this email already exists
    const emailExists = await checkEmailExists(supabaseAdmin, email);
    if (emailExists) {
      return conflictResponse('A user with this email already exists.');
    }

    // Create the new client in the database
    const client = await createClientService(supabaseAdmin, validation.cleanData);
    return successResponse({
      client,
      message: 'Client created successfully'
    }, 201);

  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    console.error('Client creation API error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return conflictResponse('A user with this email already exists.');
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return internalErrorResponse('Failed to create client', errorMessage);
  }
}

/**
 * PUT handler for updating an existing client.
 * - Authenticates the request as an admin.
 * - Validates the incoming request body.
 * - Checks for email conflicts if the email is being changed.
 * - Updates the user in the database by their ID.
 */
export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON in request body', 400);
    }
    
    const { id, ...updateData } = body;
    if (!id) {
      return errorResponse('Client ID is required for updates', 400);
    }

    // Validate the update data
    const validation = validateUpdateClient(updateData);
    if (!validation.isValid) {
      return validationErrorResponse(validation.errors);
    }

    if (Object.keys(validation.cleanData!).length === 0) {
      return errorResponse('No valid fields were provided for update', 400);
    }

    // If email is being updated, check if the new email is already taken
    if (validation.cleanData!.email) {
      const emailExists = await checkEmailExists(supabaseAdmin, validation.cleanData!.email, id);
      if (emailExists) {
        return conflictResponse('The new email is already in use by another user.');
      }
    }

    // Perform the update
    const client = await updateClientService(supabaseAdmin, id, validation.cleanData);
    return successResponse({
      client,
      message: 'Client updated successfully'
    });

  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    console.error('Client update API error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
      return notFoundResponse('Client not found');
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return internalErrorResponse('Failed to update client', errorMessage);
  }
}

/**
 * DELETE handler for deactivating (soft delete) or permanently deleting a client.
 * - Authenticates the request as an admin.
 * - Deletes or updates the user based on the `hard` query parameter.
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const hardDelete = searchParams.get('hard') === 'true';

  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    if (!id) {
      return errorResponse('Client ID is required', 400);
    }

    const result = await deleteClientService(supabaseAdmin, id, hardDelete);
    return successResponse(result);

  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    console.error('Client deletion API error:', error);
    if (error instanceof Error && error.message === 'Client not found') {
      return notFoundResponse('Client not found');
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return internalErrorResponse(`Failed to ${hardDelete ? 'delete' : 'deactivate'} client`, errorMessage);
  }
}