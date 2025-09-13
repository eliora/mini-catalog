/**
 * ContentRenderer - Ultra-efficient HTML/text content renderer
 * 
 * Optimized for high-frequency rendering with memoization.
 * Handles HTML content parsing and plain text display.
 * 
 * @param {string} content - Content to render
 * @param {Function} shouldRenderContent - Content validation function
 * @param {string} variant - Typography variant (default 'body2')
 */

import React from 'react';
import { Typography } from '@mui/material';
import { containsHtml } from '../../utils/dataHelpers';

const ContentRenderer = React.memo(({ 
  content, 
  shouldRenderContent, 
  variant = 'body2',
  sx = { lineHeight: 1.6 },
  fallback = null
}) => {
  if (!shouldRenderContent?.(content)) return fallback;

  if (containsHtml(content)) {
    return (
      <Typography 
        variant={variant}
        sx={sx}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <Typography variant={variant} sx={sx}>
      {content}
    </Typography>
  );
});

export default ContentRenderer;
