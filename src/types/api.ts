// Generic API response interfaces
export interface ApiResponse<T = any> {
  data?: T;
  error?: string | ApiError;
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
  field?: string; // For validation errors
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  success: boolean;
  error?: string;
}

export interface InfiniteScrollResponse<T = any> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
  success: boolean;
  error?: string;
}

// API request interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  search?: string;
  query?: string;
}

export interface FilterParams {
  [key: string]: any;
}

export interface ApiRequestParams extends PaginationParams, SortParams, SearchParams {
  filters?: FilterParams;
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API endpoint configurations
export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

// Validation error response
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationErrorResponse {
  success: false;
  error: 'VALIDATION_ERROR';
  message: string;
  errors: ValidationError[];
}

// File upload response
export interface FileUploadResponse {
  success: boolean;
  data?: {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  };
  error?: string;
}

// Bulk operation response
export interface BulkOperationResponse<T = any> {
  success: boolean;
  data?: {
    successful: T[];
    failed: Array<{
      item: T;
      error: string;
    }>;
    totalProcessed: number;
    successCount: number;
    failureCount: number;
  };
  error?: string;
}

// Real-time subscription types
export interface RealtimeEvent<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  new?: T;
  old?: T;
  errors?: any[];
}

export interface SubscriptionConfig {
  table: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  schema?: string;
  filter?: string;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    storage: 'up' | 'down';
    auth: 'up' | 'down';
  };
  version: string;
}
