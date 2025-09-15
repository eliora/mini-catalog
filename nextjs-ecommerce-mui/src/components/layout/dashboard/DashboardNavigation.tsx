/**
 * Dashboard Navigation Data - Navigation menu structure
 * 
 * Defines the navigation menu items for the vendor dashboard.
 * Includes icons, labels, descriptions, and badge information.
 * 
 * Features:
 * - Hierarchical menu structure
 * - Icon associations for each menu item
 * - Badge support for showing counts
 * - Hebrew labels and descriptions
 * - Easy configuration and maintenance
 * - TypeScript interfaces and type safety
 */

import React from 'react';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Assessment as ReportsIcon,
  CloudUpload as ImportIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

// Navigation item interface
export interface NavigationItem {
  id: number;
  label: string;
  icon: React.ReactElement;
  description: string;
  badge: number | null;
  route?: string;
  disabled?: boolean;
}

// Dashboard statistics interface
export interface DashboardStats {
  products?: number;
  orders?: number;
  customers?: number;
  pendingOrders?: number;
  lowStock?: number;
  newCustomers?: number;
}

// Navigation configuration interface
export interface NavigationConfig {
  defaultActiveTab: number;
  itemTypes: Record<string, number>;
  badgeColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'>;
  routes: Record<string, string>;
}

/**
 * Creates navigation items with current statistics
 * @param stats - Current dashboard statistics
 * @returns Navigation items array
 */
export const createNavigationItems = (stats: DashboardStats = {}): NavigationItem[] => [
  { 
    id: 0, 
    label: 'לוח בקרה', 
    icon: <DashboardIcon />, 
    description: 'סקירה כללית של המערכת',
    badge: null,
    route: '/admin/dashboard'
  },
  { 
    id: 1, 
    label: 'מוצרים', 
    icon: <ProductsIcon />, 
    description: 'ניהול קטלוג המוצרים',
    badge: stats.products || null,
    route: '/admin/products'
  },
  { 
    id: 2, 
    label: 'הזמנות', 
    icon: <OrdersIcon />, 
    description: 'מעקב אחר הזמנות',
    badge: stats.pendingOrders || null,
    route: '/admin/orders'
  },
  { 
    id: 3, 
    label: 'לקוחות', 
    icon: <CustomersIcon />, 
    description: 'ניהול בסיס הלקוחות',
    badge: stats.newCustomers || null,
    route: '/admin/customers'
  },
  { 
    id: 4, 
    label: 'דוחות', 
    icon: <ReportsIcon />, 
    description: 'דוחות ואנליטיקה',
    badge: null,
    route: '/admin/reports'
  },
  { 
    id: 5, 
    label: 'ייבוא נתונים', 
    icon: <ImportIcon />, 
    description: 'ייבוא מוצרים מקובץ',
    badge: null,
    route: '/admin/import'
  },
  { 
    id: 6, 
    label: 'הגדרות', 
    icon: <SettingsIcon />, 
    description: 'הגדרות מערכת וחברה',
    badge: null,
    route: '/admin/settings'
  },
];

/**
 * Creates additional analytics navigation items
 * @param stats - Current dashboard statistics
 * @returns Additional navigation items for analytics
 */
export const createAnalyticsItems = (stats: DashboardStats = {}): NavigationItem[] => [
  {
    id: 7,
    label: 'אנליטיקה',
    icon: <AnalyticsIcon />,
    description: 'ניתוח נתונים מתקדם',
    badge: null,
    route: '/admin/analytics'
  },
  {
    id: 8,
    label: 'מגמות',
    icon: <TrendingIcon />,
    description: 'מגמות מכירות ולקוחות',
    badge: null,
    route: '/admin/trends'
  },
  {
    id: 9,
    label: 'קטגוריות',
    icon: <CategoryIcon />,
    description: 'ניהול קטגוריות מוצרים',
    badge: stats.lowStock || null,
    route: '/admin/categories'
  }
];

/**
 * Navigation item configuration
 */
export const navigationConfig: NavigationConfig = {
  // Default active tab
  defaultActiveTab: 0,
  
  // Menu item types
  itemTypes: {
    DASHBOARD: 0,
    PRODUCTS: 1,
    ORDERS: 2,
    CUSTOMERS: 3,
    REPORTS: 4,
    IMPORT: 5,
    SETTINGS: 6,
    ANALYTICS: 7,
    TRENDS: 8,
    CATEGORIES: 9,
  },
  
  // Badge colors for different item types
  badgeColors: {
    products: 'primary',
    orders: 'warning',
    customers: 'success',
    pendingOrders: 'error',
    lowStock: 'warning',
    newCustomers: 'success',
  },
  
  // Route mappings
  routes: {
    dashboard: '/admin/dashboard',
    products: '/admin/products',
    orders: '/admin/orders',
    customers: '/admin/customers',
    reports: '/admin/reports',
    import: '/admin/import',
    settings: '/admin/settings',
    analytics: '/admin/analytics',
    trends: '/admin/trends',
    categories: '/admin/categories',
  }
};

/**
 * Get navigation item by ID
 * @param id - Navigation item ID
 * @param stats - Current dashboard statistics
 * @returns Navigation item or undefined
 */
export const getNavigationItemById = (id: number, stats: DashboardStats = {}): NavigationItem | undefined => {
  const allItems = [...createNavigationItems(stats), ...createAnalyticsItems(stats)];
  return allItems.find(item => item.id === id);
};

/**
 * Get navigation item by route
 * @param route - Route path
 * @param stats - Current dashboard statistics
 * @returns Navigation item or undefined
 */
export const getNavigationItemByRoute = (route: string, stats: DashboardStats = {}): NavigationItem | undefined => {
  const allItems = [...createNavigationItems(stats), ...createAnalyticsItems(stats)];
  return allItems.find(item => item.route === route);
};

/**
 * Get badge color for item type
 * @param itemType - Type of navigation item
 * @returns Badge color
 */
export const getBadgeColor = (itemType: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
  return navigationConfig.badgeColors[itemType] || 'primary';
};

// Export all navigation utilities as a default object
const DashboardNavigation = {
  createNavigationItems,
  createAnalyticsItems,
  navigationConfig,
  getNavigationItemById,
  getNavigationItemByRoute,
  getBadgeColor,
};

export default DashboardNavigation;

