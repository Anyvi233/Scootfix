/**
 * @file src/lib/cache.ts
 * @description Lightweight in-process cache using Map with TTL expiry.
 * Avoids repeated DB round-trips for stable, frequently-read data
 * (categories, brands, vehicle models, featured products).
 *
 * For production at scale, swap the Map for Redis/Upstash — the API is
 * identical: get / set / del.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /** Fetch a cached value. Returns undefined on miss or expiry. */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /** Store a value with a TTL (seconds). */
  set<T>(key: string, value: T, ttlSeconds = 60): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /** Manually invalidate one or more keys (e.g. after a write). */
  del(...keys: string[]): void {
    for (const key of keys) this.store.delete(key);
  }

  /** Clear all entries matching a prefix (e.g. "products:"). */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  /** Total number of live (non-expired) entries. */
  get size(): number {
    const now = Date.now();
    let count = 0;
    for (const entry of this.store.values()) {
      if (now <= entry.expiresAt) count++;
    }
    return count;
  }
}

// Singleton — one cache per Node.js process
export const cache = new MemoryCache();

// ─── TTL Constants ────────────────────────────────────────────────────────────
export const TTL = {
  CATEGORIES: 5 * 60,       // 5 minutes – changes rarely
  BRANDS: 5 * 60,
  VEHICLE_MODELS: 5 * 60,
  PRODUCTS_LIST: 60,        // 1 minute – changes more often
  PRODUCT_DETAIL: 2 * 60,  // 2 minutes
  FEATURED: 2 * 60,
  INVENTORY: 30,            // 30 seconds – stock levels are time-sensitive
} as const;

// ─── Cache Key Helpers ────────────────────────────────────────────────────────
export const CacheKeys = {
  categories: () => "categories:all",
  brands: () => "brands:all",
  vehicleModels: () => "vehicleModels:all",
  productList: (params: string) => `products:list:${params}`,
  productDetail: (slug: string) => `products:detail:${slug}`,
  featured: () => "products:featured",
  inventory: () => "inventory:all",
} as const;
