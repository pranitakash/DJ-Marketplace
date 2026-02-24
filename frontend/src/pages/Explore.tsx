import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CustomDropdown from '../components/CustomDropdown';

interface DJ {
    id?: string;
    _id?: string;
    name: string;
    genre: string;
    hourlyRate: number;
    rating: number;
    imageUrl?: string;
    bio?: string;
}


const Explore: React.FC = () => {
    const [djs, setDjs] = useState<DJ[]>([]);
    const [loading, setLoading] = useState(true);
    const [genreFilter, setGenreFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('rating-desc');
    const [location, setLocation] = useState<string>('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');

    const { user, logout } = useAuth();

    const fetchDjs = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (location) params.location = location;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;

            const response = await api.get('/djs', { params });
            const data = response.data.data || response.data;
            setDjs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch DJs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDjs();
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
        <>
            <div className="grain-overlay"></div>
            <div className="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col min-h-screen w-full">
                <header className="fixed top-0 w-full z-50 flex items-center justify-between border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 lg:pl-20 lg:pr-10 py-5">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="size-6 bg-white rounded-full animate-pulse"></div>
                        <h2 className="text-white text-lg font-display font-bold uppercase tracking-widest">DJ Night</h2>
                    </Link>

                    <div className="hidden md:flex items-center gap-12">
                        <nav className="flex gap-8">
                            <Link to="/explore" className="text-white transition-colors text-xs font-display uppercase tracking-widest border-b border-white pb-1">Directory</Link>
                        </nav>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-white text-xs font-display uppercase tracking-widest">{user.name}</span>
                                <button onClick={logout} className="border border-white/30 hover:bg-white hover:text-black hover:border-white transition-all duration-300 px-6 py-2 text-xs font-bold uppercase tracking-widest">
                                    Log Out
                                </button>
                                <Link to={`/dashboard/${user.role || 'user'}`} className="bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all duration-300 px-6 py-2 text-xs font-bold uppercase tracking-widest">
                                    Dashboard
                                </Link>
                            </div>
                        ) : (
                            <Link to="/login" className="border border-white/30 hover:bg-white hover:text-black hover:border-white transition-all duration-300 px-6 py-2 text-xs font-bold uppercase tracking-widest">
                                Log In
                            </Link>
                        )}
                    </div>
                </header>

                <main className="flex-grow pt-32 px-6 lg:px-20 pb-20">
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
                                    placeholder="Min $"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white w-full sm:w-28 placeholder:text-gray-600"
                                />
                                <input
                                    type="number"
                                    placeholder="Max $"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white w-full sm:w-28 placeholder:text-gray-600"
                                />
                                <button
                                    onClick={fetchDjs}
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
                    ) : filteredDjs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                            {filteredDjs.map((dj, idx) => (
                                <Link to={`/dj/${dj.id || dj._id}`} key={dj.id || dj._id || idx} className="group relative aspect-[3/4] overflow-hidden bg-black block">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
                                        style={{ backgroundImage: `url("${dj.imageUrl || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=2071&auto=format&fit=crop'}")` }}
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
                                                    Rate: ${dj.hourlyRate || 0}/hr
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-white/10 bg-black/50 backdrop-blur-sm">
                            <p className="font-mono text-gray-400 uppercase tracking-widest text-sm">No DJs found matching criteria.</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default Explore;
