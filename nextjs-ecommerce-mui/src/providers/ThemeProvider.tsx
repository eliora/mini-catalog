'use client';

import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createDeepTheme } from '@/theme/deepTheme';

const theme = createDeepTheme();

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MuiThemeProvider theme={theme}>
      <div dir="rtl">
        <CssBaseline />
        {children}
      </div>
    </MuiThemeProvider>
  );
}
