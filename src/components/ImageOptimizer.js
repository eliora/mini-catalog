import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  PhotoLibrary as PhotoLibraryIcon,
  CloudDownload as CloudDownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  getProductsWithExternalImages,
  optimizeMultipleProducts,
  getOptimizationStats
} from '../api/imageOptimization';

const ImageOptimizer = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState({
    maxWidth: 400,
    quality: 80,
    batchSize: 3
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadStats();
    loadProductsWithExternalImages();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await getOptimizationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadProductsWithExternalImages = async () => {
    try {
      setLoading(true);
      const productsData = await getProductsWithExternalImages();
      setProducts(productsData);
      setSelectedProducts(productsData.map(p => p.ref));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (selectedProducts.length === 0) return;

    try {
      setOptimizing(true);
      setProgress({});
      setResults([]);

      const productsToOptimize = products.filter(p => selectedProducts.includes(p.ref));
      
      const optimizationResults = await optimizeMultipleProducts(
        productsToOptimize,
        {
          maxWidth: settings.maxWidth,
          quality: settings.quality / 100,
          batchSize: settings.batchSize
        },
        (progressData) => {
          setProgress(prev => ({
            ...prev,
            [progressData.productRef]: progressData
          }));
        }
      );

      setResults(optimizationResults);
      
      // Refresh data
      await loadStats();
      await loadProductsWithExternalImages();
      
    } catch (error) {
      console.error('Error optimizing images:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const handleSelectAll = () => {
    setSelectedProducts(products.map(p => p.ref));
  };

  const handleDeselectAll = () => {
    setSelectedProducts([]);
  };

  const getImageCount = (product) => {
    let count = 0;
    if (product.mainPic && product.mainPic.startsWith('http')) count++;
    if (product.pics) {
      const picsArray = typeof product.pics === 'string' ? 
        JSON.parse(product.pics || '[]') : 
        (Array.isArray(product.pics) ? product.pics : []);
      count += picsArray.filter(pic => pic.startsWith('http')).length;
    }
    return count;
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'processing': return 'primary';
      default: return 'inherit';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <PhotoLibraryIcon fontSize="large" />
        מטב תמונות
      </Typography>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  סה"כ מוצרים
                </Typography>
                <Typography variant="h4">{stats.totalProducts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main" gutterBottom>
                  מוצרים עם תמונות חיצוניות
                </Typography>
                <Typography variant="h4">{stats.productsWithExternalImages}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main" gutterBottom>
                  תמונות חיצוניות
                </Typography>
                <Typography variant="h4">{stats.totalExternalImages}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main" gutterBottom>
                  אחוז אופטימיזציה
                </Typography>
                <Typography variant="h4">{Math.round(stats.optimizationPercentage)}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<CloudDownloadIcon />}
          onClick={handleOptimize}
          disabled={optimizing || selectedProducts.length === 0}
          size="large"
        >
          {optimizing ? 'מבצע אופטימיזציה...' : `אופטימיזציה (${selectedProducts.length} מוצרים)`}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => setShowSettings(true)}
          disabled={optimizing}
        >
          הגדרות
        </Button>
        
        <Button onClick={handleSelectAll} disabled={optimizing}>
          בחר הכל
        </Button>
        
        <Button onClick={handleDeselectAll} disabled={optimizing}>
          בטל בחירה
        </Button>
      </Stack>

      {/* Products List */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">
            מוצרים עם תמונות חיצוניות ({products.length})
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <LinearProgress />
            <Typography sx={{ mt: 2 }}>טוען מוצרים...</Typography>
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.main">
              כל התמונות כבר מאופטמות!
            </Typography>
            <Typography color="text.secondary">
              אין מוצרים עם תמונות חיצוניות שדורשות אופטימיזציה
            </Typography>
          </Box>
        ) : (
          <List>
            {products.map((product) => (
              <ListItem key={product.ref} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <ListItemIcon>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.ref)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(prev => [...prev, product.ref]);
                      } else {
                        setSelectedProducts(prev => prev.filter(ref => ref !== product.ref));
                      }
                    }}
                    disabled={optimizing}
                  />
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="subtitle1">
                        {product.productName}
                      </Typography>
                      <Chip 
                        label={`#${product.ref}`} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`${getImageCount(product)} תמונות`} 
                        size="small" 
                        color="primary" 
                      />
                    </Stack>
                  }
                  secondary={
                    progress[product.ref] ? (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <LinearProgress 
                            variant="determinate" 
                            value={progress[product.ref].progress || 0}
                            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                            color={getProgressColor(progress[product.ref].status)}
                          />
                          <Typography variant="caption" color={`${getProgressColor(progress[product.ref].status)}.main`}>
                            {Math.round(progress[product.ref].progress || 0)}%
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {progress[product.ref].message}
                        </Typography>
                      </Box>
                    ) : null
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Results Summary */}
      {results.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            תוצאות אופטימיזציה
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main' }} />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {results.filter(r => r.status === 'fulfilled').length}
                  </Typography>
                  <Typography variant="body2">הצליחו</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ bgcolor: 'error.light' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ErrorIcon sx={{ fontSize: 32, color: 'error.main' }} />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {results.filter(r => r.status === 'rejected').length}
                  </Typography>
                  <Typography variant="body2">נכשלו</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ bgcolor: 'info.light' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <InfoIcon sx={{ fontSize: 32, color: 'info.main' }} />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {results.length}
                  </Typography>
                  <Typography variant="body2">סה"כ</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>הגדרות אופטימיזציה</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography gutterBottom>רוחב מקסימלי (פיקסלים)</Typography>
            <Slider
              value={settings.maxWidth}
              onChange={(e, value) => setSettings(prev => ({ ...prev, maxWidth: value }))}
              min={200}
              max={800}
              step={50}
              marks={[
                { value: 200, label: '200px' },
                { value: 400, label: '400px' },
                { value: 600, label: '600px' },
                { value: 800, label: '800px' }
              ]}
              valueLabelDisplay="auto"
            />
            
            <Typography gutterBottom sx={{ mt: 3 }}>איכות תמונה (%)</Typography>
            <Slider
              value={settings.quality}
              onChange={(e, value) => setSettings(prev => ({ ...prev, quality: value }))}
              min={30}
              max={95}
              step={5}
              marks={[
                { value: 30, label: '30%' },
                { value: 60, label: '60%' },
                { value: 80, label: '80%' },
                { value: 95, label: '95%' }
              ]}
              valueLabelDisplay="auto"
            />
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>גודל אצווה</InputLabel>
              <Select
                value={settings.batchSize}
                onChange={(e) => setSettings(prev => ({ ...prev, batchSize: e.target.value }))}
                label="גודל אצווה"
              >
                <MenuItem value={1}>1 (איטי, בטוח)</MenuItem>
                <MenuItem value={3}>3 (מומלץ)</MenuItem>
                <MenuItem value={5}>5 (מהיר)</MenuItem>
                <MenuItem value={10}>10 (מהיר מאוד)</MenuItem>
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>רוחב מקסימלי:</strong> תמונות גדולות יותר יוקטנו לגודל זה<br/>
                <strong>איכות:</strong> איכות גבוהה יותר = קבצים גדולים יותר<br/>
                <strong>גודל אצווה:</strong> כמה תמונות לעבד בו-זמנית
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>ביטול</Button>
          <Button variant="contained" onClick={() => setShowSettings(false)}>שמור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageOptimizer;
