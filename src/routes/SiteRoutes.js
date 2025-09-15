/**
 * Site Routes Configuration
 * 
 * Route configuration for site-level pages including the quick payment page.
 * This can be integrated into your main App.js routing setup.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import site pages
import { QuickPaymentPage } from '../pages/site';

const SiteRoutes = () => {
  return (
    <Routes>
      {/* Quick Payment Page */}
      <Route 
        path="/site/quickpayment" 
        element={<QuickPaymentPage />} 
      />
      
      {/* Redirect /quickpayment to /site/quickpayment for backward compatibility */}
      <Route 
        path="/quickpayment" 
        element={<Navigate to="/site/quickpayment" replace />} 
      />
      
      {/* You can add more site routes here */}
      {/* 
      <Route path="/site/contact" element={<ContactPage />} />
      <Route path="/site/about" element={<AboutPage />} />
      */}
    </Routes>
  );
};

export default SiteRoutes;
