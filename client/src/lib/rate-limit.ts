import { LRUCache } from "lru-cache";
import { headers } from "next/headers";

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

// In-memory rate limiter using LRU cache
const rateLimitCache = new LRUCache<string, RateLimitRecord>({
  max: 10000, // Maximum number of items in cache
  ttl: 60 * 1000, // 1 minute default TTL
});

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitCache.get(identifier);

  // If no record or window has expired, start fresh
  if (!record || now >= record.resetAt) {
    const resetAt = now + windowMs;
    rateLimitCache.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      remaining: limit - 1,
      reset: resetAt,
    };
  }

  // Check if limit exceeded
  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  // Increment count
  record.count++;
  rateLimitCache.set(identifier, record);

  return {
    success: true,
    remaining: limit - record.count,
    reset: record.resetAt,
  };
}

/**
 * Get client IP address from headers
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Rate limit wrapper for server actions
 * @param actionName - Name of the action (for rate limit key)
 * @param limit - Maximum requests per window
 * @param windowMs - Window duration in milliseconds
 * @param action - The async action to execute
 */
export async function withRateLimit<T>(
  actionName: string,
  limit: number,
  windowMs: number,
  action: () => Promise<T>
): Promise<T> {
  const ip = await getClientIP();
  const key = `${actionName}:${ip}`;

  const result = checkRateLimit(key, limit, windowMs);

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    throw new Error(
      `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
    );
  }

  return action();
}

/**
 * Rate limit by user ID (for authenticated actions)
 */
export async function withUserRateLimit<T>(
  actionName: string,
  userId: string,
  limit: number,
  windowMs: number,
  action: () => Promise<T>
): Promise<T> {
  const key = `${actionName}:user:${userId}`;

  const result = checkRateLimit(key, limit, windowMs);

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    throw new Error(
      `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
    );
  }

  return action();
}

// Predefined rate limits for common actions
export const RATE_LIMITS = {
  // Course actions
  CREATE_COURSE: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  UPDATE_COURSE: { limit: 30, windowMs: 60 * 1000 }, // 30 per minute

  // Enrollment actions
  ENROLL: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute

  // Review actions
  CREATE_REVIEW: { limit: 5, windowMs: 60 * 1000 }, // 5 per minute

  // General API
  API_GENERAL: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute

  // Auth actions (stricter)
  LOGIN: { limit: 5, windowMs: 60 * 1000 }, // 5 per minute
  SIGNUP: { limit: 3, windowMs: 60 * 1000 }, // 3 per minute
} as const;
