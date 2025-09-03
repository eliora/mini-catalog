import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Grid, Typography, Chip, IconButton, Stack, Box, TextField, useTheme, useMediaQuery
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

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

  const renderDesktopView = () => (
    <Grid container alignItems="center" spacing={1}>
      <Grid item xs="auto">
        <Chip
          label={product.ref}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ height: 24, minWidth: 45, fontSize: '0.75rem', fontWeight: 600 }}
        />
      </Grid>
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
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onImageClick(product.mainPic);
          }}
        >
          {product.mainPic ? (
            <img
              src={product.mainPic}
              alt={product.productName}
              loading="lazy"
              crossOrigin="anonymous"
              onError={(e) => {
                console.warn('Image load failed:', product.mainPic);
                if (e.currentTarget.src !== product.mainPic) {
                  e.currentTarget.src = product.mainPic;
                } else {
                  e.currentTarget.src = 'https://via.placeholder.com/36x36/e0e0e0/757575?text=?';
                }
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', product.mainPic);
              }}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
              ?
            </Typography>
          )}
        </Box>
      </Grid>
      <Grid item xs>
        <Box sx={{ textAlign: 'right', minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.25,
            }}
          >
            {product.productName}
            {product.productName2 && ` • ${product.productName2}`}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 400,
            }}
          >
            {product.notice ? product.notice : (product.line && product.line)}
          </Typography>
        </Box>
      </Grid>
      {/* Size (rightmost visually) */}
      <Grid item xs="auto">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 500, whiteSpace: 'nowrap', mx: 1 }}
        >
          {product.size ? product.size.replace(/\s*(jar|tube|dispenser|bottle|tub|pump|cream|lotion|serum|gel|mask|cleanser|toner|moisturizer|oil|balm|scrub|peeling|foam|mousse|spray|mist)\s*/gi, '').trim() : ''}
        </Typography>
      </Grid>
      {/* Quantity controls (middle visually) */}
      <Grid item xs="auto">
        <Stack direction="row" alignItems="center" spacing={0} onClick={(e) => e.stopPropagation()}
          sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <IconButton size="small" onClick={() => onDecrement(product)} disabled={quantity === 0}
            sx={{ width: 28, height: 28, borderRadius: '4px 0 0 4px' }}>
            <RemoveIcon fontSize="small" />
          </IconButton>
          <TextField
            type="number"
            size="small"
            value={quantity}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === '' ? 0 : parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 0 && numValue <= 99) {
                onQuantityChange(product.ref, value === '' ? '0' : numValue.toString());
              }
            }}
            onBlur={(e) => {
              const value = parseInt(e.target.value, 10);
              if (isNaN(value) || value < 0) {
                onQuantityChange(product.ref, '0');
              } else if (value > 99) {
                onQuantityChange(product.ref, '99');
              }
            }}
            sx={{ width: 54, '& .MuiOutlinedInput-root': { height: 28 }, '& input': { textAlign: 'center', fontSize: '0.75rem', p: 0 } }}
            inputProps={{ min: 0, max: 99, step: 1, inputMode: 'numeric', pattern: '[0-9]*' }}
          />
          <IconButton size="small" onClick={() => onIncrement(product)} sx={{ width: 28, height: 28, borderRadius: '0 4px 4px 0' }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Grid>
      {/* Price (leftmost visually) */}
      <Grid item xs="auto">
        <Typography
          variant="subtitle2"
          color="primary"
          sx={{ fontWeight: 700, textAlign: 'center', minWidth: 50, ml: 1 }}
        >
          ${product.unitPrice}
        </Typography>
      </Grid>
    </Grid>
  );

  const renderMobileView = () => (
    <Box sx={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto auto',
        alignItems: 'center',
        gap: 1,
        mb: 0.5,
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <Typography variant="caption" color="primary" sx={{ fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {product.ref}
        </Typography>
        <Typography variant="body2" sx={{
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '0.875rem',
          textAlign: 'right',
          minWidth: 0,
        }}>
          {product.productName}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {product.size ? product.size.replace(/\s*(jar|tube|dispenser|bottle|tub|pump|cream|lotion|serum|gel|mask|cleanser|toner|moisturizer|oil|balm|scrub|peeling|foam|mousse|spray|mist)\s*/gi, '').trim() : ''}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0}
          onClick={(e) => e.stopPropagation()}
          sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
        >
          <IconButton
            size="small"
            onClick={() => onDecrement(product)}
            disabled={quantity === 0}
            sx={{ width: 24, height: 24, borderRadius: '4px 0 0 4px' }}
          >
            <RemoveIcon sx={{ fontSize: '0.75rem' }} />
          </IconButton>
          <TextField
            type="number"
            size="small"
            value={quantity}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === '' ? 0 : parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 0 && numValue <= 99) {
                onQuantityChange(product.ref, value === '' ? '0' : numValue.toString());
              }
            }}
            onBlur={(e) => {
              const value = parseInt(e.target.value, 10);
              if (isNaN(value) || value < 0) {
                onQuantityChange(product.ref, '0');
              } else if (value > 99) {
                onQuantityChange(product.ref, '99');
              }
            }}
            sx={{
              width: 44,
              '& .MuiOutlinedInput-root': { height: 24 },
              '& input': { textAlign: 'center', fontSize: '0.7rem', p: 0 }
            }}
            inputProps={{ min: 0, max: 99, step: 1, inputMode: 'numeric', pattern: '[0-9]*' }}
          />
          <IconButton
            size="small"
            onClick={() => onIncrement(product)}
            sx={{ width: 24, height: 24, borderRadius: '0 4px 4px 0' }}
          >
            <AddIcon sx={{ fontSize: '0.75rem' }} />
          </IconButton>
        </Stack>
        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
          ${product.unitPrice}
        </Typography>
      </Box>
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
            width: '100%',
          }}
        >
          {product.notice}
        </Typography>
      )}
    </Box>
  );

  return (
    <Accordion
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
          boxShadow: 1,
        },
      }}
    >
      <AccordionSummary
        expandIcon={isMobile ? null : <ExpandMoreIcon />}
        sx={{
          minHeight: isMobile ? 56 : 48,
          cursor: 'pointer',
          overflow: 'hidden',
          '&.Mui-expanded': { minHeight: isMobile ? 56 : 48 },
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            margin: '8px 0 !important',
            overflow: 'hidden',
            minWidth: 0,
            '&.Mui-expanded': { margin: '8px 0 !important' },
          },
        }}
      >
        {isMobile ? renderMobileView() : renderDesktopView()}
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 2 }}>
        <Stack spacing={1.5} sx={{ textAlign: 'right' }}>
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
                  borderColor: 'divider',
                }}
                onClick={() => onImageClick(product.mainPic)}
              >
                <img
                  src={product.mainPic}
                  alt={product.productName}
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/120x120/e0e0e0/757575?text=אין+תמונה';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
            </Box>
          )}
          {shouldRenderContent(product.description) && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                תיאור מפורט
              </Typography>
              <Box sx={{ fontSize: '0.875rem' }} dangerouslySetInnerHTML={{ __html: product.description }} />
            </Box>
          )}
          {shouldRenderContent(product.activeIngredients) && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                מרכיבים פעילים
              </Typography>
              <Box sx={{ fontSize: '0.875rem' }} dangerouslySetInnerHTML={{ __html: product.activeIngredients }} />
            </Box>
          )}
          {shouldRenderContent(product.usageInstructions) && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                הוראות שימוש
              </Typography>
              <Box sx={{ fontSize: '0.875rem' }} dangerouslySetInnerHTML={{ __html: product.usageInstructions }} />
            </Box>
          )}
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
                      backgroundColor: 'grey.50',
                    }}
                    onClick={() => onImageClick(pic)}
                  >
                    <img
                      src={pic}
                      alt={`${product.productName} ${idx + 1}`}
                      loading="lazy"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/60x60/cccccc/666666?text=אין+תמונה';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(ProductListItem);
