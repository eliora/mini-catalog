/**
 * AdminTabsRenderer Component - Centralized tab content rendering
 * 
 * Manages rendering of different admin dashboard tabs.
 * Extracted from main Admin component for better maintainability.
 * 
 * Features:
 * - Dashboard overview tab
 * - Products management tab
 * - Orders management tab
 * - Placeholder tabs for future features
 * - Data import tab
 * - Settings tab
 * 
 * Props:
 * - activeTab: Current active tab index
 * - Various data and handlers for each tab
 */

import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

// Tab components
import DashboardOverview from '../DashboardOverview';
import AdminProductsTable from '../data/AdminProductsTable';
import AdminOrdersTable from '../data/AdminOrdersTable';
import CsvImport from '../forms/CsvImport';
import CompanySettings from '../forms/CompanySettings';
import AdminSystemInfo from '../AdminSystemInfo';

const AdminTabsRenderer = ({
  activeTab,
  dashboardStats,
  orders,
  products,
  loading,
  formatDate,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewOrder,
  onEditOrder,
  onReviveOrder,
  onImportComplete
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Dashboard Overview
        return (
          <DashboardOverview 
            stats={dashboardStats}
            recentOrders={Array.isArray(orders) ? orders.slice(0, 10) : []}
          />
        );
        
      case 1: // Products
        return (
          <AdminProductsTable
            products={products}
            loading={loading}
            onAddProduct={onAddProduct}
            onEditProduct={onEditProduct}
            onDeleteProduct={onDeleteProduct}
          />
        );
        
      case 2: // Orders
        return (
          <AdminOrdersTable
            orders={orders}
            loading={loading}
            onViewOrder={onViewOrder}
            onEditOrder={onEditOrder}
            onReviveOrder={onReviveOrder}
            formatDate={formatDate}
          />
        );
        
      case 3: // Customers (placeholder)
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              ניהול לקוחות
            </Typography>
            <Typography variant="body1" color="text.secondary">
              תכונה זו תהיה זמינה בקרוב...
            </Typography>
          </Box>
        );
        
      case 4: // Reports (placeholder)
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              דוחות ואנליטיקה
            </Typography>
            <Typography variant="body1" color="text.secondary">
              תכונה זו תהיה זמינה בקרוב...
            </Typography>
          </Box>
        );
        
      case 5: // Import
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              ייבוא נתונים
            </Typography>
            <CsvImport onImportComplete={onImportComplete} />
          </Box>
        );
        
      case 6: // Settings
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              הגדרות מערכת
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <CompanySettings />
              </Grid>
              
              <Grid item xs={12}>
                <AdminSystemInfo />
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return renderTabContent();
};

export default React.memo(AdminTabsRenderer);
