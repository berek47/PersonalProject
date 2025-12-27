/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns A lowercase, hyphen-separated slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, "-")
    // Remove all non-word chars except hyphens
    .replace(/[^\w\-]+/g, "")
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, "-")
    // Remove leading hyphens
    .replace(/^-+/, "")
    // Remove trailing hyphens
    .replace(/-+$/, "");
}

/**
 * Generate a unique slug by appending a random suffix if needed
 * @param text - The text to convert to a slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(
  text: string,
  existingSlugs: string[] = []
): string {
  const baseSlug = slugify(text);

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Add random suffix to make unique
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${suffix}`;
}

/**
 * Generate a slug with a numeric suffix for duplicates
 * @param text - The text to convert to a slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug with numeric suffix if needed
 */
export function generateNumericSlug(
  text: string,
  existingSlugs: string[] = []
): string {
  const baseSlug = slugify(text);

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}
