/**
 * Pagination utilities for cursor-based and offset-based pagination
 */

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
}

export interface PaginationParams {
  cursor?: string | null;
  limit?: number;
}

export interface OffsetPaginationParams {
  page?: number;
  limit?: number;
}

export interface OffsetPaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

/**
 * Default pagination limits
 */
export const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
  MIN_LIMIT: 1,
} as const;

/**
 * Validate and normalize pagination limit
 */
export function normalizeLimit(limit?: number): number {
  if (!limit) return PAGINATION_DEFAULTS.DEFAULT_LIMIT;
  return Math.min(
    Math.max(limit, PAGINATION_DEFAULTS.MIN_LIMIT),
    PAGINATION_DEFAULTS.MAX_LIMIT
  );
}

/**
 * Create a cursor-based paginated response
 * @param items - Array of items (should include limit + 1 items to check hasMore)
 * @param limit - The requested limit
 * @param totalCount - Optional total count of all items
 * @param getCursor - Optional function to extract cursor from item (defaults to 'id')
 */
export function createPaginatedResponse<T extends { id: string }>(
  items: T[],
  limit: number,
  totalCount?: number,
  getCursor: (item: T) => string = (item) => item.id
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const paginatedItems = hasMore ? items.slice(0, limit) : items;
  const lastItem = paginatedItems[paginatedItems.length - 1];
  const nextCursor = hasMore && lastItem ? getCursor(lastItem) : null;

  return {
    items: paginatedItems,
    nextCursor,
    hasMore,
    totalCount,
  };
}

/**
 * Create an offset-based paginated response
 */
export function createOffsetPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  totalCount: number
): OffsetPaginatedResult<T> {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    items,
    page,
    limit,
    totalCount,
    totalPages,
    hasMore: page < totalPages,
    hasPrevious: page > 1,
  };
}

/**
 * Calculate offset from page number
 */
export function calculateOffset(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit;
}

/**
 * Parse pagination params from URL search params
 */
export function parsePaginationParams(
  searchParams: URLSearchParams
): PaginationParams {
  const cursor = searchParams.get("cursor");
  const limitStr = searchParams.get("limit");
  const limit = limitStr ? parseInt(limitStr, 10) : undefined;

  return {
    cursor: cursor || undefined,
    limit: normalizeLimit(limit),
  };
}

/**
 * Parse offset pagination params from URL search params
 */
export function parseOffsetPaginationParams(
  searchParams: URLSearchParams
): OffsetPaginationParams {
  const pageStr = searchParams.get("page");
  const limitStr = searchParams.get("limit");

  return {
    page: pageStr ? Math.max(1, parseInt(pageStr, 10)) : 1,
    limit: normalizeLimit(limitStr ? parseInt(limitStr, 10) : undefined),
  };
}

/**
 * Build pagination query string
 */
export function buildPaginationQuery(
  baseUrl: string,
  params: {
    cursor?: string | null;
    limit?: number;
    [key: string]: string | number | null | undefined;
  }
): string {
  const url = new URL(baseUrl, "http://localhost");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return `${url.pathname}${url.search}`;
}
