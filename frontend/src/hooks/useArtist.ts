import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import type { ArtistData } from '../types/artist';
import { normalizeBackendDJ } from '../types/artist';
import { getArtistBySlug } from '../data/artistsData';

interface UseArtistResult {
    artist: ArtistData | null;
    loading: boolean;
    error: string | null;
}

/**
 * Fetches a DJ/Artist by ID from the backend API, or falls back to static data if it's a slug.
 * Handles loading, error, cleanup, and normalizes the response.
 */
export const useArtist = (id: string | undefined): UseArtistResult => {
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        if (!id) {
            setLoading(false);
            setError('No artist ID provided.');
            return;
        }

        const controller = new AbortController();

        const fetchArtist = async () => {
            setLoading(true);
            setError(null);

            try {
                // Try backend fetch first
                const response = await api.get(`/djs/${id}`, {
                    signal: controller.signal,
                });
                const raw = response.data?.data || response.data;

                if (mountedRef.current) {
                    setArtist(normalizeBackendDJ(raw));
                }
            } catch (err: any) {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;

                // If backend fetch fails (e.g. 404), maybe it's a static slug
                const staticArtist = getArtistBySlug(id);
                if (staticArtist && mountedRef.current) {
                    // Extract numeric rate from "$5,000" etc.
                    const parsedRate = parseInt(staticArtist.rate.replace(/[^0-9]/g, ''), 10) || 5000;

                    setArtist({
                        id: staticArtist.slug,
                        slug: staticArtist.slug,
                        name: staticArtist.name,
                        genre: staticArtist.genre,
                        bpm: staticArtist.bpm,
                        location: staticArtist.location,
                        hourlyRate: parsedRate,
                        imageUrl: staticArtist.imageUrl,
                        bio: staticArtist.bio,
                        nextAvailable: staticArtist.nextAvailable,
                        rating: 5,
                    });
                } else if (mountedRef.current) {
                    setError('Could not load artist profile.');
                }
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                }
            }
        };

        fetchArtist();

        return () => {
            mountedRef.current = false;
            controller.abort();
        };
    }, [id]);

    return { artist, loading, error };
};
