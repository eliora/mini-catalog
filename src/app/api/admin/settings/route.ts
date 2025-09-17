/**
 * Settings Management API Routes - REFACTORED VERSION
 * 
 * Handles company settings and configuration using modular utilities.
 */

import { NextRequest } from 'next/server';

// Import utilities
import { createAuthedAdminClient, AuthError } from '@/lib/api/admin/auth';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  forbiddenResponse,
  internalErrorResponse
} from '@/lib/api/admin/responses';
import {
  getSettings,
  updateSettings,
  validateSettings
} from '@/lib/api/admin/settings-service';

// GET - Retrieve company settings
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    // Get settings
    const settings = await getSettings(supabaseAdmin);
    return successResponse({ settings });

  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return forbiddenResponse('Admin access required');
    }
    console.error('Settings GET API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return internalErrorResponse('Failed to retrieve settings', errorMessage);
  }
}

// PUT - Update company settings
export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = await createAuthedAdminClient(request);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return errorResponse('Invalid JSON in request body', 400);
    }

    // Validate settings
    const validation = validateSettings(body);
    if (!validation.isValid) {
      return validationErrorResponse(validation.errors);
    }

    // Update settings
    const settings = await updateSettings(supabaseAdmin, body);
    return successResponse({
      settings,
      message: 'Settings updated successfully'
    });

  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return forbiddenResponse('Admin access required');
    }
    console.error('Settings PUT API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return internalErrorResponse('Failed to update settings', errorMessage);
  }
}