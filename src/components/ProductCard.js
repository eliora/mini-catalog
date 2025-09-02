import React from 'react';
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Chip, IconButton, TextField, Stack, Box, useTheme, useMediaQuery
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Info as InfoIcon } from '@mui/icons-material';

const ProductCard = ({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onQuantityChange,
  onInfoClick,
  onImageClick,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
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
        },
      }}
    >
      <CardMedia
        component="div"
        sx={{
          height: isSmall ? 200 : 240,
          position: 'relative',
          backgroundColor: 'grey.50',
          cursor: 'pointer',
        }}
        onClick={() => onImageClick(product.mainPic)}
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
              padding: '8px',
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">אין תמונה</Typography>
          </Box>
        )}
        {product.line && (
          <Chip
            label={product.line}
            size="small"
            color="primary"
            sx={{ position: 'absolute', top: 8, right: 8, maxWidth: '80%' }}
          />
        )}
        <Chip
          label={`#${product.ref}`}
          size="small"
          variant="outlined"
          sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)' }}
        />
      </CardMedia>
      <CardContent sx={{ flexGrow: 1, p: isSmall ? 1.5 : 2 }}>
        <Stack spacing={1}>
          <Typography
            variant={isSmall ? 'subtitle2' : 'h6'}
            component="h3"
            sx={{
              fontWeight: 600,
              textAlign: 'right',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.productName}
          </Typography>
          {product.productName2 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right', fontStyle: 'italic' }}>
              {product.productName2}
            </Typography>
          )}
          {product.notice && (
            <Typography
              variant="body2"
              sx={{
                textAlign: 'right',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: 'text.secondary',
              }}
            >
              {product.notice}
            </Typography>
          )}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {product.size}
            </Typography>
            <Typography variant={isSmall ? 'h6' : 'h5'} color="primary" sx={{ fontWeight: 600 }}>
              ${product.unitPrice}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ p: isSmall ? 1 : 2, pt: 0 }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => onDecrement(product)}
              disabled={quantity === 0}
              sx={{ border: '1px solid', borderColor: 'divider', width: 32, height: 32 }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <TextField
              type="number"
              size="small"
              value={quantity}
              onChange={(e) => onQuantityChange(product.ref, e.target.value)}
              sx={{
                width: 60,
                '& .MuiOutlinedInput-root': { height: 32 },
                '& input': {
                  textAlign: 'center',
                  MozAppearance: 'textfield',
                  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                },
              }}
              inputProps={{ min: 0, max: 99, step: 1 }}
            />
            <IconButton
              size="small"
              onClick={() => onIncrement(product)}
              sx={{ border: '1px solid', borderColor: 'divider', width: 32, height: 32 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="small"
            onClick={() => onInfoClick(product)}
            sx={{
              color: 'primary.main',
              '&:hover': { backgroundColor: 'primary.main', color: 'primary.contrastText' },
            }}
          >
            <InfoIcon />
          </IconButton>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default React.memo(ProductCard);
