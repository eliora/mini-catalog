import React from 'react';
import { Box } from '@mui/material';
import { getThumbnailUrl } from '../../utils/imageHelpers';

const ProductImage = ({ 
  product, 
  onImageClick, 
  size = 80, 
  borderRadius = 1,
  padding = 0.5,
  ...boxProps 
}) => {
  return (
    <Box
      component="img"
      src={getThumbnailUrl(product.mainPic || product.main_pic)}
      alt={product.productName || product.hebrew_name}
      onClick={(e) => {
        e.stopPropagation();
        onImageClick && onImageClick(product.mainPic || product.main_pic);
      }}
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        p: padding,
        ...boxProps.sx
      }}
      {...boxProps}
    />
  );
};

export default React.memo(ProductImage);
