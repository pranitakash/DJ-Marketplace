/**
 * Unified artist/DJ type that normalizes both static dummy data
 * and backend Firestore documents into a single shape.
 */
export interface ArtistData {
    id: string;
    slug: string;
    name: string;
    genre: string;
    bpm: string;
    location: string;
    hourlyRate: number;
    imageUrl: string;
    bio: string;
    nextAvailable?: string;
    rating?: number;
}

/**
 * Normalizes a raw backend DJ document into the ArtistData shape.
 * Handles missing fields with safe defaults.
 */
export const normalizeBackendDJ = (raw: Record<string, any>): ArtistData => ({
    id: raw.id || raw._id || '',
    slug: raw.slug || '',
    name: raw.name || 'Unknown Artist',
    genre: raw.genre || 'Open Format',
    bpm: raw.bpm || '--',
    location: raw.location || 'Unknown',
    hourlyRate: typeof raw.hourlyRate === 'number' ? raw.hourlyRate : 0,
    imageUrl: raw.imageUrl || '',
    bio: raw.bio || '',
    nextAvailable: raw.nextAvailable,
    rating: raw.rating,
});
