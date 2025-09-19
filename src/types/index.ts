// Main types barrel export - Re-export all types for easy importing

// Supabase generated types
export type { Database } from './supabase';

// Product types
export type {
  Product,
  ProductRow,
  ProductInsert,
  ProductUpdate,
  ProductWithPricing,
  PriceInfo,
  BulkPrice,
  ProductFilter,
  ProductListResponse
} from './product';

// Order types
export type {
  Order,
  OrderRow,
  OrderInsert,
  OrderUpdate,
  OrderItem,
  OrderFormData,
  OrderSummary,
  OrderStatus,
  OrderListResponse,
  OrderFilter
} from './order';

// Cart types
export type {
  CartItem,
  Cart,
  CartState,
  CartStorageData,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartCalculation
} from './cart';

// Auth types
export type {
  AuthUser,
  UserProfile,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  AuthState,
  SignInFormData,
  SignUpFormData,
  ResetPasswordFormData,
  UpdateProfileFormData,
  AuthError,
  AuthResponse,
  UserRole,
  RolePermissions,
  AuthConfig
} from './auth';

// Company types
export type {
  CompanySettings,
  CompanySettingsRow,
  CompanySettingsInsert,
  CompanySettingsUpdate,
  SocialLink,
  CompanyState,
  ContactInfo,
  CompanyFormData,
  InvoiceSettings,
  BrandingSettings,
  BusinessHours,
  DayHours,
  CompanyResponse
} from './company';

// API types
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  InfiniteScrollResponse,
  PaginationParams,
  SortParams,
  SearchParams,
  FilterParams,
  ApiRequestParams,
  HttpMethod,
  ApiEndpoint,
  ValidationError,
  ValidationErrorResponse,
  FileUploadResponse,
  BulkOperationResponse,
  RealtimeEvent,
  SubscriptionConfig,
  HealthCheckResponse
} from './api';

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Common UI types
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DialogState {
  open: boolean;
  data?: unknown;
}

export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}
