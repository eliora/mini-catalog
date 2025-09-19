/**
 * Admin Page Header Component
 * 
 * Consistent header for admin pages with title, subtitle, breadcrumbs, and actions.
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions
}) => {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if not provided
  const defaultBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs) return breadcrumbs;

    const segments = pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/admin' }
    ];

    let path = '';
    segments.slice(1).forEach((segment) => {
      path += `/${segment}`;
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      crumbs.push({
        label,
        href: `/admin${path}`
      });
    });

    // Don't make the current page a link
    if (crumbs.length > 0) {
      crumbs[crumbs.length - 1].href = undefined;
    }

    return crumbs;
  }, [pathname, breadcrumbs]);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 3,
        py: 2
      }}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 1 }}
      >
        {defaultBreadcrumbs.map((crumb, index) => {
          if (crumb.href) {
            return (
              <Link
                key={index}
                component={NextLink}
                href={crumb.href}
                underline="none"
                color="inherit"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem'
                }}
              >
                {index === 0 && <HomeIcon sx={{ mr: 0.5, fontSize: '1rem' }} />}
                {crumb.label}
              </Link>
            );
          }

          return (
            <Typography
              key={index}
              color="text.primary"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {crumb.label}
            </Typography>
          );
        })}
      </Breadcrumbs>

      {/* Title and Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2.125rem' },
              lineHeight: 1.2,
              mb: subtitle ? 0.5 : 0
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1rem' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminPageHeader;
