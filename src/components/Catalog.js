import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Button,
  TextField,
  Typography,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
  CardMedia,
  Stack,
  Divider,
  Badge,
  Fab,
  useTheme,
  useMediaQuery,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ShoppingCart as CartIcon,
  ExpandMore as ExpandMoreIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { getProducts, getProductLines } from '../api/products';
import ProductCard from './ProductCard';
import ProductListItem from './ProductListItem';

const Catalog = () => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [imageZoom, setImageZoom] = useState({ open: false, src: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    // Load from localStorage or default to 'catalog'
    return localStorage.getItem('catalogViewMode') || 'catalog';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [productLines, setProductLines] = useState([]);

  useEffect(() => {
    loadProducts();
    loadProductLines();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      const msg = (error && error.message) || error || 'שגיאת רשת';
      setError('שגיאה בטעינת מוצרים: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const loadProductLines = async () => {
    try {
      const data = await getProductLines();
      setProductLines(data);
    } catch (error) {
      console.error('Error loading product lines:', error);
    }
  };

  // Filter products based on search and line
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.ref?.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.productName?.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.productName2?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (selectedLine) {
      filtered = filtered.filter(product => product.line === selectedLine);
    }

    return filtered;
  }, [products, searchTerm, selectedLine]);

  // Get current quantity for a product directly from the cart.
  const getCurrentQuantity = useCallback((productRef) => {
    const cartItem = cart.find(item => item.ref === productRef);
    return cartItem ? cartItem.quantity : 0;
  }, [cart]);

  const handleQuantityChange = (ref, value) => {
    const numValue = parseInt(value, 10);
    const newQuantity = isNaN(numValue) ? 0 : Math.max(0, numValue);

    const product = products.find(p => p.ref === ref);
    if (!product) return;

    const cartItem = cart.find(i => i.ref === ref);

    if (newQuantity === 0) {
      if (cartItem) removeFromCart(ref);
    } else {
      if (cartItem) {
        updateQuantity(ref, newQuantity);
      } else {
        addToCart(product, newQuantity);
      }
    }
  };

  const handleIncrement = useCallback((product) => {
    const current = getCurrentQuantity(product.ref);
    const next = Math.min(99, current + 1);
    
    if (current > 0) {
      updateQuantity(product.ref, next);
    } else {
      addToCart(product, next);
    }
  }, [getCurrentQuantity, addToCart, updateQuantity]);

  const handleDecrement = useCallback((product) => {
    const current = getCurrentQuantity(product.ref);
    const next = Math.max(0, current - 1);
    
    if (next === 0) {
      removeFromCart(product.ref);
    } else {
      updateQuantity(product.ref, next);
    }
  }, [getCurrentQuantity, updateQuantity, removeFromCart]);

  const handleZoom = (src) => {
    setImageZoom({ open: true, src });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedLine('');
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode) {
      setViewMode(newMode);
      localStorage.setItem('catalogViewMode', newMode);
    }
  };

  const parseJsonField = (field) => {
    // Accept JSON arrays or delimited strings (",", "|", ";")
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field !== 'string') return [];
    const trimmed = field.trim();
    if (!trimmed) return [];
    try {
      if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (_) {
      // fall through to delimiter parsing
    }
    return trimmed
      .split(/[,|;\n]/)
      .map(s => s.trim())
      .filter(Boolean);
  };

  const shouldRenderContent = (value) => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed || trimmed === '[]' || trimmed === '""' || trimmed === 'null' || trimmed === 'undefined') return false;
    return true;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container maxWidth="lg" sx={{ direction: 'rtl', py: 3 }}>
      
      {/* Sticky Mobile Header */}
      {isMobile && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            borderRadius: 0,
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              
              {/* Left: Cart Info */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<CartIcon />}
                  onClick={() => window.location.href = '/order'}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    minWidth: 'auto'
                  }}
                >
                  {totalCartItems || 0}
                </Button>
                
                {totalCartItems > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.location.href = '/order'}
                    sx={{ 
                      textTransform: 'none',
                      borderColor: 'primary.contrastText',
                      color: 'primary.contrastText',
                      '&:hover': {
                        borderColor: 'primary.contrastText',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    הזמן
                  </Button>
                )}
              </Stack>

              {/* Center: Title */}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                קטלוג
              </Typography>

              {/* Right: Quick Category Switch */}
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                  displayEmpty
                  sx={{ 
                    color: 'primary.contrastText',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.contrastText'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.contrastText'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.contrastText'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'primary.contrastText'
                    }
                  }}
                >
                  <MenuItem value="">כל</MenuItem>
                  {productLines.map((line) => (
                    <MenuItem key={line} value={line}>
                      {line.length > 10 ? line.substring(0, 10) + '...' : line}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
        </Paper>
      )}
      
      {/* Add padding for mobile sticky header */}
      <Box sx={{ height: isMobile ? 8 : 0 }} />
      


      {/* Search and Filter Section */}
      <Paper 
        elevation={1}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack spacing={3}>
          
          {/* Search Bar */}
          <Box>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                textAlign: 'right',
                mb: 1.5
              }}
            >
              חיפוש מוצרים
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="חיפוש לפי מספר מוצר או שם..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchTerm('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
          
          {/* Filter Controls */}
          <Stack 
            direction={isSmall ? "column" : "row"} 
            spacing={2} 
            alignItems={isSmall ? "stretch" : "flex-end"}
          >
            
            {/* Category Filter */}
            <Box sx={{ flex: isSmall ? 'unset' : 1, maxWidth: isSmall ? 'unset' : 300 }}>
              <Typography 
                variant="subtitle2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  textAlign: 'right',
                  mb: 1
                }}
              >
                סינון לפי קטגוריה
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilterIcon fontSize="small" />
                      כל הקטגוריות
                    </Box>
                  </MenuItem>
                  {productLines.map((line) => (
                    <MenuItem key={line} value={line}>
                      {line}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Clear Filter Button */}
            {(selectedLine || searchTerm) && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ClearIcon />}
                onClick={handleClearSearch}
                sx={{ 
                  borderRadius: 2,
                  minWidth: 100,
                  alignSelf: 'flex-end',
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                נקה
              </Button>
            )}
          </Stack>
          
          {/* View Mode Toggle - Compact Row */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            py: 1,
            px: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: 'text.secondary'
              }}
            >
              תצוגה:
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{ 
                '& .MuiToggleButton-root': {
                  borderRadius: 1,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem',
                  border: 'none',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  },
                  '&:not(.Mui-selected)': {
                    backgroundColor: 'transparent',
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }
                }
              }}
            >
              <ToggleButton value="catalog" aria-label="catalog view">
                <ViewModuleIcon fontSize="small" sx={{ mr: 0.5 }} />
                רשת
              </ToggleButton>
              <ToggleButton value="compact" aria-label="compact view">
                <ViewListIcon fontSize="small" sx={{ mr: 0.5 }} />
                רשימה
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {/* Active Filters Only */}
          {(selectedLine || searchTerm) && (
            <Stack direction="row" spacing={1} alignItems="center">
              {selectedLine && (
                <Chip 
                  label={selectedLine}
                  color="secondary"
                  variant="outlined"
                  size="small"
                  onDelete={() => setSelectedLine('')}
                />
              )}
              {searchTerm && (
                <Chip 
                  label={`חיפוש: "${searchTerm}"`}
                  color="default"
                  variant="outlined"
                  size="small"
                  onDelete={() => setSearchTerm('')}
                />
              )}
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Products Display - Conditional Rendering */}
      {viewMode === 'catalog' ? (
        /* Catalog Mode - Card Grid */
        <Grid container spacing={isSmall ? 1 : 2}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.ref}>
              <ProductCard
                product={product}
                quantity={getCurrentQuantity(product.ref)}
                onDecrement={handleDecrement}
                onIncrement={handleIncrement}
                onQuantityChange={handleQuantityChange}
                onInfoClick={setSelectedProduct}
                onImageClick={handleZoom}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        /* Compact Mode - Clean List */
        <Stack spacing={0.5}>
          {filteredProducts.map((product) => (
            <ProductListItem
              key={product.ref}
              product={product}
              quantity={getCurrentQuantity(product.ref)}
              onDecrement={handleDecrement}
              onIncrement={handleIncrement}
              onQuantityChange={handleQuantityChange}
              onImageClick={handleZoom}
              shouldRenderContent={shouldRenderContent}
              parseJsonField={parseJsonField}
            />
          ))}
        </Stack>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            לא נמצאו מוצרים
          </Typography>
          <Typography variant="body2" color="text.secondary">
            נסה לשנות את מילות החיפוש או הסינון
          </Typography>
        </Paper>
      )}

      {/* Floating Cart Button */}
      {totalCartItems > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            zIndex: 1000,
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Badge badgeContent={totalCartItems} color="error">
            <CartIcon />
          </Badge>
        </Fab>
      )}

      {/* Product Details Dialog */}
      <Dialog 
        open={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isSmall}
      >
        {selectedProduct && (
          <>
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: isSmall ? 2 : 3 }}>
                <Stack spacing={2} direction="rtl">
                  {/* Product Header */}
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    {selectedProduct.mainPic && (
                      <CardMedia
                        component="img"
                        src={selectedProduct.mainPic}
                        alt={selectedProduct.productName}
                        crossOrigin="anonymous"
                        sx={{
                          width: isSmall ? 80 : 120,
                          height: isSmall ? 80 : 120,
                          objectFit: 'contain',
                          borderRadius: 2,
                          backgroundColor: 'grey.50',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleZoom(selectedProduct.mainPic)}
                        onError={(e) => {
                          console.warn('Product image load failed:', selectedProduct.mainPic);
                          if (e.currentTarget.src !== selectedProduct.mainPic) {
                            e.currentTarget.src = selectedProduct.mainPic;
                          } else {
                            e.currentTarget.src = 'https://via.placeholder.com/120x120/cccccc/666666?text=אין+תמונה';
                          }
                        }}
                        onLoad={() => {
                          console.log('Product image loaded successfully:', selectedProduct.mainPic);
                        }}
                      />
                    )}
                    
                    <Stack spacing={1} sx={{ flex: 1, textAlign: 'right' }}>
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                        {selectedProduct.productName}
                      </Typography>
                      
                      {selectedProduct.productName2 && (
                        <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {selectedProduct.productName2}
                        </Typography>
                      )}
                      
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Chip label={`#${selectedProduct.ref}`} size="small" variant="outlined" />
                        {selectedProduct.line && (
                          <Chip label={selectedProduct.line} size="small" color="primary" />
                        )}
                      </Stack>
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" color="text.secondary">
                          {selectedProduct.size}
                        </Typography>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                          ${selectedProduct.unitPrice}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* Product Details */}
                  <Stack spacing={2}>
                    {selectedProduct.notice && (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
                          תיאור קצר
                        </Typography>
                        <Typography variant="body1" sx={{ textAlign: 'right' }}>
                          {selectedProduct.notice}
                        </Typography>
                      </Box>
                    )}

                    {/* Detailed Information Accordions */}
                    {shouldRenderContent(selectedProduct.description) && (
                      <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>תיאור מפורט</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box 
                            sx={{ textAlign: 'right' }}
                            dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                          />
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {shouldRenderContent(selectedProduct.activeIngredients) && (
                      <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>מרכיבים פעילים</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box 
                            sx={{ textAlign: 'right' }}
                            dangerouslySetInnerHTML={{ __html: selectedProduct.activeIngredients }}
                          />
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {shouldRenderContent(selectedProduct.usageInstructions) && (
                      <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>הוראות שימוש</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box 
                            sx={{ textAlign: 'right' }}
                            dangerouslySetInnerHTML={{ __html: selectedProduct.usageInstructions }}
                          />
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {/* Additional Images */}
                    {parseJsonField(selectedProduct.pics).length > 0 && (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
                          תמונות נוספות
                        </Typography>
                        <Grid container spacing={1}>
                          {parseJsonField(selectedProduct.pics).map((pic, idx) => (
                            <Grid item key={idx}>
                              <img
                                src={pic}
                                alt={`${selectedProduct.productName} ${idx + 1}`}
                                loading="lazy"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  console.warn('Additional image load failed:', pic);
                                  if (e.currentTarget.src !== pic) {
                                    e.currentTarget.src = pic;
                                  } else {
                                    e.currentTarget.src = 'https://via.placeholder.com/100x100/cccccc/666666?text=אין+תמונה';
                                  }
                                }}
                                onLoad={() => {
                                  console.log('Additional image loaded successfully:', pic);
                                }}
                                style={{
                                  width: 100,
                                  height: 100,
                                  objectFit: 'contain',
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                  backgroundColor: '#f5f5f5'
                                }}
                                onClick={() => handleZoom(pic)}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: isSmall ? 2 : 3, pt: 0 }}>
              <Button onClick={() => setSelectedProduct(null)} sx={{ mr: 'auto' }}>
                סגור
              </Button>
              
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton 
                  size="small" 
                  onClick={() => handleDecrement(selectedProduct)}
                  disabled={getCurrentQuantity(selectedProduct.ref) === 0}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                
                <TextField
                  type="number"
                  size="small"
                  value={getCurrentQuantity(selectedProduct.ref)}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value, 10);
                    if (!isNaN(numValue) && numValue >= 0 && numValue <= 99) {
                      handleQuantityChange(selectedProduct.ref, value === '' ? '0' : numValue.toString());
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (isNaN(value) || value < 0) {
                      handleQuantityChange(selectedProduct.ref, '0');
                    } else if (value > 99) {
                      handleQuantityChange(selectedProduct.ref, '99');
                    }
                  }}
                  sx={{
                    width: 60,
                    '& input': { textAlign: 'center' }
                  }}
                  inputProps={{
                    min: 0,
                    max: 99,
                    step: 1,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                />
                
                <IconButton 
                  size="small" 
                  onClick={() => handleIncrement(selectedProduct)}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={imageZoom.open} onClose={() => setImageZoom({ open: false, src: '' })} maxWidth="lg" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
          {imageZoom.src && (
            <img 
              src={imageZoom.src} 
              alt="zoom" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '80vh', 
                objectFit: 'contain'
              }} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageZoom({ open: false, src: '' })}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Catalog;
