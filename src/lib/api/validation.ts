import type { NextRequest } from "next/server";
import type { ValidationError, ValidationErrorResponse } from "@/types/api";

// Validation rule types
export type ValidationRule = {
	required?: boolean;
	type?: "string" | "number" | "boolean" | "email" | "array" | "object";
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	pattern?: RegExp;
	custom?: (value: unknown) => string | null; // Return error message or null if valid
};

export type ValidationSchema = Record<string, ValidationRule>;

// Validation result
export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	data?: Record<string, unknown>;
}

// Validator class
export class Validator {
	// Validate data against schema
	static validate(
		data: Record<string, unknown>,
		schema: ValidationSchema,
	): ValidationResult {
		const errors: ValidationError[] = [];
		const validatedData: Record<string, unknown> = {};

		for (const [field, rules] of Object.entries(schema)) {
			const value = data[field];
			const fieldErrors = Validator.validateField(field, value, rules);

			if (fieldErrors.length > 0) {
				errors.push(...fieldErrors);
			} else {
				validatedData[field] = Validator.transformValue(value, rules);
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
			data: errors.length === 0 ? validatedData : undefined,
		};
	}

	// Validate single field
	private static validateField(
		field: string,
		value: unknown,
		rules: ValidationRule,
	): ValidationError[] {
		const errors: ValidationError[] = [];

		// Required check
		if (
			rules.required &&
			(value === undefined || value === null || value === "")
		) {
			errors.push({
				field,
				message: `${field} is required`,
				code: "REQUIRED",
				value,
			});
			return errors; // If required and missing, skip other validations
		}

		// Skip other validations if value is empty and not required
		if (value === undefined || value === null || value === "") {
			return errors;
		}

		// Type validation
		if (rules.type) {
			const typeError = Validator.validateType(field, value, rules.type);
			if (typeError) errors.push(typeError);
		}

		// String validations
		if (typeof value === "string") {
			if (rules.minLength !== undefined && value.length < rules.minLength) {
				errors.push({
					field,
					message: `${field} must be at least ${rules.minLength} characters long`,
					code: "MIN_LENGTH",
					value,
				});
			}

			if (rules.maxLength !== undefined && value.length > rules.maxLength) {
				errors.push({
					field,
					message: `${field} must be no more than ${rules.maxLength} characters long`,
					code: "MAX_LENGTH",
					value,
				});
			}

			if (rules.pattern && !rules.pattern.test(value)) {
				errors.push({
					field,
					message: `${field} format is invalid`,
					code: "INVALID_FORMAT",
					value,
				});
			}
		}

		// Number validations
		if (typeof value === "number") {
			if (rules.min !== undefined && value < rules.min) {
				errors.push({
					field,
					message: `${field} must be at least ${rules.min}`,
					code: "MIN_VALUE",
					value,
				});
			}

			if (rules.max !== undefined && value > rules.max) {
				errors.push({
					field,
					message: `${field} must be no more than ${rules.max}`,
					code: "MAX_VALUE",
					value,
				});
			}
		}

		// Custom validation
		if (rules.custom) {
			const customError = rules.custom(value);
			if (customError) {
				errors.push({
					field,
					message: customError,
					code: "CUSTOM_VALIDATION",
					value,
				});
			}
		}

		return errors;
	}

	// Validate type
	private static validateType(
		field: string,
		value: unknown,
		expectedType: string,
	): ValidationError | null {
		switch (expectedType) {
			case "string":
				if (typeof value !== "string") {
					return {
						field,
						message: `${field} must be a string`,
						code: "INVALID_TYPE",
						value,
					};
				}
				break;

			case "number":
				if (typeof value !== "number" || Number.isNaN(value)) {
					return {
						field,
						message: `${field} must be a valid number`,
						code: "INVALID_TYPE",
						value,
					};
				}
				break;

			case "boolean":
				if (typeof value !== "boolean") {
					return {
						field,
						message: `${field} must be a boolean`,
						code: "INVALID_TYPE",
						value,
					};
				}
				break;

			case "email":
				if (typeof value !== "string" || !Validator.isValidEmail(value)) {
					return {
						field,
						message: `${field} must be a valid email address`,
						code: "INVALID_EMAIL",
						value,
					};
				}
				break;

			case "array":
				if (!Array.isArray(value)) {
					return {
						field,
						message: `${field} must be an array`,
						code: "INVALID_TYPE",
						value,
					};
				}
				break;

			case "object":
				if (
					typeof value !== "object" ||
					Array.isArray(value) ||
					value === null
				) {
					return {
						field,
						message: `${field} must be an object`,
						code: "INVALID_TYPE",
						value,
					};
				}
				break;
		}

		return null;
	}

	// Transform value based on type
	private static transformValue(
		value: unknown,
		rules: ValidationRule,
	): unknown {
		if (rules.type === "number" && typeof value === "string") {
			return parseFloat(value);
		}

		if (rules.type === "boolean" && typeof value === "string") {
			return value.toLowerCase() === "true";
		}

		return value;
	}

	// Email validation helper
	private static isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
}

// Common validation schemas
export const commonSchemas = {
	// Pagination parameters
	pagination: {
		page: { type: "number" as const, min: 1 },
		pageSize: { type: "number" as const, min: 1, max: 100 },
		search: { type: "string" as const, maxLength: 500 },
	},

	// Product validation
	product: {
		ref: {
			required: true,
			type: "string" as const,
			minLength: 1,
			maxLength: 50,
		},
		hebrew_name: { type: "string" as const, maxLength: 200 },
		english_name: { type: "string" as const, maxLength: 200 },
		size: { type: "string" as const, maxLength: 50 },
		qty: { type: "number" as const, min: 0 },
	},

	// Order validation
	order: {
		customerName: {
			required: true,
			type: "string" as const,
			minLength: 1,
			maxLength: 200,
		},
		customerEmail: { type: "email" as const },
		customerPhone: { type: "string" as const, maxLength: 20 },
		total: { required: true, type: "number" as const, min: 0 },
		items: { required: true, type: "array" as const },
	},

	// Settings validation
	settings: {
		company_name: {
			required: true,
			type: "string" as const,
			minLength: 1,
			maxLength: 200,
		},
		company_description: { type: "string" as const, maxLength: 1000 },
		contact_email: { type: "email" as const },
		contact_phone: { type: "string" as const, maxLength: 20 },
	},
};

// Validation middleware helper
export async function validateRequestBody(
	request: NextRequest,
	schema: ValidationSchema,
): Promise<{
	isValid: boolean;
	data?: Record<string, unknown>;
	errors?: ValidationError[];
}> {
	try {
		const body = await request.json();
		const result = Validator.validate(body, schema);

		return {
			isValid: result.isValid,
			data: result.data,
			errors: result.errors,
		};
	} catch {
		return {
			isValid: false,
			errors: [
				{
					field: "body",
					message: "Invalid JSON in request body",
					code: "INVALID_JSON",
					value: null,
				},
			],
		};
	}
}

// Validation response helper
export function createValidationErrorResponse(
	errors: ValidationError[],
): ValidationErrorResponse {
	return {
		success: false,
		error: "VALIDATION_ERROR",
		message: `Validation failed: ${errors.map((e) => e.message).join(", ")}`,
		errors,
	};
}
