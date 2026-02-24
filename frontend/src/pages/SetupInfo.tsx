import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';

const SetupInfo: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [djData, setDjData] = useState({
        genre: '',
        hourlyRate: '',
        bio: '',
        imageUrl: ''
    });

    const [userData, setUserData] = useState({
        location: '',
        favoriteGenres: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (localStorage.getItem(`setupComplete_${user.uid}`)) {
            // Already setup, skip
            redirectUser();
        }
    }, [user, navigate]);

    const redirectUser = () => {
        if (user?.role === 'admin') navigate('/dashboard/admin');
        else if (user?.role === 'dj') navigate('/dashboard/dj');
        else navigate('/explore');
    };

    const handleSkip = () => {
        localStorage.setItem(`setupComplete_${user?.uid}`, 'true');
        redirectUser();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (user?.role === 'dj') {
                await api.post('/djs', {
                    genre: djData.genre,
                    hourlyRate: Number(djData.hourlyRate) || 0,
                    bio: djData.bio,
                    imageUrl: djData.imageUrl
                });
            } else {
                // Mock endpoint or skip if no user profile endpoint exists
                // We just want to mark setup as complete
            }
            localStorage.setItem(`setupComplete_${user?.uid}`, 'true');
            redirectUser();
        } catch (error) {
            console.error('Setup failed', error);
            // Even if it fails (e.g. DJ profile already exists), let them pass
            localStorage.setItem(`setupComplete_${user?.uid}`, 'true');
            redirectUser();
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background-dark text-white font-body selection:bg-white selection:text-black flex flex-col justify-center py-20">
            <div className="grain-overlay"></div>
            <div className="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>

            <main className="relative z-10 w-full max-w-2xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="border border-white/10 bg-black/80 backdrop-blur-xl p-8 md:p-12 relative overflow-hidden text-center"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

                    <div className="size-16 mx-auto bg-white/5 border border-white/20 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-2xl animate-pulse">
                            {user.role === 'dj' ? 'headphones' : 'person'}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight mb-2">Initialize Profile</h1>
                    <p className="font-mono text-sm text-gray-400 mb-10 uppercase tracking-widest">
                        Configure your identity for the network
                    </p>

                    <form onSubmit={handleSubmit} className="text-left space-y-6">
                        {user.role === 'dj' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Primary Genre</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Techno, House, Trance"
                                        value={djData.genre}
                                        onChange={(e) => setDjData({ ...djData, genre: e.target.value })}
                                        className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all placeholder:text-gray-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Hourly Vector [Rate]</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        placeholder="USD"
                                        value={djData.hourlyRate}
                                        onChange={(e) => setDjData({ ...djData, hourlyRate: e.target.value })}
                                        className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all placeholder:text-gray-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Profile Image</label>
                                    <div className="flex items-center gap-4">
                                        {djData.imageUrl && (
                                            <div className="size-16 rounded-full border border-white/20 overflow-hidden shrink-0">
                                                <img src={djData.imageUrl.startsWith('/') ? `${api.defaults.baseURL?.replace('/api', '')}${djData.imageUrl}` : djData.imageUrl} alt="Profile preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setLoading(true);
                                                try {
                                                    const formData = new FormData();
                                                    formData.append('image', file);
                                                    const res = await api.post('/upload', formData, {
                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                    });
                                                    setDjData({ ...djData, imageUrl: res.data.url });
                                                } catch (err) {
                                                    console.error('Failed to upload image.', err);
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-mono file:uppercase file:bg-white file:text-black hover:file:bg-gray-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Sonic Manifesto [Bio]</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Describe your sound architecture..."
                                        value={djData.bio}
                                        onChange={(e) => setDjData({ ...djData, bio: e.target.value })}
                                        className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white transition-all resize-none placeholder:text-gray-600"
                                    ></textarea>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Location Sector</label>
                                    <input
                                        type="text"
                                        placeholder="City, Region"
                                        value={userData.location}
                                        onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                                        className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all placeholder:text-gray-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Preferred Frequencies [Genres]</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Techno, Ambient"
                                        value={userData.favoriteGenres}
                                        onChange={(e) => setUserData({ ...userData, favoriteGenres: e.target.value })}
                                        className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all placeholder:text-gray-600"
                                    />
                                </div>
                            </>
                        )}

                        <div className="pt-8 flex flex-col md:flex-row gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-white text-black font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-gray-200 transition-colors"
                            >
                                {loading ? 'Transmitting...' : 'Save Configuration'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="md:w-1/3 border border-white/30 text-white font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-white hover:text-black transition-all"
                            >
                                Skip Phase
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
};

export default SetupInfo;
