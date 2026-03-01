import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CustomDropdown from '../components/CustomDropdown';
import { staticArtists } from '../data/artistsData';
import { resolveImageUrl } from '../utils/imageUtils';

interface DJ {
    id: string;
    name: string;
    genre: string;
    hourlyRate: number;
    rating?: number;
    imageUrl?: string;
    location?: string;
    bio?: string;
    bpm?: string;
    createdAt?: any;
}


const Explore: React.FC = () => {
    const [djs, setDjs] = useState<DJ[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [genreFilter, setGenreFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('rating-desc');
    const [location, setLocation] = useState<string>('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');

    const fetchDjs = async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = {};
            if (location) params.location = location;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;

            const response = await api.get('/djs', { params, signal });
            const data = response.data.data || response.data;
            setDjs(Array.isArray(data) ? data : []);
        } catch (err: any) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load DJs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchDjs(controller.signal);
        return () => controller.abort();
    }, []);

    const genres = ['all', ...Array.from(new Set(djs.map((dj) => dj.genre?.toLowerCase())))].filter(Boolean);

    let filteredDjs = djs.filter((dj) => {
        if (genreFilter === 'all') return true;
        return dj.genre?.toLowerCase() === genreFilter;
    });

    filteredDjs.sort((a, b) => {
        if (sortBy === 'rate-asc') return a.hourlyRate - b.hourlyRate;
        if (sortBy === 'rate-desc') return b.hourlyRate - a.hourlyRate;
        if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
        return 0;
    });

    return (
        <div className="w-full">
                <div className="flex-grow pt-8 px-6 lg:px-20 pb-20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                        <div>
                            <div className="mb-4 flex items-center gap-4 text-xs font-display uppercase tracking-[0.3em] text-white/70">
                                <span className="block h-px w-8 bg-white/50"></span>
                                <span>Active Roster</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase leading-none tracking-tighter">
                                Discover<br />Talent
                            </h1>
                        </div>

                        <div className="flex flex-col gap-4 w-full md:w-auto mt-4 md:mt-0">
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-end">
                                <input
                                    type="text"
                                    placeholder="Location (e.g. Berlin)"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white w-full sm:w-48 placeholder:text-gray-600"
                                />
                                <input
                                    type="number"
                                    placeholder="Min ₹"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white w-full sm:w-28 placeholder:text-gray-600"
                                />
                                <input
                                    type="number"
                                    placeholder="Max ₹"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white w-full sm:w-28 placeholder:text-gray-600"
                                />
                                <button
                                    onClick={() => fetchDjs()}
                                    className="bg-white text-black font-display font-bold uppercase tracking-widest text-xs px-6 py-3 hover:bg-gray-200 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-end">
                                <CustomDropdown
                                    value={genreFilter}
                                    onChange={setGenreFilter}
                                    placeholder="All Genres"
                                    className="w-full sm:w-48"
                                    options={[
                                        { value: 'all', label: 'All Genres' },
                                        ...genres.filter(g => g !== 'all').map(g => ({ value: g as string, label: g as string }))
                                    ]}
                                />

                                <CustomDropdown
                                    value={sortBy}
                                    onChange={setSortBy}
                                    className="w-full sm:w-48"
                                    options={[
                                        { value: 'rating-desc', label: 'Top Rated' },
                                        { value: 'rate-asc', label: 'Rate: Low to High' },
                                        { value: 'rate-desc', label: 'Rate: High to Low' },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Featured Static Artists */}
                    <div className="mb-16">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">// FEATURED_ROSTER</span>
                            <div className="flex-1 h-px bg-white/10"></div>
                            <span className="font-mono text-[10px] text-white/30">RESULTS: {staticArtists.length}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/10 border border-white/10">
                            {staticArtists.map((artist, idx) => (
                                <Link
                                    to={`/artist/${artist.slug}`}
                                    key={artist.slug}
                                    className="artist-card-hover group relative aspect-[3/4] overflow-hidden bg-[#0a0a0a] block"
                                >
                                    <div
                                        className="absolute inset-0 bg-cover bg-center grayscale contrast-125 brightness-90 transition-transform duration-700 ease-out group-hover:scale-105"
                                        style={{ backgroundImage: `url("${artist.imageUrl}")` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                                    <div className="absolute top-4 left-4 right-4 h-px bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                    <div className="absolute bottom-4 left-4 right-4 h-px bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right"></div>
                                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <span className="font-mono text-[10px] bg-white text-black px-1.5 py-0.5 font-bold">
                                                {String(idx + 1).padStart(3, '0')}
                                            </span>
                                            <div className="metadata-reveal flex flex-col items-end gap-1">
                                                <span className="font-mono text-[10px] text-white/70 bg-black/50 backdrop-blur px-2 py-0.5 border border-white/10">{artist.genre.toUpperCase()}</span>
                                                <span className="font-mono text-[10px] text-white/70 bg-black/50 backdrop-blur px-2 py-0.5 border border-white/10">{artist.bpm} BPM</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-display text-4xl font-bold uppercase leading-none tracking-tight mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{artist.name}</h3>
                                            <div className="metadata-reveal space-y-2">
                                                <div className="h-px w-full bg-white/30"></div>
                                                <div className="grid grid-cols-2 gap-4 font-mono text-[10px] text-gray-300 uppercase tracking-wider">
                                                    <div>
                                                        <span className="block text-gray-500">Location</span>
                                                        <span>{artist.location}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-gray-500">Rate</span>
                                                        <span>{artist.rate}</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="block text-gray-500">Next Available</span>
                                                        <span className="text-white">{artist.nextAvailable}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {/* Join Roster Card */}
                            <div className="relative aspect-[3/4] overflow-hidden bg-black flex flex-col items-center justify-center border border-white/5 hidden lg:flex">
                                <div className="absolute inset-0 blueprint-grid opacity-20"></div>
                                <div className="text-center p-8">
                                    <h4 className="font-display text-2xl font-bold uppercase text-white/30 mb-2">Join the Roster</h4>
                                    <p className="font-mono text-[10px] text-gray-500 mb-6 uppercase">Application portal open for 2026 season</p>
                                    <Link to="/signup" className="border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all duration-300 px-6 py-3 text-xs font-mono uppercase tracking-widest inline-block">
                                        Apply Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic API DJs Section */}
                    <div className="flex items-center gap-4 mb-8">
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">// ALL_ARTISTS</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="font-mono text-[10px] text-white/30">RESULTS: {filteredDjs.length}</span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse p-6 flex flex-col justify-end">
                                    <div className="h-8 bg-white/10 w-2/3 mb-4"></div>
                                    <div className="h-4 bg-white/10 w-1/2 mb-2"></div>
                                    <div className="h-4 bg-white/10 w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center border border-red-500/20 bg-red-500/5 backdrop-blur-sm">
                            <p className="font-mono text-red-400 uppercase tracking-widest text-sm mb-4">{error}</p>
                            <button
                                onClick={() => fetchDjs()}
                                className="border border-white/20 hover:bg-white hover:text-black transition-all duration-300 px-6 py-3 text-xs font-mono uppercase tracking-widest"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredDjs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                            {filteredDjs.map((dj, idx) => (
                                <Link to={`/dj/${dj.id}`} key={dj.id} className="group relative aspect-[3/4] overflow-hidden bg-black block">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
                                        style={{ backgroundImage: `url("${resolveImageUrl(dj.imageUrl)}")` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors duration-500"></div>

                                    <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-100 transition-opacity duration-300">
                                        <div className="flex justify-between items-start">
                                            <span className="font-mono text-xs border border-white/30 px-2 py-1 rounded-full backdrop-blur-sm bg-black/30">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                            <span className="material-symbols-outlined text-white rotate-45 group-hover:rotate-0 transition-transform duration-500">
                                                arrow_outward
                                            </span>
                                        </div>

                                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-yellow-400 text-xs">★</span>
                                                <span className="font-mono text-xs text-white">{dj.rating || 'New'}</span>
                                            </div>
                                            <h3 className="text-3xl font-display font-bold uppercase leading-none mb-2">{dj.name}</h3>
                                            <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-500">
                                                <p className="text-sm font-mono text-gray-300 pt-2 border-t border-white/20 mt-2">
                                                    {dj.genre || 'Open Format'}<br />
                                                    Rate: ₹{(dj.hourlyRate || 0).toLocaleString('en-IN')}/hr
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-white/10 bg-black/50 backdrop-blur-sm">
                            <p className="font-mono text-gray-400 uppercase tracking-widest text-sm">No DJs available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
    );
};

export default Explore;
