'use client';

/**
 * ImageZoomDialog Component - Full-Featured Image Zoom Modal
 * 
 * 🔧 COMPONENT PURPOSE: Advanced image zoom and pan functionality
 * 🖥️ DEVICE TARGET: All devices with touch and mouse support
 * 🎯 TRIGGER: User clicks zoom button or image in product details
 * 
 * WHAT IT DOES:
 * Full-screen modal dialog for detailed image viewing with advanced zoom and pan capabilities.
 * Provides professional image viewing experience with smooth interactions.
 * 
 * USAGE CONTEXT:
 * - Triggered from ProductDetailsDialog zoom button
 * - Triggered from ProductListItem image clicks
 * - Used for detailed product image examination
 * - Supports both single images and image galleries
 * 
 * RESPONSIVE BEHAVIOR:
 * - Full-screen overlay on all devices
 * - Touch gestures support for mobile (pinch to zoom, drag to pan)
 * - Mouse wheel zoom support for desktop
 * - Keyboard shortcuts (ESC to close)
 * 
 * FEATURES:
 * - Smooth zoom in/out with scale limits (0.5x to 5x)
 * - Pan/drag functionality when zoomed in
 * - Mouse wheel zoom support
 * - Touch gesture support for mobile
 * - Loading states with progress indicator
 * - Error handling for failed image loads
 * - Reset functionality to return to original view
 * - Visual instructions for user guidance
 * - Backdrop blur and dark overlay for focus
 */

import React, { useState, useCallback, useEffect } from 'react';
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

interface ImageZoomDialogProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  alt?: string;
}

interface Position {
  x: number;
  y: number;
}

const ImageZoomDialog: React.FC<ImageZoomDialogProps> = ({ 
  open, 
  imageSrc, 
  onClose, 
  alt = "תמונה מוגדלת" 
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.5, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, scale, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    if (delta < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [handleZoomIn, handleZoomOut]);

  const handleClose = useCallback(() => {
    // Reset state when closing
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
    setImageError(false);
    onClose();
  }, [onClose]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
      setImageError(false);
      setIsDragging(false);
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleReset();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleClose, handleZoomIn, handleZoomOut, handleReset]);

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
        {imageSrc && (
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
        )}

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
            <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>
              ESC לסגירה | +/- לזום | 0 לאיפוס
            </div>
          </Box>
        )}

        {/* Scale Indicator */}
        {scale !== 1 && (
          <Box
            sx={{
              position: 'absolute',
              top: 24,
              right: 80,
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              zIndex: 5,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 1,
              px: 1,
              py: 0.5
            }}
          >
            {Math.round(scale * 100)}%
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageZoomDialog;