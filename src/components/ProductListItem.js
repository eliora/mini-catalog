import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Grid, Typography, Chip, IconButton, Stack, Box, TextField, useTheme, useMediaQuery
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, ExpandMore as ExpandMoreIcon, Lock as LockIcon } from '@mui/icons-material';
import { useCatalogMode } from '../hooks/useCatalogMode';
import { useCompany } from '../context/CompanyContext';
import { getProductDetails } from '../api/products';
import ProductAccordionContent from './product/ProductAccordionContent';
import usePricing from '../hooks/usePricing';

const ProductListItem = ({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onQuantityChange,
  onImageClick,
  shouldRenderContent,
  parseJsonField,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { getPriceDisplayProps, shouldShowOrderFunctionality } = useCatalogMode();
  const { settings } = useCompany();
  const { canViewPrices, formatPrice, shouldShowPricePlaceholder, getPricingMessage } = usePricing();
  
  // Get formatted price for this product
  const priceInfo = canViewPrices ? formatPrice(product.ref) : null;
  
  // State for accordion data lazy loading
  const [accordionData, setAccordionData] = React.useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);
  const unloadTimerRef = React.useRef(null);
  
  // Load detailed data when accordion is expanded, unload when closed (with delay)
  const handleAccordionExpand = async (event, isExpanded) => {
    console.log('🔍 Accordion expand triggered for product:', product.ref, 'isExpanded:', isExpanded);
    if (isExpanded) {
      // Clear any pending unload timer
      if (unloadTimerRef.current) {
        clearTimeout(unloadTimerRef.current);
        unloadTimerRef.current = null;
      }
      
      // Load data if not already loaded
      if (!accordionData && !isLoadingDetails) {
        console.log('🔄 Loading accordion details for product:', product.ref);
        setIsLoadingDetails(true);
        try {
          const details = await getProductDetails(product.ref);
          console.log('✅ Accordion details loaded for product:', product.ref, details);
          setAccordionData(details);
        } catch (error) {
          console.error('❌ Failed to load product details for accordion:', error);
        } finally {
          setIsLoadingDetails(false);
        }
      } else {
        console.log('ℹ️ Accordion data already loaded or loading in progress');
      }
    } else {
      console.log('🔽 Accordion collapsed, setting unload timer for product:', product.ref);
      // Set timer to unload data after 30 seconds to save memory
      const timer = setTimeout(() => {
        setAccordionData(null);
        console.log('🗑️ Accordion data unloaded for product:', product.ref);
      }, 30000);
      unloadTimerRef.current = timer;
    }
  };

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (unloadTimerRef.current) {
        clearTimeout(unloadTimerRef.current);
      }
    };
  }, []); // Empty dependency array - cleanup on unmount only

  // Display price based on catalog mode
  const priceDisplayProps = getPriceDisplayProps;

  return (
    <Accordion
      elevation={1}
      onChange={handleAccordionExpand}
      sx={{
        '&:before': { display: 'none' },
        borderRadius: '12px !important',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        '&.Mui-expanded': {
          margin: '8px 0',
          boxShadow: 2,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={(e) => {
          // Prevent expansion when clicking on quantity controls
          if (e.target.closest('.quantity-controls')) {
            e.stopPropagation();
          }
        }}
        sx={{
          backgroundColor: 'background.paper',
          minHeight: isMobile ? 80 : 96,
          '& .MuiAccordionSummary-content': {
            margin: { xs: '8px 0', md: '12px 0' },
            alignItems: 'center',
          },
        }}
      >
        <Box sx={{ width: '100%' }}>
          {isMobile ? (
            /* Mobile Layout: Compact spacing, ref under pic */
            <Grid container spacing={1} alignItems="center">
              {/* Product Image + Ref under it */}
              <Grid item xs="auto">
                <Stack spacing={0.5} alignItems="center">
                  <Box
                    component="img"
                    src={product.mainPic || product.main_pic}
                    alt={product.productName || product.hebrew_name}
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageClick && onImageClick(product.mainPic || product.main_pic);
                    }}
                    sx={{
                      width: 50,
                      height: 50,
                      objectFit: 'contain',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      p: 0.3
                    }}
                  />
                  {/* Smaller Ref chip under image */}
                  <Chip 
                    label={product.ref}
                    variant="outlined"
                    size="small"
                    color="primary"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      height: 20,
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                </Stack>
              </Grid>

              {/* Product Names + Description - Compact */}
              <Grid item xs>
                <Stack spacing={0.1}>
                  {/* Hebrew Name */}
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.1,
                      fontSize: '0.95rem'
                    }}
                  >
                    {product.productName || product.hebrew_name}
                  </Typography>
                  
                  {/* English Name */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}
                  >
                    {product.productName2 || product.english_name}
                  </Typography>
                  
                  {/* Short Description - compact */}
                  {product.short_description_he && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        fontStyle: 'italic',
                        fontSize: '0.7rem',
                        lineHeight: 1.2
                      }}
                    >
                      {product.short_description_he}
                    </Typography>
                  )}
                </Stack>
              </Grid>

              {/* Price + Size and Quantity Controls */}
              <Grid item xs="auto">
                <Stack spacing={1} alignItems="center">
                  {/* Price + Size */}
                  <Stack spacing={0.2} alignItems="center">
                    {canViewPrices ? (
                      priceInfo && (
                        <Box>
                          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {priceInfo.display}
                          </Typography>
                          {priceInfo.isDiscounted && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ textDecoration: 'line-through', fontSize: '0.7rem' }}
                            >
                              {priceInfo.original}
                            </Typography>
                          )}
                        </Box>
                      )
                    ) : shouldShowPricePlaceholder() ? (
                      <Stack direction="row" alignItems="center" spacing={0.3}>
                        <LockIcon sx={{ fontSize: '0.8rem' }} color="action" />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          Login
                        </Typography>
                      </Stack>
                    ) : null}
                    {product.size && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.65rem',
                          color: 'text.secondary',
                          textAlign: 'center'
                        }}
                      >
                        {product.size}
                      </Typography>
                    )}
                  </Stack>
                  
                  {/* Compact Quantity Controls */}
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={0.5}
                    className="quantity-controls"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onDecrement()}
                      disabled={quantity === 0}
                      sx={{ 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        width: 28, 
                        height: 28 
                      }}
                    >
                      <RemoveIcon sx={{ fontSize: '0.8rem' }} />
                    </IconButton>
                    
                    <TextField
                      type="number"
                      size="small"
                      value={quantity}
                      onChange={(e) => onQuantityChange && onQuantityChange(parseInt(e.target.value) || 0)}
                      sx={{
                        width: 50,
                        '& input': { 
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          py: 0.3
                        }
                      }}
                      inputProps={{ min: 0, max: 99 }}
                    />
                    
                    <IconButton
                      size="small"
                      onClick={() => onIncrement()}
                      sx={{ 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        width: 28, 
                        height: 28 
                      }}
                    >
                      <AddIcon sx={{ fontSize: '0.8rem' }} />
                    </IconButton>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          ) : (
            /* Desktop Layout: [ref + product_type] [pic] [product_line + hebrew_name + short_description] [english_name] */
            <Grid container spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
              {/* Ref Number + Product Type */}
              <Grid item xs="auto">
                <Stack spacing={0.3}>
                  <Chip 
                    label={product.ref}
                    variant="outlined"
                    size="small"
                    color="primary"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                  {product.type && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        textAlign: 'center'
                      }}
                    >
                      {product.type}
                    </Typography>
                  )}
                </Stack>
              </Grid>

              {/* Product Image */}
              <Grid item xs="auto">
                <Box
                  component="img"
                  src={product.mainPic || product.main_pic}
                  alt={product.productName || product.hebrew_name}
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageClick && onImageClick(product.mainPic || product.main_pic);
                  }}
                  sx={{
                    width: 60,
                    height: 60,
                    objectFit: 'contain',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    p: 0.5
                  }}
                />
              </Grid>

              {/* Product Line + Hebrew Name + English Name + Short Description */}
              <Grid item xs="auto">
                <Stack spacing={0.1}>
                  {/* Product Line */}
                  {(product.productLine || product.product_line) && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        fontWeight: 500
                      }}
                    >
                      {product.productLine || product.product_line}
                    </Typography>
                  )}
                  
                  {/* Hebrew Name + English Name - Close together */}
                  <Box>
                    <Typography 
                      variant="h6" 
                      component="span"
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        lineHeight: 1.2,
                        mr: 1
                      }}
                    >
                      {product.productName || product.hebrew_name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      component="span"
                      sx={{ 
                        fontStyle: 'italic',
                        color: 'text.secondary'
                      }}
                    >
                      {product.productName2 || product.english_name}
                    </Typography>
                  </Box>
                  
                  {/* Short Description - close under names */}
                  {product.short_description_he && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontStyle: 'italic',
                        fontSize: '0.8rem',
                        lineHeight: 1.3
                      }}
                    >
                      {product.short_description_he}
                    </Typography>
                  )}
                </Stack>
              </Grid>

              {/* Price + Size and Quantity Controls on the right */}
              <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {/* Price + Size */}
                  <Stack spacing={0.3} alignItems="center">
                    {canViewPrices ? (
                      priceInfo && (
                        <Box>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                            {priceInfo.display}
                          </Typography>
                          {priceInfo.isDiscounted && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ textDecoration: 'line-through' }}
                            >
                              {priceInfo.original}
                            </Typography>
                          )}
                        </Box>
                      )
                    ) : shouldShowPricePlaceholder() ? (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <LockIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {getPricingMessage()}
                        </Typography>
                      </Stack>
                    ) : null}
                    {product.size && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.7rem',
                          color: 'text.secondary',
                          textAlign: 'center'
                        }}
                      >
                        {product.size}
                      </Typography>
                    )}
                  </Stack>
                  
                  {/* Quantity Controls */}
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={1}
                    className="quantity-controls"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onDecrement()}
                      disabled={quantity === 0}
                      sx={{ 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        width: 32, 
                        height: 32 
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    
                    <TextField
                      type="number"
                      size="small"
                      value={quantity}
                      onChange={(e) => onQuantityChange && onQuantityChange(parseInt(e.target.value) || 0)}
                      sx={{
                        width: 60,
                        '& input': { 
                          textAlign: 'center',
                          fontSize: '0.875rem'
                        }
                      }}
                      inputProps={{ min: 0, max: 99 }}
                    />
                    
                    <IconButton
                      size="small"
                      onClick={() => onIncrement()}
                      sx={{ 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        width: 32, 
                        height: 32 
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: { xs: 1, md: 2 }, py: { xs: 1, md: 2 } }}>
        <ProductAccordionContent
          product={product}
          accordionData={accordionData}
          isLoadingDetails={isLoadingDetails}
          shouldRenderContent={shouldRenderContent}
          parseJsonField={parseJsonField}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(ProductListItem);