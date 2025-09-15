/**
 * Sign Up Form Validation Utilities
 * 
 * Validation functions and utilities for the sign-up form.
 * Provides comprehensive validation for all form fields.
 * 
 * Features:
 * - Email format validation
 * - Password strength requirements
 * - Password confirmation matching
 * - Required field validation
 * - Terms acceptance validation
 * - Hebrew error messages
 */

/**
 * Validates the complete sign-up form
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateSignUpForm = (formData) => {
  // Check required fields
  if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
    return { isValid: false, error: 'נא למלא את כל השדות' };
  }

  // Validate email format
  if (!isValidEmail(formData.email)) {
    return { isValid: false, error: 'כתובת אימייל לא תקינה' };
  }

  // Validate password strength
  if (!isValidPassword(formData.password)) {
    return { isValid: false, error: 'הסיסמה חייבת להכיל לפחות 6 תווים' };
  }

  // Validate password confirmation
  if (!passwordsMatch(formData.password, formData.confirmPassword)) {
    return { isValid: false, error: 'הסיסמאות אינן תואמות' };
  }

  // Validate terms acceptance
  if (!formData.acceptTerms) {
    return { isValid: false, error: 'נא לאשר את תנאי השימוש' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return email.includes('@') && email.includes('.');
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} Whether password meets minimum requirements
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Checks if passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} Whether passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Calculates password strength score
 * @param {string} password - Password to evaluate
 * @returns {Object} Strength object with score, label, and color
 */
export const calculatePasswordStrength = (password) => {
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
};

const signUpValidation = {
  validateSignUpForm,
  isValidEmail,
  isValidPassword,
  passwordsMatch,
  calculatePasswordStrength
};

export default signUpValidation;
