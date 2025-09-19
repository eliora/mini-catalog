/**
 * @file Admin API Query & Data Helpers
 * @description Provides a collection of utility functions for parsing request parameters,
 * building database queries, and transforming data for the admin API responses.
 */

import { USERS_TABLE, USERS_HELPERS } from '@/constants/users-schema.js';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface FilterParams {
  search?: string;
  user_role?: string;
  status?: string;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Parses pagination parameters (`page`, `limit`) from a URLSearchParams object.
 * Includes safety checks to prevent excessively large values.
 * @param searchParams The `URLSearchParams` from the request.
 * @returns A structured `PaginationParams` object.
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

/**
 * Parses filter parameters (`search`, `role`, `status`, etc.) from a URLSearchParams object.
 * Sanitizes search input and validates enum values against the schema.
 * @param searchParams The `URLSearchParams` from the request.
 * @returns A structured `FilterParams` object with only valid filters.
 */
export function parseFilterParams(searchParams: URLSearchParams): FilterParams {
  const search = searchParams.get('search')?.trim() || '';
  const user_role = searchParams.get('user_role') || '';
  const status = searchParams.get('status') || '';

  return {
    search: search ? search.replace(/[<>\"']/g, '') : undefined,
    user_role: user_role && Object.values(USERS_TABLE.enums.USER_ROLES).includes(user_role) ? user_role : undefined,
    status: status && Object.values(USERS_TABLE.enums.STATUS).includes(status) ? status : undefined,
  };
}

/**
 * Parses sorting parameters (`sortBy`, `sortOrder`) from a URLSearchParams object.
 * Ensures that sorting is only applied to allowed, indexed table columns.
 * @param searchParams The `URLSearchParams` from the request.
 * @returns A structured `SortParams` object.
 */
export function parseSortParams(searchParams: URLSearchParams): SortParams {
  const allowedSortFields = ['created_at', 'updated_at', 'full_name', 'email', 'status'];
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

  return {
    sortBy: allowedSortFields.includes(sortBy) ? sortBy : 'created_at',
    sortOrder
  };
}

/**
 * Transforms a raw client object from the database into a format suitable for the API response.
 * This includes adding computed properties like `display_name`, `is_admin`, etc.,
 * and ensuring consistent data structure.
 * @param client The raw user object from the Supabase query.
 * @returns A transformed client object.
 */
export function transformClient(client: Record<string, unknown>) {
  // Fallback helper functions if USERS_HELPERS is not available
  const getDisplayName = (cli: Record<string, unknown>) => {
    if (cli.full_name) return cli.full_name;
    if (cli.business_name) return cli.business_name;
    return cli.email;
  };

  const formatAddress = (address: unknown) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [(address as Record<string, unknown>).street, (address as Record<string, unknown>).city, (address as Record<string, unknown>).postal_code, (address as Record<string, unknown>).country].filter(Boolean);
      return parts.join(', ');
    }
    return '';
  };

  const isAdmin = (cli: Record<string, unknown>) => {
    return cli.user_role === 'admin';
  };

  const isVerifiedMember = (cli: Record<string, unknown>) => {
    return cli.user_role === 'verified_members';
  };

  const isActive = (cli: Record<string, unknown>) => {
    return cli.status === 'active';
  };

  // Extract city from address if it's an object
  let city = '';
  if (client.address && typeof client.address === 'object' && (client.address as Record<string, unknown>).city) {
    city = (client.address as Record<string, unknown>).city as string;
  }

  try {
    return {
      ...client,
      city, // Add city as a separate field for easier editing
      display_name: USERS_HELPERS?.getDisplayName ? USERS_HELPERS.getDisplayName(client) : getDisplayName(client),
      formatted_address: USERS_HELPERS?.formatAddress ? USERS_HELPERS.formatAddress(client.address) : formatAddress(client.address),
      is_admin: USERS_HELPERS?.isAdmin ? USERS_HELPERS.isAdmin(client) : isAdmin(client),
      is_verified: USERS_HELPERS?.isVerifiedMember ? USERS_HELPERS.isVerifiedMember(client) : isVerifiedMember(client),
      is_active: USERS_HELPERS?.isActive ? USERS_HELPERS.isActive(client) : isActive(client),
      avatar_initials: (client.full_name as string)?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??',
      last_activity: client.last_login ? new Date(client.last_login as string).toLocaleDateString('he-IL') : 'אף פעם',
    };
  } catch {
    console.warn('USERS_HELPERS not available, using fallback logic');
    return {
      ...client,
      city, // Add city as a separate field for easier editing
      display_name: getDisplayName(client),
      formatted_address: formatAddress(client.address),
      is_admin: isAdmin(client),
      is_verified: isVerifiedMember(client),
      is_active: isActive(client),
      avatar_initials: (client.full_name as string)?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??',
      last_activity: client.last_login ? new Date(client.last_login as string).toLocaleDateString('he-IL') : 'אף פעם',
    };
  }
}

/**
 * Constructs a Supabase query builder instance for fetching clients.
 * It dynamically applies filtering, sorting, and pagination based on the parsed parameters.
 * @param supabase A Supabase client instance.
 * @param filters The parsed filter parameters.
 * @param sort The parsed sorting parameters.
 * @param pagination The parsed pagination parameters.
 * @returns A Supabase query builder instance. The caller is responsible for `await`ing it.
 */
export function buildClientQuery(supabase: any, filters: FilterParams, sort: SortParams, pagination: PaginationParams) { // eslint-disable-line @typescript-eslint/no-explicit-any
  let query = supabase
    .from('users')
    .select(`
      id, email, full_name, user_role,
      business_name, phone_number, address, status,
      created_at, updated_at, last_login
    `, { count: 'exact' });

  // Apply search filter
  if (filters.search) {
    query = query.or([
      `full_name.ilike.%${filters.search}%`,
      `email.ilike.%${filters.search}%`,
      `business_name.ilike.%${filters.search}%`,
      `phone_number.ilike.%${filters.search}%`
    ].join(','));
  }

  // Apply individual filters
  if (filters.user_role) query = query.eq('user_role', filters.user_role);
  if (filters.status) query = query.eq('status', filters.status);

  // Apply sorting and pagination
  query = query
    .order(sort.sortBy, { ascending: sort.sortOrder === 'asc' })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  return query;
}

export function calculateStats(clients: Record<string, unknown>[]) {
  return {
    total: clients.length,
    active: clients.filter(c => c.is_active).length,
    admins: clients.filter(c => c.is_admin).length,
    verified: clients.filter(c => c.is_verified).length,
  };
}

export function buildPaginationResponse(pagination: PaginationParams, count: number) {
  return {
    page: pagination.page,
    limit: pagination.limit,
    total: count,
    totalPages: Math.ceil(count / pagination.limit),
    hasNextPage: pagination.offset + pagination.limit < count,
    hasPreviousPage: pagination.page > 1,
  };
}

export function buildFiltersResponse(filters: FilterParams) {
  return {
    applied: filters,
    available: {
      user_roles: Object.values(USERS_TABLE.enums.USER_ROLES),
      statuses: Object.values(USERS_TABLE.enums.STATUS),
    },
  };
}
