/**
 * PasswordStrengthIndicator Component - Password strength visualization
 * 
 * Visual indicator showing password strength with progress bar and label.
 * Calculates strength based on comprehensive criteria including length,
 * character types, and common password checks.
 * 
 * Features:
 * - Real-time password strength calculation
 * - Color-coded strength levels (weak to excellent)
 * - Progress bar visualization
 * - Hebrew strength labels
 * - Responsive design
 * - Enhanced security criteria
 * 
 * Strength Criteria:
 * - Length >= 6 characters: +15%
 * - Length >= 8 characters: +15%
 * - Length >= 12 characters: +10%
 * - Contains uppercase letter: +15%
 * - Contains lowercase letter: +10%
 * - Contains number: +15%
 * - Contains symbols: +15%
 * - Not common password: +5%
 */

'use client';

import React, { useMemo } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { calculatePasswordStrength, PasswordStrength } from './signUpValidation';

// Props interface
interface PasswordStrengthIndicatorProps {
  password: string;
  showLabel?: boolean;
  compact?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  showLabel = true,
  compact = false 
}) => {
  /**
   * Calculates password strength using validation utilities
   */
  const passwordStrength: PasswordStrength = useMemo(() => {
    return calculatePasswordStrength(password);
  }, [password]);

  // Don't render if no password
  if (!password) return null;

  return (
    <Box sx={{ mt: compact ? 0.5 : 1, mb: compact ? 0.5 : 1 }}>
      {/* Strength Label */}
      {showLabel && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 0.5,
          alignItems: 'center'
        }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: compact ? '0.7rem' : '0.75rem' }}
          >
            חוזק הסיסמה
          </Typography>
          <Typography 
            variant="caption" 
            color={`${passwordStrength.color}.main`}
            sx={{ 
              fontWeight: 600,
              fontSize: compact ? '0.7rem' : '0.75rem'
            }}
          >
            {passwordStrength.label}
          </Typography>
        </Box>
      )}
      
      {/* Strength Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={Math.min(passwordStrength.strength, 100)}
        color={passwordStrength.color}
        sx={{
          height: compact ? 3 : 4,
          borderRadius: 2,
          backgroundColor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
            transition: 'transform 0.3s ease-in-out',
          }
        }}
      />

      {/* Detailed criteria (only for non-compact mode) */}
      {!compact && password && passwordStrength.strength < 85 && (
        <Box sx={{ mt: 1 }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: '0.7rem' }}
          >
            לשיפור הסיסמה: השתמש באותיות גדולות, מספרים וסימנים מיוחדים
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(PasswordStrengthIndicator);

