import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { ApiError, ApiResponse } from "@/types/api";

// Base API handler configuration
export interface ApiHandlerConfig {
	requiresAuth?: boolean;
	requiresAdmin?: boolean;
	timeout?: number;
	enableCaching?: boolean;
	cacheTTL?: number;
}

// Base API handler class
export abstract class BaseApiHandler {
	protected config: ApiHandlerConfig;
	protected supabase: Awaited<
		ReturnType<typeof createSupabaseServerClient>
	> | null = null;

	constructor(config: ApiHandlerConfig = {}) {
		this.config = {
			timeout: 10000,
			enableCaching: false,
			cacheTTL: 30000,
			...config,
		};
	}

	// Initialize Supabase client
	protected async initializeSupabase(): Promise<void> {
		if (!this.supabase) {
			this.supabase = await createSupabaseServerClient();
		}
	}

	// Abstract methods to be implemented by subclasses
	protected abstract handleGET?(request: NextRequest): Promise<NextResponse>;
	protected abstract handlePOST?(request: NextRequest): Promise<NextResponse>;
	protected abstract handlePUT?(request: NextRequest): Promise<NextResponse>;
	protected abstract handleDELETE?(request: NextRequest): Promise<NextResponse>;

	// Main handler method
	async handle(
		request: NextRequest,
		method: "GET" | "POST" | "PUT" | "DELETE",
	): Promise<NextResponse> {
		try {
			await this.initializeSupabase();

			// Handle authentication if required
			if (this.config.requiresAuth) {
				const authResult = await this.checkAuthentication();
				if (!authResult.success) {
					return this.errorResponse(authResult.error!, 401);
				}
			}

			// Handle admin access if required
			if (this.config.requiresAdmin) {
				const adminResult = await this.checkAdminAccess();
				if (!adminResult.success) {
					return this.errorResponse(adminResult.error!, 403);
				}
			}

			// Route to appropriate method handler
			const methodHandler = this[`handle${method}` as keyof this] as (
				request: NextRequest,
			) => Promise<NextResponse>;
			if (!methodHandler) {
				return this.errorResponse(`Method ${method} not allowed`, 405);
			}

			// Execute with timeout
			const result = await this.withTimeout(
				methodHandler.call(this, request),
				this.config.timeout!,
				`${method} request`,
			);

			return result;
		} catch (error) {
			console.error(`Unexpected error in ${method} handler:`, error);
			return this.errorResponse(
				error instanceof Error ? error.message : "Unknown error occurred",
				500,
			);
		}
	}

	// Authentication check
	protected async checkAuthentication(): Promise<{
		success: boolean;
		error?: string;
		user?: unknown;
	}> {
		try {
			if (!this.supabase) throw new Error("Supabase not initialized");

			const {
				data: { user },
				error,
			} = await this.supabase.auth.getUser();

			if (error || !user) {
				return { success: false, error: "Authentication required" };
			}

			return { success: true, user };
		} catch {
			return { success: false, error: "Authentication check failed" };
		}
	}

	// Admin access check
	protected async checkAdminAccess(): Promise<{
		success: boolean;
		error?: string;
		user?: unknown;
	}> {
		try {
			const authResult = await this.checkAuthentication();
			if (!authResult.success) return authResult;

			if (!this.supabase) throw new Error("Supabase not initialized");

			const { data: profile } = await this.supabase
				.from("users")
				.select("user_role")
				.eq("id", (authResult.user as { id: string })?.id)
				.single();

			if (profile?.user_role !== "admin") {
				return { success: false, error: "Admin access required" };
			}

			return { success: true, user: authResult.user };
		} catch {
			return { success: false, error: "Admin access check failed" };
		}
	}

	// Timeout wrapper
	protected withTimeout<T>(
		promise: Promise<T>,
		timeoutMs: number,
		operation = "Operation",
	): Promise<T> {
		return Promise.race([
			promise,
			new Promise<T>((_, reject) =>
				setTimeout(
					() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)),
					timeoutMs,
				),
			),
		]);
	}

	// Success response helper
	protected successResponse<T>(data: T, status = 200): NextResponse {
		return NextResponse.json({ success: true, data } as ApiResponse<T>, {
			status,
		});
	}

	// Error response helper
	protected errorResponse(
		error: string | ApiError,
		status = 500,
	): NextResponse {
		return NextResponse.json(
			{
				success: false,
				error: typeof error === "string" ? error : error.message,
			} as ApiResponse<null>,
			{ status },
		);
	}

	// Validation error response
	protected validationErrorResponse(
		message: string,
		field?: string,
	): NextResponse {
		return NextResponse.json(
			{
				success: false,
				error: message,
				field,
			} as ApiResponse<null>,
			{ status: 400 },
		);
	}

	// Parse query parameters helper
	protected parseQueryParams(request: NextRequest) {
		const { searchParams } = new URL(request.url);
		return {
			page: parseInt(searchParams.get("page") || "1", 10),
			pageSize: parseInt(searchParams.get("pageSize") || "50", 10),
			search: searchParams.get("search") || "",
			sortBy: searchParams.get("sortBy") || "",
			sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
		};
	}
}

