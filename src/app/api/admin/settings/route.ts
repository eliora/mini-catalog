/**
 * Settings Management API Routes - REFACTORED VERSION
 * 
 * Handles company settings and configuration using modular utilities.
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Import utilities
import { verifyAdminAccess } from '@/lib/api/admin/auth';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
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
    const supabase = await createClient();
    
    // Verify admin access
    const authResult = await verifyAdminAccess(supabase);
    if (!authResult.success) {
      return authResult.error === 'Authentication required' 
        ? unauthorizedResponse(authResult.error)
        : forbiddenResponse(authResult.error);
    }

    // Get settings
    try {
      const settings = await getSettings(supabase);
      return successResponse({ settings });
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      return internalErrorResponse('Failed to fetch settings', error.message);
    }

  } catch (error) {
    console.error('Settings GET API error:', error);
    return internalErrorResponse();
  }
}

// PUT - Update company settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify admin access
    const authResult = await verifyAdminAccess(supabase);
    if (!authResult.success) {
      return authResult.error === 'Authentication required' 
        ? unauthorizedResponse(authResult.error)
        : forbiddenResponse(authResult.error);
    }

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
    try {
      const settings = await updateSettings(supabase, body);
      return successResponse({
        settings,
        message: 'Settings updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      return internalErrorResponse('Failed to update settings', error.message);
    }

  } catch (error) {
    console.error('Settings PUT API error:', error);
    return internalErrorResponse();
  }
}