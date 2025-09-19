/**
 * @file Admin Page Header Component
 * @description Standard header for admin management pages with actions
 * Based on client management header pattern
 */

'use client';

import React from 'react';
import { Box, Button, Typography, Breadcrumbs, Link } from '@mui/material';
import { Add as AddIcon, FileDownload as ExportIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import NextLink from 'next/link';
import { FlexBetween, FlexBox } from '@/components/flex-box';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface AdminPageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  subtitle?: string;

  // Actions
  onAdd?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;

  // Permissions
  canAdd?: boolean;
  canExport?: boolean;

  // Loading states
  refreshing?: boolean;

  // Custom actions
  customActions?: React.ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  breadcrumbs,
  subtitle,
  onAdd,
  onExport,
  onRefresh,
  canAdd = true,
  canExport = true,
  refreshing = false,
  customActions
}) => {
  return (
    <FlexBetween sx={{ mb: 3 }}>
      {/* Title Section */}
      <Box>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs sx={{ mb: 1 }}>
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={index}
                component={NextLink}
                href={crumb.href}
                underline="hover"
                color="inherit"
                sx={{ fontSize: '0.875rem' }}
              >
                {crumb.label}
              </Link>
            ))}
            <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.875rem' }}>
              {title}
            </Typography>
          </Breadcrumbs>
        )}
        <Typography variant="h4" sx={{ fontWeight: 600, mb: subtitle ? 0.5 : 0 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      
      {/* Actions Section */}
      <FlexBox sx={{ gap: 2 }}>
        {/* Custom Actions */}
        {customActions}
        
        {/* Export Button */}
        {onExport && canExport && (
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={onExport}
            sx={{ borderRadius: 2 }}
          >
            ייצא
          </Button>
        )}
        
        {/* Refresh Button */}
        {onRefresh && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={refreshing}
            sx={{ borderRadius: 2 }}
          >
            {refreshing ? 'מרענן...' : 'רענן'}
          </Button>
        )}
        
        {/* Add Button */}
        {onAdd && canAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ 
              borderRadius: 2,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            הוסף חדש
          </Button>
        )}
      </FlexBox>
    </FlexBetween>
  );
};

export default AdminPageHeader;
