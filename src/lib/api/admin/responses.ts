/**
 * Standardized API Response Helpers
 */

import { NextResponse } from 'next/server';

export function successResponse(data: Record<string, unknown>, status = 200) {
  return NextResponse.json({
    success: true,
    ...data
  }, { status });
}

export function errorResponse(error: string, status = 500, details?: unknown) {
  const response: Record<string, unknown> = {
    success: false,
    error
  };
  
  if (details) {
    response.details = details;
  }
  
  return NextResponse.json(response, { status });
}

export function validationErrorResponse(errors: string[]) {
  return errorResponse('Validation failed', 400, errors);
}

export function unauthorizedResponse(message = 'Authentication required') {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Access denied') {
  return errorResponse(message, 403);
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}

export function conflictResponse(message = 'Resource already exists') {
  return errorResponse(message, 409);
}

export function internalErrorResponse(message = 'Internal server error', details?: unknown) {
  return errorResponse(message, 500, details);
}

/**
 * Handles authentication errors from the auth module
 */
export function handleAuthError(authError: unknown) {
  if ((authError as Error).message?.includes('unauthorized') || (authError as Error).message?.includes('access denied')) {
    return forbiddenResponse('Admin access required');
  }
  return unauthorizedResponse('Authentication failed');
}
