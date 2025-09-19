import { createSupabaseServerClient } from "@/lib/supabaseServer";

// Database operation configuration
export interface DbOperationConfig {
	maxRetries?: number;
	retryDelay?: number;
	timeout?: number;
}

// Retry operation helper
export async function retryOperation<T>(
	operation: () => Promise<T>,
	config: DbOperationConfig = {},
): Promise<T> {
	const { maxRetries = 2, retryDelay = 1000, timeout = 8000 } = config;
	let lastError: Error;
	let currentDelay = retryDelay;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(`🔄 Attempt ${attempt}/${maxRetries}`);

			// Wrap operation with timeout
			const result = await Promise.race([
				operation(),
				new Promise<T>((_, reject) =>
					setTimeout(
						() => reject(new Error(`Operation timeout after ${timeout}ms`)),
						timeout,
					),
				),
			]);

			return result;
		} catch (error) {
			lastError = error as Error;
			console.warn(`❌ Attempt ${attempt} failed:`, lastError.message);

			if (attempt < maxRetries) {
				console.log(`⏳ Waiting ${currentDelay}ms before retry...`);
				await new Promise((resolve) => setTimeout(resolve, currentDelay));
				currentDelay *= 1.5; // Exponential backoff
			}
		}
	}

	throw lastError!;
}

// Generic CRUD operations
export class DatabaseOperations {
	private supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;

	constructor(
		supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	) {
		this.supabase = supabase;
	}

	// Generic select with filters and pagination
	async select<T>(
		table: string,
		options: {
			columns?: string;
			filters?: Record<string, unknown>;
			search?: { columns: string[]; term: string };
			pagination?: { page: number; pageSize: number };
			orderBy?: { column: string; ascending?: boolean };
		} = {},
	): Promise<{ data: T[]; error: unknown }> {
		const {
			columns = "*",
			filters = {},
			search,
			pagination,
			orderBy,
		} = options;

		return retryOperation(async () => {
			let query = this.supabase.from(table as any).select(columns); // eslint-disable-line @typescript-eslint/no-explicit-any

			// Apply filters
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== "") {
					query = query.eq(key, value as any); // eslint-disable-line @typescript-eslint/no-explicit-any
				}
			});

			// Apply search
			if (search?.term) {
				const searchQuery = search.columns
					.map((col) => `${col}.ilike.%${search.term}%`)
					.join(",");
				query = query.or(searchQuery);
			}

			// Apply ordering
			if (orderBy) {
				query = query.order(orderBy.column, {
					ascending: orderBy.ascending ?? true,
				});
			}

			// Apply pagination
			if (pagination) {
				const offset = (pagination.page - 1) * pagination.pageSize;
				query = query.range(offset, offset + pagination.pageSize - 1);
			}

			const result = await query;
			return {
				data: result.data as T[],
				error: result.error
			};
		});
	}

	// Generic insert
	async insert<T>(
		table: string,
		data: Partial<T> | Partial<T>[],
		options: { returning?: string } = {},
	): Promise<{ data: T | T[] | null; error: unknown }> {
		const { returning = "*" } = options;

		return retryOperation(async () => {
			return await this.supabase
				.from(table as any) // eslint-disable-line @typescript-eslint/no-explicit-any
				.insert(data as Record<string, unknown>)
				.select(returning)
				.single();
		});
	}

	// Generic update
	async update<T>(
		table: string,
		data: Partial<T>,
		conditions: Record<string, unknown>,
		options: { returning?: string } = {},
	): Promise<{ data: T | null; error: unknown }> {
		const { returning = "*" } = options;

		return retryOperation(async () => {
			let query = this.supabase
				.from(table as any) // eslint-disable-line @typescript-eslint/no-explicit-any
				.update(data as Record<string, unknown>);

			// Apply conditions
			Object.entries(conditions).forEach(([key, value]) => {
				query = query.eq(key, value as any); // eslint-disable-line @typescript-eslint/no-explicit-any
			});

			return await query.select(returning).single();
		});
	}

	// Generic delete
	async delete<T>(
		table: string,
		conditions: Record<string, unknown>,
		options: { returning?: string } = {},
	): Promise<{ data: T | null; error: unknown }> {
		const { returning = "*" } = options;

		return retryOperation(async () => {
			let query = this.supabase.from(table as any).delete(); // eslint-disable-line @typescript-eslint/no-explicit-any

			// Apply conditions
			Object.entries(conditions).forEach(([key, value]) => {
				query = query.eq(key, value as any); // eslint-disable-line @typescript-eslint/no-explicit-any
			});

			return await query.select(returning).single();
		});
	}

	// Upsert operation
	async upsert<T>(
		table: string,
		data: Partial<T> | Partial<T>[],
		options: {
			onConflict?: string;
			returning?: string;
			ignoreDuplicates?: boolean;
		} = {},
	): Promise<{ data: T | T[] | null; error: unknown }> {
		const { onConflict, returning = "*", ignoreDuplicates = false } = options;

		return retryOperation(async () => {
			const query = this.supabase
				.from(table as any) // eslint-disable-line @typescript-eslint/no-explicit-any
				.upsert(data as Record<string, unknown>, {
					onConflict,
					ignoreDuplicates,
				});

			return await query.select(returning);
		});
	}

	// Count records
	async count(
		table: string,
		filters: Record<string, unknown> = {},
	): Promise<{ count: number; error: unknown }> {
		return retryOperation(async () => {
			let query = this.supabase
				.from(table as any) // eslint-disable-line @typescript-eslint/no-explicit-any
				.select("*", { count: "exact", head: true });

			// Apply filters
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== "") {
					query = query.eq(key, value as any); // eslint-disable-line @typescript-eslint/no-explicit-any
				}
			});

			const result = await query;
			return { count: result.count || 0, error: result.error };
		});
	}

	// Check if record exists
	async exists(
		table: string,
		conditions: Record<string, unknown>,
	): Promise<{ exists: boolean; error: unknown }> {
		return retryOperation(async () => {
			let query = this.supabase.from(table as any).select("id", { head: true }); // eslint-disable-line @typescript-eslint/no-explicit-any

			// Apply conditions
			Object.entries(conditions).forEach(([key, value]) => {
				query = query.eq(key, value as any); // eslint-disable-line @typescript-eslint/no-explicit-any
			});

			const result = await query.single();
			return {
				exists: !result.error && result.data !== null,
				error: result.error?.code === "PGRST116" ? null : result.error,
			};
		});
	}
}

// Helper to create database operations instance
export async function createDatabaseOperations(): Promise<DatabaseOperations> {
	const supabase = await createSupabaseServerClient();
	return new DatabaseOperations(supabase);
}

