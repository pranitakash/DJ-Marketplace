import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface DJDetail {
    id?: string;
    _id?: string;
    name: string;
    genre: string;
    hourlyRate: number;
    rating: number;
    bio: string;
    imageUrl?: string;
}

const DJProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [dj, setDj] = useState<DJDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Booking Form State
    const [bookingDate, setBookingDate] = useState('');
    const [duration, setDuration] = useState('2');
    const [location, setLocation] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDj = async () => {
            try {
                const response = await api.get(`/djs/${id}`);
                setDj(response.data.data || response.data);
            } catch (err) {
                console.error('Failed to fetch DJ:', err);
                setError('Could not load DJ profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchDj();
    }, [id]);

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        setBookingLoading(true);
        setBookingStatus('idle');
        try {
            await api.post('/bookings', {
                djId: dj?.id || dj?._id || id,
                eventDate: bookingDate,
                duration: Number(duration),
                location
            });
            setBookingStatus('success');
            setBookingDate('');
            setLocation('');
            setDuration('2');
        } catch (err) {
            setBookingStatus('error');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="size-8 bg-white rounded-full animate-ping"></div>
            </div>
        );
    }

    if (error || !dj) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center text-white font-mono">
                {error || 'DJ Profile not found.'}
            </div>
        );
    }

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
                            <Link to="/explore" className="text-white transition-colors text-xs font-display uppercase tracking-widest hover:border-b hover:border-white pb-1">Directory</Link>
                        </nav>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-white text-xs font-display uppercase tracking-widest">{user.name}</span>
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
                    <Link to="/explore" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10 font-mono text-xs uppercase tracking-widest transition-colors">
                        <span className="material-symbols-outlined text-sm rotate-180">arrow_forward</span> Back to Directory
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Visual Profile */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="aspect-[3/4] border border-white/10 relative overflow-hidden bg-black p-2">
                                <div className="absolute inset-0 bg-cover bg-center grayscale contrast-125" style={{ backgroundImage: `url("${dj.imageUrl || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=2071&auto=format&fit=crop'}")` }}></div>
                            </div>
                            <div className="border border-white/10 p-6 bg-black/50 backdrop-blur-sm">
                                <h3 className="font-display font-bold uppercase mb-4 text-xl">Sonic Coordinates</h3>
                                <div className="space-y-4 font-mono text-sm text-gray-400">
                                    <div className="flex justify-between border-b border-white/10 pb-2">
                                        <span className="uppercase tracking-widest text-xs">Primary Genre</span>
                                        <span className="text-white">{dj.genre || 'Open Format'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/10 pb-2">
                                        <span className="uppercase tracking-widest text-xs">Standard Rate</span>
                                        <span className="text-white">${dj.hourlyRate || 0}/hr</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/10 pb-2">
                                        <span className="uppercase tracking-widest text-xs">Reputation</span>
                                        <span className="text-yellow-400">★ {dj.rating || 'New'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info and Booking */}
                        <div className="lg:col-span-7">
                            <div className="mb-12">
                                <h1 className="text-6xl md:text-8xl font-display font-bold uppercase leading-none tracking-tighter mb-6">
                                    {dj.name}
                                </h1>
                                <p className="text-gray-300 font-mono leading-relaxed max-w-2xl text-sm border-l border-white/30 pl-4">
                                    {dj.bio || 'Resident selector pushing absolute sonic boundaries. Bringing deep grooves and relentless energy to dance floors worldwide.'}
                                </p>
                            </div>

                            {/* Booking Widget */}
                            <div className="border border-white/10 bg-black/60 backdrop-blur-md p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>

                                <h3 className="font-display font-bold uppercase mb-8 text-2xl flex items-center gap-4">
                                    Request Booking <span className="block h-px flex-1 bg-gradient-to-r from-white/30 to-transparent"></span>
                                </h3>

                                {bookingStatus === 'success' && (
                                    <div className="mb-6 p-4 border border-green-500/30 bg-green-500/10 text-green-400 font-mono text-sm uppercase tracking-widest">
                                        Booking Request Transmitted Successfully.
                                    </div>
                                )}
                                {bookingStatus === 'error' && (
                                    <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-sm uppercase tracking-widest">
                                        Transmission Failed. Please try again.
                                    </div>
                                )}

                                <form onSubmit={handleBooking} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Date of Event</label>
                                            <input
                                                type="date"
                                                required
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Duration (Hours)</label>
                                            <select
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 8, 10].map(h => (
                                                    <option key={h} value={h}>{h} Hours</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Venue Location Coordinates</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Warehouse 42, Brooklyn"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all placeholder:text-gray-600"
                                        />
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-center">
                                        <div className="font-mono">
                                            <span className="text-gray-400 text-xs uppercase tracking-widest block mb-1">Estimated Base Fee</span>
                                            <span className="text-2xl font-bold text-white">${(dj.hourlyRate || 0) * Number(duration)}</span>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={bookingLoading}
                                            className="bg-white text-black font-display font-bold uppercase tracking-widest px-8 py-4 hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                                        >
                                            {bookingLoading ? 'Processing...' : (user ? 'Confirm Signal' : 'Log In to Book')}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default DJProfile;
