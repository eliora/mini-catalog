/**
 * ProductForm Component
 * 
 * Dedicated form component for creating and editing products in the admin panel.
 * Handles all product field validation, form state, and submission logic.
 * 
 * Features:
 * - Create new products
 * - Edit existing products
 * - Field validation and error handling
 * - Multi-language support (Hebrew/English names)
 * - Image URL management
 * - Rich text descriptions with HTML support
 * 
 * @param {Object} product - Product to edit (null for new product)
 * @param {boolean} open - Whether dialog is open
 * @param {Function} onClose - Close dialog callback
 * @param {Function} onSave - Save product callback
 * @param {boolean} loading - Save operation loading state
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  CircularProgress
} from '@mui/material';

const ProductForm = ({ 
  product, 
  open, 
  onClose, 
  onSave, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    ref: '',
    productName: '', // Hebrew name
    productName2: '', // English name  
    size: '',
    unitPrice: '',
    productType: '',
    mainPic: '', // Main product image
    pics: [], // Additional images
    description: '', // Full description (Hebrew)
    activeIngredients: '', // Active ingredients
    usageInstructions: '', // Usage instructions
    short_description_he: '', // Short description
    skin_type_he: '', // Skin type
    notice: '' // Notice/warning text
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        pics: Array.isArray(product.pics) 
          ? product.pics 
          : (product.all_pics ? product.all_pics.split(' | ').filter(Boolean) : [])
      });
    } else {
      // Reset form for new product
      setFormData({
        ref: '',
        productName: '',
        productName2: '',
        size: '',
        unitPrice: '',
        productType: '',
        mainPic: '',
        pics: [],
        description: '',
        activeIngredients: '',
        usageInstructions: '',
        short_description_he: '',
        skin_type_he: '',
        notice: ''
      });
    }
    setErrors({});
  }, [product, open]);

  /**
   * Update a single form field
   */
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validate form data before submission
   */
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.ref?.trim()) {
      newErrors.ref = 'קוד מוצר נדרש';
    }
    
    if (!formData.productName?.trim()) {
      newErrors.productName = 'שם מוצר נדרש';
    }
    
    if (formData.unitPrice && isNaN(Number(formData.unitPrice))) {
      newErrors.unitPrice = 'מחיר חייב להיות מספר';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onSave(formData);
  };

  /**
   * Handle dialog close with confirmation if data changed
   */
  const handleClose = () => {
    // TODO: Add unsaved changes warning
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      scroll="body"
    >
      <DialogTitle>
        {product ? 'ערוך מוצר' : 'הוסף מוצר חדש'}
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Product Info */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="קוד מוצר (REF) *"
              value={formData.ref}
              onChange={(e) => updateField('ref', e.target.value)}
              error={!!errors.ref}
              helperText={errors.ref}
              disabled={!!product} // Don't allow changing ref for existing products
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="שם מוצר (עברית) *"
              value={formData.productName}
              onChange={(e) => updateField('productName', e.target.value)}
              error={!!errors.productName}
              helperText={errors.productName}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="שם מוצר (אנגלית)"
              value={formData.productName2}
              onChange={(e) => updateField('productName2', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="גודל/נפח"
              value={formData.size}
              onChange={(e) => updateField('size', e.target.value)}
              placeholder="לדוגמה: 50ml, 100g"
            />
          </Grid>

          {/* Pricing */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="מחיר יחידה"
              type="number"
              value={formData.unitPrice}
              onChange={(e) => updateField('unitPrice', e.target.value)}
              error={!!errors.unitPrice}
              helperText={errors.unitPrice}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="סוג עור"
              value={formData.skin_type_he}
              onChange={(e) => updateField('skin_type_he', e.target.value)}
              placeholder="עור יבש, עור רגיל, עור שמן"
            />
          </Grid>

          {/* Descriptions */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="תיאור קצר"
              multiline
              rows={2}
              value={formData.short_description_he}
              onChange={(e) => updateField('short_description_he', e.target.value)}
              helperText="תיאור קצר שמופיע בכרטיס המוצר"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="תיאור מפורט"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              helperText="תיאור מלא שמופיע בעמוד המוצר. תומך בתגיות HTML: <p>, <ul>, <li>, <strong>, <em>"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="רכיבים פעילים"
              multiline
              rows={2}
              value={formData.activeIngredients}
              onChange={(e) => updateField('activeIngredients', e.target.value)}
              helperText="רשימת הרכיבים הפעילים במוצר"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="הוראות שימוש"
              multiline
              rows={2}
              value={formData.usageInstructions}
              onChange={(e) => updateField('usageInstructions', e.target.value)}
              helperText="הוראות מפורטות לשימוש במוצר"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="הערות והתראות"
              multiline
              rows={2}
              value={formData.notice}
              onChange={(e) => updateField('notice', e.target.value)}
              helperText="הערות חשובות, התראות או הזהרות"
            />
          </Grid>

          {/* Images */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תמונה ראשית (URL)"
              value={formData.mainPic}
              onChange={(e) => updateField('mainPic', e.target.value)}
              placeholder="https://example.com/image.jpg"
              helperText="קישור לתמונה הראשית של המוצר"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תמונות נוספות"
              value={Array.isArray(formData.pics) ? formData.pics.join(' | ') : (formData.pics || '')}
              onChange={(e) => updateField('pics', e.target.value)}
              placeholder="url1 | url2 | url3"
              helperText="קישורים לתמונות נוספות, מופרדים ב-' | '"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
        >
          ביטול
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          endIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'שומר...' : 'שמור מוצר'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductForm;
