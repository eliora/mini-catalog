/**
 * PasswordStrengthIndicator Component - Password strength visualization
 * 
 * Visual indicator showing password strength with progress bar and label.
 * Calculates strength based on length, uppercase letters, and numbers.
 * 
 * Features:
 * - Real-time password strength calculation
 * - Color-coded strength levels (weak to excellent)
 * - Progress bar visualization
 * - Hebrew strength labels
 * - Responsive design
 * 
 * Strength Criteria:
 * - Length >= 6 characters: +25%
 * - Length >= 8 characters: +25%
 * - Contains uppercase letter: +25%
 * - Contains number: +25%
 * 
 * @param {string} password - Password to evaluate
 */

import React, { useMemo } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const PasswordStrengthIndicator = ({ password }) => {
  /**
   * Calculates password strength based on various criteria
   */
  const passwordStrength = useMemo(() => {
    if (!password) return { strength: 0, label: '', color: 'error' };
    
    let strength = 0;
    
    // Length criteria
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    
    // Character type criteria
    if (/[A-Z]/.test(password)) strength += 25; // Uppercase letter
    if (/[0-9]/.test(password)) strength += 25; // Number
    
    // Determine strength level and color
    if (strength <= 25) return { strength, label: 'חלשה', color: 'error' };
    if (strength <= 50) return { strength, label: 'בינונית', color: 'warning' };
    if (strength <= 75) return { strength, label: 'חזקה', color: 'info' };
    return { strength, label: 'מצוינת', color: 'success' };
  }, [password]);

  // Don't render if no password
  if (!password) return null;

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      {/* Strength Label */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          חוזק הסיסמה
        </Typography>
        <Typography variant="caption" color={`${passwordStrength.color}.main`}>
          {passwordStrength.label}
        </Typography>
      </Box>
      
      {/* Strength Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={passwordStrength.strength}
        color={passwordStrength.color}
        sx={{
          height: 4,
          borderRadius: 2,
        }}
      />
    </Box>
  );
};

export default React.memo(PasswordStrengthIndicator);
