'use client';

/**
 * CartBadge Component - Hydration-safe cart badge
 * 
 * Handles the cart count display with proper SSR/hydration compatibility.
 * Prevents hydration mismatches by ensuring consistent server/client rendering.
 */

import React, { useState, useEffect } from 'react';
import { Badge, IconButton, IconButtonProps } from '@mui/material';
import { ShoppingCartOutlined as CartIcon } from '@mui/icons-material';

interface CartBadgeProps extends Omit<IconButtonProps, 'children'> {
  cartItemCount: number;
  onCartClick?: () => void;
}

const CartBadge: React.FC<CartBadgeProps> = ({ 
  cartItemCount, 
  onCartClick, 
  ...iconButtonProps 
}) => {
  const [mounted, setMounted] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);

  // Ensure hydration safety by only showing cart count after mount
  useEffect(() => {
    setMounted(true);
    setDisplayCount(cartItemCount);
  }, [cartItemCount]);

  // Update display count when cart changes, but only after mounting
  useEffect(() => {
    if (mounted) {
      setDisplayCount(cartItemCount);
    }
  }, [cartItemCount, mounted]);

  return (
    <IconButton 
      color="inherit" 
      onClick={onCartClick}
      sx={{ p: 1 }}
      aria-label={`Shopping cart with ${mounted ? displayCount : 0} items`}
      {...iconButtonProps}
    >
      <Badge 
        badgeContent={mounted ? displayCount : 0}
        color="secondary"
        max={99}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.75rem',
            minWidth: 18,
            height: 18
          }
        }}
      >
        <CartIcon />
      </Badge>
    </IconButton>
  );
};

export default CartBadge;
