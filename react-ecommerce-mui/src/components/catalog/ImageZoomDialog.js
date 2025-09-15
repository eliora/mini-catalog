import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Fade,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';

const ImageZoomDialog = ({ open, imageSrc, onClose, alt = "תמונה מוגדלת" }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY;
    if (delta < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
    setImageError(false);
    onClose();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  if (!imageSrc) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          boxShadow: 'none',
          margin: 0,
          maxWidth: '100vw',
          maxHeight: '100vh',
          borderRadius: 0
        }
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          overflow: 'hidden',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Zoom Controls */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            gap: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 3,
            p: 1,
            backdropFilter: 'blur(10px)'
          }}
        >
          <IconButton
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            sx={{ color: 'white' }}
          >
            <ZoomOutIcon />
          </IconButton>
          
          <IconButton
            onClick={handleReset}
            sx={{ color: 'white' }}
          >
            <ResetIcon />
          </IconButton>
          
          <IconButton
            onClick={handleZoomIn}
            disabled={scale >= 5}
            sx={{ color: 'white' }}
          >
            <ZoomInIcon />
          </IconButton>
        </Box>

        {/* Loading Indicator */}
        {!imageLoaded && !imageError && (
          <CircularProgress
            sx={{
              position: 'absolute',
              color: 'white'
            }}
          />
        )}

        {/* Error Message */}
        {imageError && (
          <Box
            sx={{
              color: 'white',
              textAlign: 'center',
              p: 3
            }}
          >
            <Typography variant="h6" gutterBottom>
              שגיאה בטעינת התמונה
            </Typography>
            <Typography variant="body2">
              לא ניתן להציג את התמונה
            </Typography>
          </Box>
        )}

        {/* Image */}
        <Fade in={imageLoaded}>
          <Box
            component="img"
            src={imageSrc}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sx={{
              maxWidth: scale === 1 ? '90vw' : 'none',
              maxHeight: scale === 1 ? '90vh' : 'none',
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
        </Fade>

        {/* Instructions */}
        {imageLoaded && (
          <Box
            sx={{
              position: 'absolute',
              top: 24,
              left: 24,
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              zIndex: 5
            }}
          >
            <div>גלגל עכבר או כפתורי זום להגדלה</div>
            {scale > 1 && <div>גרור לתנועה</div>}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageZoomDialog;
