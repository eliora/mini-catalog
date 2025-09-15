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
 */

import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Assessment as ReportsIcon,
  CloudUpload as ImportIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

/**
 * Creates navigation items with current statistics
 * @param {Object} stats - Current dashboard statistics
 * @returns {Array} Navigation items array
 */
export const createNavigationItems = (stats = {}) => [
  { 
    id: 0, 
    label: 'לוח בקרה', 
    icon: <DashboardIcon />, 
    description: 'סקירה כללית של המערכת',
    badge: null
  },
  { 
    id: 1, 
    label: 'מוצרים', 
    icon: <ProductsIcon />, 
    description: 'ניהול קטלוג המוצרים',
    badge: stats.products || 0
  },
  { 
    id: 2, 
    label: 'הזמנות', 
    icon: <OrdersIcon />, 
    description: 'מעקב אחר הזמנות',
    badge: stats.orders || 0
  },
  { 
    id: 3, 
    label: 'לקוחות', 
    icon: <CustomersIcon />, 
    description: 'ניהול בסיס הלקוחות',
    badge: stats.customers || 0
  },
  { 
    id: 4, 
    label: 'דוחות', 
    icon: <ReportsIcon />, 
    description: 'דוחות ואנליטיקה',
    badge: null
  },
  { 
    id: 5, 
    label: 'ייבוא נתונים', 
    icon: <ImportIcon />, 
    description: 'ייבוא מוצרים מקובץ',
    badge: null
  },
  { 
    id: 6, 
    label: 'הגדרות', 
    icon: <SettingsIcon />, 
    description: 'הגדרות מערכת וחברה',
    badge: null
  },
];

/**
 * Navigation item configuration
 */
export const navigationConfig = {
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
    SETTINGS: 6
  },
  
  // Badge colors
  badgeColors: {
    products: 'primary',
    orders: 'secondary',
    customers: 'success'
  }
};

const DashboardNavigation = {
  createNavigationItems,
  navigationConfig
};

export default DashboardNavigation;
