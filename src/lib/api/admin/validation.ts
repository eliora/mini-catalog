/**
 * @file Admin API Validation Utilities
 * @description A declarative, schema-driven validation engine for client data.
 * This file centralizes all validation logic for creating and updating users
 * from the admin panel. It is designed to be highly reusable and easy to modify.
 */

import { USERS_TABLE } from '@/constants/users-schema.js';

// --- Type Definitions ---

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  cleanData?: any;
}

interface ValidationOptions {
  isUpdate?: boolean;
}

// --- Validation Helpers ---

const validateEmail = (email: any): boolean => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhoneNumber = (phone: any): boolean => typeof phone === 'string' && /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
const sanitizeString = (str: any): string => typeof str === 'string' ? str.trim().replace(/[<>\"']/g, '') : '';

/**
 * A reusable helper to validate a value against a list of allowed enum values.
 * @param value The value to check.
 * @param validValues An array of allowed strings.
 * @param fieldName The name of the field for clear error messages.
 * @returns An object with either the validated `value` or an `error` string.
 */
function validateEnum(value: any, validValues: string[], fieldName: string): { value?: string; error?: string } {
  if (value !== undefined) {
    if (!validValues.includes(value)) {
      return { error: `Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}` };
    }
    return { value };
  }
  return {};
}

// --- Core Validation Engine ---

/**
 * Validates a raw data object against a set of declarative rules.
 * This is the core engine that powers both create and update validations.
 * The logic is driven by the `fieldRules` configuration array.
 *
 * @param data The raw data object from the request body.
 * @param options `isUpdate`: If true, treats fields marked as `required` as optional.
 * @returns A `ValidationResult` object containing the outcome.
 */
function validateClientData(data: any, options: ValidationOptions = {}): ValidationResult {
  const { isUpdate = false } = options;
  const errors: string[] = [];
  const cleanData: any = {};

  // --- Unified Field Validation Rules ---
  const fieldRules: Array<{
    name: string;
    required?: boolean;
    validate?: (val: any) => boolean;
    sanitize?: (val: any) => any;
    error?: string;
    enum?: string[];
    defaultValue?: string;
    postProcess?: (val: any, currentData: any) => void;
  }> = [
    // Required on Create
    { name: 'email', required: true, validate: validateEmail, sanitize: (val: string) => val.toLowerCase().trim(), error: 'A valid email is required.' },
    { name: 'full_name', required: true, validate: (val: string) => Boolean(val && val.trim().length >= 2), sanitize: sanitizeString, error: 'Full name must be at least 2 characters.' },
    { name: 'password', required: true, validate: (val: string) => Boolean(val && val.length >= 6), sanitize: (val: string) => val, error: 'Password must be at least 6 characters.' },
    
    // Optional
    { name: 'phone_number', validate: (val: string) => !val || val.trim() === '' || validatePhoneNumber(val), sanitize: (val: string) => val && val.trim() !== '' ? val.trim() : null, error: 'Invalid phone number format.' },
    { name: 'business_name', sanitize: (val: string) => val && val.trim() !== '' ? sanitizeString(val) : null },
    { name: 'address', sanitize: (val: any) => val }, // Pass through JSONB object
    { name: 'city', sanitize: sanitizeString, postProcess: (val: string, currentData: any) => {
      if (currentData.address && typeof currentData.address === 'object') {
        currentData.address.city = val;
      }
    }},
    
    // Enums (with defaults on create)
    { name: 'user_role', defaultValue: 'standard', enum: Object.values(USERS_TABLE.enums.USER_ROLES) },
    { name: 'status', defaultValue: 'active', enum: Object.values(USERS_TABLE.enums.STATUS) },
  ];

  // --- Process All Rules ---
  for (const rule of fieldRules) {
    const value = data[rule.name];
    const isPresent = value !== undefined && value !== null;
    const isRequired = rule.required && !isUpdate;

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Validating field: ${rule.name}, value: ${JSON.stringify(value)}, isPresent: ${isPresent}, isRequired: ${isRequired}`);
    }

    if (rule.enum) {
      const valueToValidate = value ?? (isRequired ? rule.defaultValue : undefined);
      if (valueToValidate !== undefined) {
        const result = validateEnum(valueToValidate, rule.enum, rule.name);
        if (result.error) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Enum validation failed for ${rule.name}: ${result.error}`);
          }
          errors.push(result.error);
        } else if (result.value !== undefined) {
          cleanData[rule.name] = result.value;
        }
      }
    } else {
      if (isRequired && (!isPresent || (typeof value === 'string' && value.trim() === ''))) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Required field missing: ${rule.name}`);
        }
        errors.push(rule.error || `${rule.name} is required`);
      } else if (isPresent && rule.validate && !rule.validate(value)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Validation failed for ${rule.name}: ${rule.error}`);
        }
        errors.push(rule.error!);
      } else if (isPresent && rule.sanitize) {
        const sanitizedValue = rule.sanitize(value);
        if (sanitizedValue !== null) {
          cleanData[rule.name] = sanitizedValue;
          if (rule.postProcess) {
            rule.postProcess(sanitizedValue, cleanData);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanData: errors.length === 0 ? cleanData : undefined
  };
}

/**
 * Validates data for creating a new client.
 * Fields marked as `required` in the rule engine must be present.
 * @param data The raw data from the request body.
 * @returns A `ValidationResult` object.
 */
export function validateCreateClient(data: any): ValidationResult {
  return validateClientData(data, { isUpdate: false });
}

/**
 * Validates data for updating an existing client.
 * All fields are treated as optional.
 * @param data The raw data from the request body.
 * @returns A `ValidationResult` object.
 */
export function validateUpdateClient(data: any): ValidationResult {
  return validateClientData(data, { isUpdate: true });
}
