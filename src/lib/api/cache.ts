// Request caching and deduplication utilities

interface CacheEntry<T> {
	promise: Promise<T>;
	timestamp: number;
}

class RequestCache {
	private cache = new Map<string, CacheEntry<unknown>>();
	private readonly defaultTTL = 30000; // 30 seconds
	private readonly maxSize = 100;

	// Generate cache key from operation and parameters
	generateKey(operation: string, params: unknown): string {
		return `${operation}:${JSON.stringify(params)}`;
	}

	// Get cached request if still valid
	get<T>(cacheKey: string, ttl?: number): Promise<T> | null {
		const cached = this.cache.get(cacheKey);
		const effectiveTTL = ttl ?? this.defaultTTL;

		if (cached && Date.now() - cached.timestamp < effectiveTTL) {
			return cached.promise as Promise<T>;
		}

		// Remove expired entry
		if (cached) {
			this.cache.delete(cacheKey);
		}

		return null;
	}

	// Set cached request
	set<T>(cacheKey: string, promise: Promise<T>): Promise<T> {
		this.cache.set(cacheKey, {
			promise,
			timestamp: Date.now(),
		});

		// Clean up cache if it gets too large
		this.cleanup();

		return promise;
	}

	// Clear specific cache entry
	clear(cacheKey: string): void {
		this.cache.delete(cacheKey);
	}

	// Clear all cache entries
	clearAll(): void {
		this.cache.clear();
	}

	// Clean up expired entries
	private cleanup(): void {
		if (this.cache.size <= this.maxSize) return;

		const now = Date.now();
		const entriesToDelete: string[] = [];

		for (const [key, value] of this.cache.entries()) {
			if (now - value.timestamp > this.defaultTTL) {
				entriesToDelete.push(key);
			}
		}

		entriesToDelete.forEach((key) => this.cache.delete(key));

		// If still too large, remove oldest entries
		if (this.cache.size > this.maxSize) {
			const entries = Array.from(this.cache.entries()).sort(
				([, a], [, b]) => a.timestamp - b.timestamp,
			);

			const toRemove = entries.slice(0, entries.length - this.maxSize);
			toRemove.forEach(([key]) => this.cache.delete(key));
		}
	}

	// Get cache statistics
	getStats() {
		return {
			size: this.cache.size,
			maxSize: this.maxSize,
			defaultTTL: this.defaultTTL,
		};
	}
}

// Global cache instance
const globalCache = new RequestCache();

// Cache helper functions
export const cache = {
	// Get or set cached request
	async getOrSet<T>(
		cacheKey: string,
		operation: () => Promise<T>,
		ttl?: number,
	): Promise<T> {
		// Check for existing cached request
		const cached = globalCache.get<T>(cacheKey, ttl);
		if (cached) {
			console.log(`📦 Cache hit for key: ${cacheKey}`);
			return await cached;
		}

		// Execute and cache the operation
		console.log(`🔄 Cache miss for key: ${cacheKey}, executing operation`);
		const promise = operation();
		globalCache.set(cacheKey, promise);

		return await promise;
	},

	// Generate cache key
	key: (operation: string, params: unknown) =>
		globalCache.generateKey(operation, params),

	// Clear specific cache
	clear: (cacheKey: string) => globalCache.clear(cacheKey),

	// Clear all cache
	clearAll: () => globalCache.clearAll(),

	// Get cache stats
	stats: () => globalCache.getStats(),
};

// Cache decorator for methods
export function Cached(ttl?: number) {
	return (
		target: unknown,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) => {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: unknown[]) {
		const cacheKey = cache.key(
			`${(target as object).constructor.name}.${propertyKey}`,
			args,
		);

			return cache.getOrSet(
				cacheKey,
				() => originalMethod.apply(this, args),
				ttl,
			);
		};

		return descriptor;
	};
}

// Cache invalidation patterns
export const cacheInvalidation = {
	// Invalidate all cache entries matching a pattern
	invalidatePattern(pattern: string): void {
		const stats = cache.stats();
		console.log(`🗑️ Invalidating cache entries matching pattern: ${pattern}`);

		// Since we can't access private cache directly, we clear all
		// In a production system, you'd implement pattern matching
		cache.clearAll();

		console.log(`🗑️ Cleared ${stats.size} cache entries`);
	},

	// Invalidate cache for specific operations
	invalidateOperation(operation: string): void {
		console.log(`🗑️ Invalidating cache for operation: ${operation}`);
		cache.clearAll(); // Simplified - in production, implement specific key matching
	},

	// Invalidate cache for specific resource
	invalidateResource(resource: string, id?: string): void {
		const pattern = id ? `${resource}:${id}` : resource;
		console.log(`🗑️ Invalidating cache for resource: ${pattern}`);
		cache.clearAll(); // Simplified - in production, implement specific key matching
	},
};

