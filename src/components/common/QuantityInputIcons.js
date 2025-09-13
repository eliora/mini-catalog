/**
 * Custom Icons for QuantityInput Component
 * 
 * Provides custom Plus and Minus icons with consistent styling
 * using Material-UI's createSvgIcon utility.
 */

import { createSvgIcon } from '@mui/material/utils';

// Custom Plus Icon using proper SVG path
export const PlusIcon = createSvgIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
  'Plus'
);

// Custom Minus Icon using proper SVG path  
export const MinusIcon = createSvgIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />,
  'Minus'
);
