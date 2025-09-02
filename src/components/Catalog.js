import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Button,
  TextField,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Stack,
  Divider,
  Badge,
  Fab,
  useTheme,
  useMediaQuery,
  Container,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ShoppingCart as CartIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,

} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { getProducts, getProductLines } from '../api/products';

const Catalog = () => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState(() => {
    // Initialize with default quantity of 0 for all products (populated when products are loaded)
    const defaultQuantities = {};
    return defaultQuantities;
  });
  const [expandedRef, setExpandedRef] = useState(null);
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

  // Initialize quantities for new products and sync with cart
  useEffect(() => {
    if (products.length > 0) {
      setQuantities(prev => {
        const newQuantities = { ...prev };
        products.forEach(product => {
          // If product is in cart use cart quantity, otherwise default to 0
          const cartItem = cart.find(item => item.ref === product.ref);
          newQuantities[product.ref] = cartItem ? cartItem.quantity : 0;
        });
        return newQuantities;
      });
    }
  }, [products, cart]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
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
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productName2?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLine) {
      filtered = filtered.filter(product => product.line === selectedLine);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedLine]);

  const handleQuantityChange = (ref, value) => {
    const numValue = parseInt(value);
    const newQuantity = isNaN(numValue) ? 0 : Math.max(0, numValue);
    setQuantities(prev => ({
      ...prev,
      [ref]: newQuantity
    }));

    const cartItem = cart.find(i => i.ref === ref);
    if (newQuantity === 0) {
      if (cartItem) removeFromCart(ref);
      return;
    }
    if (cartItem) {
      updateQuantity(ref, newQuantity);
    } else {
      const product = products.find(p => p.ref === ref);
      if (product) addToCart(product, newQuantity);
    }
  };

  // Get current quantity for a product (from cart or local state) - optimized with caching
  const getCurrentQuantity = useCallback((productRef) => {
    const cartItem = cart.find(item => item.ref === productRef);
    return cartItem ? cartItem.quantity : (quantities[productRef] ?? 0);
  }, [cart, quantities]);

  const handleIncrement = useCallback((product) => {
    const current = getCurrentQuantity(product.ref) || 0;
    const next = Math.min(99, current + 1);
    
    // Immediate optimistic update for responsive UI
    setQuantities(prev => ({ ...prev, [product.ref]: next }));
    
    // Batch cart update to avoid blocking UI - find cart item once
    const cartItem = cart.find(i => i.ref === product.ref);
    if (cartItem) {
      updateQuantity(product.ref, next);
    } else {
      addToCart(product, next);
    }
  }, [getCurrentQuantity, cart, updateQuantity, addToCart]);

  const handleDecrement = useCallback((product) => {
    const current = getCurrentQuantity(product.ref) || 0;
    const next = Math.max(0, current - 1);
    
    // Immediate optimistic update for responsive UI
    setQuantities(prev => ({ ...prev, [product.ref]: next }));
    
    // Batch cart update to avoid blocking UI - find cart item once
    const cartItem = cart.find(i => i.ref === product.ref);
    if (next === 0) {
      if (cartItem) removeFromCart(product.ref);
    } else if (cartItem) {
      updateQuantity(product.ref, next);
    } else {
      addToCart(product, next);
    }
  }, [getCurrentQuantity, cart, updateQuantity, addToCart, removeFromCart]);

  const handleAddToCart = (product, quantity = null) => {
    let finalQuantity = quantity !== null ? quantity : getCurrentQuantity(product.ref);
    // If quantity is 0 or less, add 1 by default
    if (finalQuantity < 1) finalQuantity = 1;
    addToCart(product, finalQuantity);
    // Update local quantity to match what was added to cart
    setQuantities(prev => ({ ...prev, [product.ref]: finalQuantity }));
  };

  const handleToggleExpand = (ref) => {
    setExpandedRef(prev => (prev === ref ? null : ref));
  };

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
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  }
                }}
              >
                {/* Product Image */}
                <CardMedia
                  component="div"
                  sx={{
                    height: isSmall ? 200 : 240,
                    position: 'relative',
                    backgroundColor: 'grey.50',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleZoom(product.mainPic)}
                >
                  {product.mainPic ? (
                    <img
                      src={`/api/img?u=${encodeURIComponent(product.mainPic)}`}
                      alt={product.productName}
                      loading="lazy"
                      onError={(e) => { 
                        console.warn('Image load failed:', product.mainPic); 
                        e.currentTarget.src = 'https://via.placeholder.com/300x200/cccccc/666666?text=אין+תמונה'; 
                      }}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        padding: '8px'
                      }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        color: 'text.secondary'
                      }}
                    >
                      <Typography variant="body2">אין תמונה</Typography>
                    </Box>
                  )}
                  
                  {/* Product Badge */}
                  {product.line && (
                    <Chip
                      label={product.line}
                      size="small"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        maxWidth: '80%'
                      }}
                    />
                  )}
                  
                  {/* Ref Number */}
                  <Chip
                    label={`#${product.ref}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }}
                  />
                </CardMedia>

                {/* Product Content */}
                <CardContent sx={{ flexGrow: 1, p: isSmall ? 1.5 : 2 }}>
                  <Stack spacing={1}>
                    {/* Product Names */}
                    <Typography 
                      variant={isSmall ? "subtitle2" : "h6"} 
                      component="h3"
                      sx={{ 
                        fontWeight: 600,
                        textAlign: 'right',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {product.productName}
                    </Typography>
                    
                    {product.productName2 && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          textAlign: 'right',
                          fontStyle: 'italic'
                        }}
                      >
                        {product.productName2}
                      </Typography>
                    )}

                    {/* Notice/Description */}
                    {product.notice && (
                      <Typography 
                        variant="body2"
                        sx={{ 
                          textAlign: 'right',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: 'text.secondary'
                        }}
                      >
                        {product.notice}
                      </Typography>
                    )}

                    {/* Size and Price */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {product.size}
                      </Typography>
                      <Typography 
                        variant={isSmall ? "h6" : "h5"} 
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      >
                        ${product.unitPrice}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>

                {/* Product Actions */}
                <CardActions sx={{ p: isSmall ? 1 : 2, pt: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                    {/* Quantity Controls */}
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDecrement(product)}
                        disabled={getCurrentQuantity(product.ref) === 0}
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
                        value={getCurrentQuantity(product.ref)}
                        onChange={(e) => handleQuantityChange(product.ref, e.target.value)}
                        sx={{ 
                          width: 60,
                          '& .MuiOutlinedInput-root': {
                            height: 32,
                          },
                          '& input': { 
                            textAlign: 'center',
                            MozAppearance: 'textfield',
                            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0
                            }
                          }
                        }}
                        inputProps={{ min: 0, max: 99, step: 1 }}
                      />
                      
                      <IconButton 
                        size="small" 
                        onClick={() => handleIncrement(product)}
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

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Info Button */}
                    <IconButton
                      size="small"
                      onClick={() => setSelectedProduct(product)}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }
                      }}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* Compact Mode - Clean List */
        <Stack spacing={0.5}>
          {filteredProducts.map((product) => (
            <Accordion 
              key={product.ref}
              disableGutters
              elevation={0}
              sx={{ 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  margin: '0 !important',
                  borderColor: 'primary.main',
                  boxShadow: 1
                }
              }}
            >
              <AccordionSummary 
                expandIcon={isMobile ? null : <ExpandMoreIcon />}
                sx={{ 
                  minHeight: isMobile ? 56 : 48,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  '&.Mui-expanded': {
                    minHeight: isMobile ? 56 : 48
                  },
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    margin: '8px 0 !important',
                    overflow: 'hidden',
                    minWidth: 0,
                    '&.Mui-expanded': {
                      margin: '8px 0 !important'
                    }
                  }
                }}
              >
                {isMobile ? (
                  /* Mobile Layout - RTL Aligned */
                  <Box sx={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                    {/* First Line - Right to Left: Ref, Heb Name, Size, Qty, Price */}
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'auto 1fr auto auto auto',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                      overflow: 'hidden',
                      minWidth: 0
                    }}>
                      
                      {/* 1. Far Right - Ref Number */}
                      <Typography 
                        variant="caption" 
                        color="primary"
                        sx={{ 
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {product.ref}
                      </Typography>

                      {/* 2. Hebrew Product Name - Flexible */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.875rem',
                          textAlign: 'right',
                          minWidth: 0
                        }}
                      >
                        {product.productName}
                      </Typography>

                      {/* 3. Compact Size */}
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {product.size ? product.size.replace(/\s*(jar|tube|dispenser|bottle|tub|pump|cream|lotion|serum|gel|mask|cleanser|toner|moisturizer|oil|balm|scrub|peeling|foam|mousse|spray|mist)\s*/gi, '').trim() : ''}
                      </Typography>

                      {/* 4. Quantity Controls */}
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        spacing={0}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ 
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <IconButton 
                          size="small" 
                          onClick={() => handleDecrement(product)}
                          disabled={getCurrentQuantity(product.ref) === 0}
                          sx={{ width: 24, height: 24, borderRadius: '4px 0 0 4px' }}
                        >
                          <RemoveIcon sx={{ fontSize: '0.75rem' }} />
                        </IconButton>
                        
                        <Box 
                          sx={{ 
                            minWidth: 24, 
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: getCurrentQuantity(product.ref) > 0 ? 'primary.light' : 'transparent',
                            color: getCurrentQuantity(product.ref) > 0 ? 'primary.contrastText' : 'text.secondary',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        >
                          {getCurrentQuantity(product.ref)}
                        </Box>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => handleIncrement(product)}
                          sx={{ width: 24, height: 24, borderRadius: '0 4px 4px 0' }}
                        >
                          <AddIcon sx={{ fontSize: '0.75rem' }} />
                        </IconButton>
                      </Stack>

                      {/* 5. Far Left - Price */}
                      <Typography 
                        variant="subtitle2" 
                        color="primary" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ${product.unitPrice}
                      </Typography>
                    </Box>

                    {/* Second Line - Short Description (Non-bold) */}
                    {product.notice && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.7rem',
                          fontWeight: 400,
                          textAlign: 'right',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '100%'
                        }}
                      >
                        {product.notice}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  /* Desktop Layout - Original Grid */
                  <Grid container alignItems="center" spacing={1}>
                    
                    {/* Ref Number */}
                    <Grid item xs="auto">
                      <Chip 
                        label={product.ref} 
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 24, minWidth: 45, fontSize: '0.75rem', fontWeight: 600 }}
                      />
                    </Grid>

                    {/* Product Image */}
                    <Grid item xs="auto">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          backgroundColor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoom(product.mainPic);
                        }}
                      >
                        {product.mainPic ? (
                          <img
                            src={`/api/img?u=${encodeURIComponent(product.mainPic)}`}
                            alt={product.productName}
                            loading="lazy"
                            onError={(e) => { 
                              e.currentTarget.src = 'https://via.placeholder.com/36x36/e0e0e0/757575?text=?'; 
                            }}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                            ?
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Product Info */}
                    <Grid item xs>
                      <Box sx={{ textAlign: 'right', minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mb: 0.25
                          }}
                        >
                          {product.size && `${product.size.replace(/\s*(jar|tube|dispenser|bottle|tub|pump|cream|lotion|serum|gel|mask|cleanser|toner|moisturizer|oil|balm|scrub|peeling|foam|mousse|spray|mist)\s*/gi, '').trim()} • `}{product.productName}
                          {product.productName2 && ` • ${product.productName2}`}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: 400
                          }}
                        >
                          {product.notice ? product.notice : (product.line && product.line)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Quantity Controls First */}
                    <Grid item xs="auto">
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        spacing={0}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ 
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <IconButton 
                          size="small" 
                          onClick={() => handleDecrement(product)}
                          disabled={getCurrentQuantity(product.ref) === 0}
                          sx={{ width: 28, height: 28, borderRadius: '4px 0 0 4px' }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        
                        <Box 
                          sx={{ 
                            minWidth: 28, 
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: getCurrentQuantity(product.ref) > 0 ? 'primary.light' : 'transparent',
                            color: getCurrentQuantity(product.ref) > 0 ? 'primary.contrastText' : 'text.secondary',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        >
                          {getCurrentQuantity(product.ref)}
                        </Box>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => handleIncrement(product)}
                          sx={{ width: 28, height: 28, borderRadius: '0 4px 4px 0' }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Grid>

                    {/* Price Second */}
                    <Grid item xs="auto">
                      <Typography 
                        variant="subtitle2" 
                        color="primary" 
                        sx={{ 
                          fontWeight: 700,
                          textAlign: 'center',
                          minWidth: 50,
                          ml: 1
                        }}
                      >
                        ${product.unitPrice}
                      </Typography>
                    </Grid>

                  </Grid>
                )}
              </AccordionSummary>
              
              <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                <Stack spacing={1.5} sx={{ textAlign: 'right' }}>
                  
                  {/* Product Image - Mobile Only */}
                  {isMobile && product.mainPic && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: 2,
                          backgroundColor: 'grey.50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                        onClick={() => handleZoom(product.mainPic)}
                      >
                        <img
                          src={`/api/img?u=${encodeURIComponent(product.mainPic)}`}
                          alt={product.productName}
                          loading="lazy"
                          onError={(e) => { 
                            e.currentTarget.src = 'https://via.placeholder.com/120x120/e0e0e0/757575?text=אין+תמונה'; 
                          }}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                    </Box>
                  )}



                  {/* Detailed Information */}
                  {shouldRenderContent(product.description) && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        תיאור מפורט
                      </Typography>
                      <Box 
                        sx={{ fontSize: '0.875rem' }}
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    </Box>
                  )}

                  {shouldRenderContent(product.activeIngredients) && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        מרכיבים פעילים
                      </Typography>
                      <Box 
                        sx={{ fontSize: '0.875rem' }}
                        dangerouslySetInnerHTML={{ __html: product.activeIngredients }}
                      />
                    </Box>
                  )}

                  {shouldRenderContent(product.usageInstructions) && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        הוראות שימוש
                      </Typography>
                      <Box 
                        sx={{ fontSize: '0.875rem' }}
                        dangerouslySetInnerHTML={{ __html: product.usageInstructions }}
                      />
                    </Box>
                  )}

                  {/* Additional Images */}
                  {parseJsonField(product.pics).length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        תמונות נוספות
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {parseJsonField(product.pics).slice(0, 4).map((pic, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 1,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              backgroundColor: 'grey.50'
                            }}
                            onClick={() => handleZoom(pic)}
                          >
                            <img
                              src={`/api/img?u=${encodeURIComponent(pic)}`}
                              alt={`${product.productName} ${idx + 1}`}
                              loading="lazy"
                              onError={(e) => { 
                                e.currentTarget.src = 'https://via.placeholder.com/60x60/cccccc/666666?text=אין+תמונה'; 
                              }}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain'
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
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
                        src={`/api/img?u=${encodeURIComponent(selectedProduct.mainPic)}`}
                        alt={selectedProduct.productName}
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
                          e.currentTarget.src = 'https://via.placeholder.com/120x120/cccccc/666666?text=אין+תמונה'; 
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
                                src={`/api/img?u=${encodeURIComponent(pic)}`}
                                alt={`${selectedProduct.productName} ${idx + 1}`}
                                loading="lazy"
                                onError={(e) => { 
                                  e.currentTarget.src = 'https://via.placeholder.com/100x100/cccccc/666666?text=אין+תמונה'; 
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
                  onChange={(e) => handleQuantityChange(selectedProduct.ref, e.target.value)}
                  sx={{ 
                    width: 60,
                    '& input': { textAlign: 'center' }
                  }}
                  inputProps={{ min: 0, max: 99, step: 1 }}
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
