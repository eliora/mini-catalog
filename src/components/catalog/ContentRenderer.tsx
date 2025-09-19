'use client';

/**
 * ContentRenderer Component - Dynamic Content Display
 * 
 * Renders various types of content (HTML, text, JSON) with proper formatting.
 * Handles content validation and safe rendering.
 */

import React from 'react';
import { Typography, Box } from '@mui/material';

interface ContentRendererProps {
  content: unknown;
  shouldRenderContent: (content: unknown) => boolean;
  variant?: 'body1' | 'body2' | 'caption';
  fallback?: React.ReactNode;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  shouldRenderContent,
  variant = 'body2',
  fallback
}) => {
  if (!shouldRenderContent(content)) {
    return fallback || null;
  }

  // Handle different content types
  let renderedContent: React.ReactNode;

  if (typeof content === 'string') {
    // Check if content contains HTML
    if (content.includes('<') && content.includes('>')) {
      // Render as HTML (be careful with XSS)
      renderedContent = (
        <Box 
          dangerouslySetInnerHTML={{ __html: content }}
          sx={{ 
            '& p': { mb: 1 },
            '& ul, & ol': { pl: 2, mb: 1 },
            '& li': { mb: 0.5 }
          }}
        />
      );
    } else {
      // Render as plain text with line breaks
      renderedContent = content.split('\n').map((line, index) => (
        <Typography key={index} variant={variant} paragraph={index < content.split('\n').length - 1}>
          {line}
        </Typography>
      ));
    }
  } else if (Array.isArray(content)) {
    // Render array as list
    renderedContent = (
      <Box component="ul" sx={{ pl: 2, mb: 1 }}>
        {content.map((item, index) => (
          <li key={index}>
            <Typography variant={variant}>{String(item)}</Typography>
          </li>
        ))}
      </Box>
    );
  } else if (typeof content === 'object' && content !== null) {
    // Render object as key-value pairs
    renderedContent = (
      <Box>
        {Object.entries(content).map(([key, value]) => (
          <Typography key={key} variant={variant} paragraph>
            <strong>{key}:</strong> {String(value)}
          </Typography>
        ))}
      </Box>
    );
  } else {
    // Fallback for other types
    renderedContent = (
      <Typography variant={variant}>
        {String(content)}
      </Typography>
    );
  }

  return <>{renderedContent}</>;
};

export default ContentRenderer;
