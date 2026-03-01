/**
 * Resolves a DJ/Artist image URL to its full absolute form.
 * - Returns fallback if url is falsy
 * - Returns url as-is if it's already absolute (http/https)
 * - Prepends the API base URL for relative paths (e.g. /uploads/...)
 */

const API_BASE = (
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace('/api', '');

const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=2071&auto=format&fit=crop';

export const resolveImageUrl = (url?: string | null): string => {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
};
