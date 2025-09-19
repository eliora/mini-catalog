"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Avatar,
  IconButton,
  Typography,
  Divider
} from "@mui/material";
import {
  Close,
  CloudUpload,
  Delete
} from "@mui/icons-material";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { H6 } from "@/components/Typography";

interface Product {
  id?: string;
  ref: string;
  name: string;
  name_en?: string;
  description?: string;
  category: string;
  price: number;
  cost_price?: number;
  stock: number;
  low_stock_threshold?: number;
  status: string;
  images?: string[];
}

interface ProductFormDialogProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export default function ProductFormDialog({
  open,
  product,
  onClose,
  onSave
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState<Product>({
    ref: "",
    name: "",
    name_en: "",
    description: "",
    category: "",
    price: 0,
    cost_price: 0,
    stock: 0,
    low_stock_threshold: 10,
    status: "active",
    images: []
  });

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImages(product.images || []);
    } else {
      setFormData({
        ref: "",
        name: "",
        name_en: "",
        description: "",
        category: "",
        price: 0,
        cost_price: 0,
        stock: 0,
        low_stock_threshold: 10,
        status: "active",
        images: []
      });
      setImages([]);
    }
  }, [product, open]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      images
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Mock image upload - in real app, upload to server
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const categories = [
    "סרומים",
    "קרמים", 
    "מסכות",
    "שמנים",
    "תחליבים",
    "אקספוליאנט",
    "טונר",
    "קרם עיניים"
  ];

  const statuses = [
    { value: "active", label: "פעיל" },
    { value: "draft", label: "טיוטה" },
    { value: "out_of_stock", label: "אזל מהמלאי" },
    { value: "discontinued", label: "הופסק" }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <FlexBetween>
          <Typography variant="h6" fontWeight={700}>
            {product ? "עריכת מוצר" : "הוספת מוצר חדש"}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </FlexBetween>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <H6 sx={{ mb: 2, fontWeight: 700 }}>מידע בסיסי</H6>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <TextField
              fullWidth
              label={'מק"ט'}
              value={formData.ref}
              onChange={(e) => setFormData(prev => ({ ...prev, ref: e.target.value }))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>קטגוריה</InputLabel>
              <Select
                value={formData.category}
                label="קטגוריה"
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                sx={{ borderRadius: 2 }}
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="שם המוצר (עברית)"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="שם המוצר (אנגלית)"
              value={formData.name_en}
              onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="תיאור המוצר"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          {/* Pricing & Inventory */}
          <Grid size={{ xs: 12 }}>
            <H6 sx={{ mb: 2, fontWeight: 700 }}>מחירים ומלאי</H6>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <TextField
              fullWidth
              type="number"
              label="מחיר מכירה"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <TextField
              fullWidth
              type="number"
              label="מחיר עלות"
              value={formData.cost_price}
              onChange={(e) => setFormData(prev => ({ ...prev, cost_price: Number(e.target.value) }))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <TextField
              fullWidth
              type="number"
              label="כמות במלאי"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <TextField
              fullWidth
              type="number"
              label="סף מלאי נמוך"
              value={formData.low_stock_threshold}
              onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: Number(e.target.value) }))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          {/* Images */}
          <Grid size={{ xs: 12 }}>
            <H6 sx={{ mb: 2, fontWeight: 700 }}>תמונות מוצר</H6>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                border: "2px dashed",
                borderColor: "grey.300",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                bgcolor: "grey.50"
              }}
            >
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <IconButton component="span" sx={{ mb: 1 }}>
                  <CloudUpload sx={{ fontSize: 48, color: "grey.500" }} />
                </IconButton>
                <Typography variant="body1" gutterBottom>
                  גרור קבצים לכאן או לחץ לבחירה
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  תמונות במפורמט JPG, PNG עד 5MB
                </Typography>
              </label>
            </Box>

            {/* Image Preview */}
            {images.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <FlexBox gap={2} flexWrap="wrap">
                  {images.map((image, index) => (
                    <Box key={index} sx={{ position: "relative" }}>
                      <Avatar
                        src={image}
                        sx={{ width: 80, height: 80, borderRadius: 2 }}
                      />
                      <IconButton
                        onClick={() => removeImage(index)}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          bgcolor: "error.main",
                          color: "white",
                          width: 24,
                          height: 24,
                        }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
                </FlexBox>
              </Box>
            )}
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12 }}>
            <H6 sx={{ mb: 2, fontWeight: 700 }}>סטטוס</H6>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>סטטוס מוצר</InputLabel>
              <Select
                value={formData.status}
                label="סטטוס מוצר"
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                sx={{ borderRadius: 2 }}
              >
                {statuses.map(status => (
                  <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          ביטול
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          {product ? "עדכן מוצר" : "הוסף מוצר"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
