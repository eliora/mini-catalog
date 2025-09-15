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

// Form data interface
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  acceptTerms: boolean;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

// Password strength interface
export interface PasswordStrength {
  strength: number;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
}

/**
 * Validates the complete sign-up form
 * @param formData - Form data to validate
 * @returns Validation result with isValid and error message
 */
export const validateSignUpForm = (formData: SignUpFormData): ValidationResult => {
  // Check required fields
  if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
    return { isValid: false, error: 'נא למלא את כל השדות' };
  }

  // Validate email format
  if (!isValidEmail(formData.email)) {
    return { isValid: false, error: 'כתובת אימייל לא תקינה' };
  }

  // Validate password strength
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  // Validate password confirmation
  if (!passwordsMatch(formData.password, formData.confirmPassword)) {
    return { isValid: false, error: 'הסיסמאות אינן תואמות' };
  }

  // Validate terms acceptance
  if (!formData.acceptTerms) {
    return { isValid: false, error: 'נא לאשר את תנאי השימוש' };
  }

  // Validate full name
  if (!isValidFullName(formData.fullName)) {
    return { isValid: false, error: 'נא להזין שם מלא תקין' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates email format using comprehensive regex
 * @param email - Email to validate
 * @returns Whether email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  // Comprehensive email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength with detailed requirements
 * @param password - Password to validate
 * @returns Validation result with specific error messages
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'נא להזין סיסמה' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'הסיסמה חייבת להכיל לפחות 6 תווים' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'הסיסמה ארוכה מדי (מקסימום 128 תווים)' };
  }

  // Check for common weak passwords
  const commonPasswords = ['123456', 'password', '123456789', 'qwerty', 'abc123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: 'הסיסמה חלשה מדי, נא לבחור סיסמה חזקה יותר' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates full name format
 * @param fullName - Full name to validate
 * @returns Whether full name is valid
 */
export const isValidFullName = (fullName: string): boolean => {
  if (!fullName) return false;
  
  // Remove extra spaces and check length
  const trimmedName = fullName.trim();
  if (trimmedName.length < 2) return false;
  if (trimmedName.length > 100) return false;
  
  // Check for at least one space (first and last name)
  const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
  if (nameParts.length < 2) return false;
  
  // Check for valid characters (letters, spaces, Hebrew, Arabic)
  const nameRegex = /^[a-zA-Zא-ת\u0600-\u06FF\s'-]+$/;
  return nameRegex.test(trimmedName);
};

/**
 * Checks if passwords match
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Whether passwords match
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Calculates password strength score with detailed criteria
 * @param password - Password to evaluate
 * @returns Strength object with score, label, and color
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { strength: 0, label: '', color: 'error' };
  
  let strength = 0;
  const checks = {
    length6: password.length >= 6,
    length8: password.length >= 8,
    length12: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommon: !['123456', 'password', '123456789', 'qwerty', 'abc123'].includes(password.toLowerCase())
  };

  // Calculate strength based on criteria
  if (checks.length6) strength += 15;
  if (checks.length8) strength += 15;
  if (checks.length12) strength += 10;
  if (checks.uppercase) strength += 15;
  if (checks.lowercase) strength += 10;
  if (checks.numbers) strength += 15;
  if (checks.symbols) strength += 15;
  if (checks.noCommon) strength += 5;

  // Determine strength level and color
  if (strength < 30) return { strength, label: 'חלשה מאוד', color: 'error' };
  if (strength < 50) return { strength, label: 'חלשה', color: 'error' };
  if (strength < 70) return { strength, label: 'בינונית', color: 'warning' };
  if (strength < 85) return { strength, label: 'חזקה', color: 'info' };
  return { strength, label: 'מצוינת', color: 'success' };
};

// Export all validation functions as a default object
const signUpValidation = {
  validateSignUpForm,
  isValidEmail,
  validatePassword,
  isValidFullName,
  passwordsMatch,
  calculatePasswordStrength
};

export default signUpValidation;

