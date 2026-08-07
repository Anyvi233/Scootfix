// Cloudinary helper
export const CLOUDINARY_BASE = process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/your-cloud-name/image/upload";

/**
 * Build a Cloudinary URL for a given relative image path.
 * If the path is already absolute (http/https), returns it unchanged.
 */
export function cloudinaryUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.replace(/^\//, "");
  return `${CLOUDINARY_BASE}/${clean}`;
}
