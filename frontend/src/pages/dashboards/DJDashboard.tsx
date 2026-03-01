import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ensureFirebase } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

interface DJProfileData {
    genre: string;
    hourlyRate: string | number;
    bio: string;
    imageUrl: string;
    location: string;
    slug: string;
    bpm?: number;
}

interface Booking {
    id: string;
    djId: string;
    djName: string;
    userId: string;
    userName: string;
    targetDate: string;
    hours: number;
    venueLocation: string;
    totalAmount: number;
    paymentId: string;
    orderId: string;
    status: 'pending' | 'confirmed' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    createdAt: any;
    updatedAt: any;
}

const DJDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'requests' | 'profile' | 'analytics'>('requests');

    const [profile, setProfile] = useState<DJProfileData>({
        genre: '',
        hourlyRate: '',
        bio: '',
        imageUrl: '',
        location: '',
        slug: ''
    });
    const [bookings, setBookings] = useState<Booking[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'dj') {
            navigate('/login');
            return;
        }

        const { db } = ensureFirebase();
        const uid = user.uid || user._id || user.id;

        if (!uid) {
            setLoading(false);
            return;
        }

        // Fetch profile via REST
        const fetchProfile = async () => {
            try {
                const res = await api.get('/djs/me');
                if (res.data?.data) {
                    const data = res.data.data;
                    setProfile({
                        genre: data.genre || '',
                        hourlyRate: data.hourlyRate || '',
                        bio: data.bio || '',
                        imageUrl: data.imageUrl || '',
                        location: data.location || '',
                        slug: data.slug || '',
                        bpm: data.bpm
                    });
                }
            } catch (err) {
                console.error('Failed to fetch DJ profile:', err);
                // Profile might not exist yet; that's fine
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        // Real-time Firestore listener for bookings
        const q = query(
            collection(db, 'bookings'),
            where('djId', '==', uid)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as Booking[];
                
                // Sort locally by createdAt desc to bypass missing composite index
                // Sort locally (bypass missing composite index)
                // Priority: confirmed > pending > cancelled > rejected
                const statusPriority: Record<string, number> = {
                    'confirmed': 0,
                    'accepted': 0,
                    'pending': 1,
                    'cancelled': 2,
                    'rejected': 3,
                    'completed': 4
                };

                data.sort((a, b) => {
                    const priorityA = statusPriority[a.status] ?? 99;
                    const priorityB = statusPriority[b.status] ?? 99;

                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    }

                    // If same status, sort by date (descending)
                    const timeA = a.createdAt?.seconds || (a.createdAt instanceof Date ? a.createdAt.getTime() / 1000 : 0);
                    const timeB = b.createdAt?.seconds || (b.createdAt instanceof Date ? b.createdAt.getTime() / 1000 : 0);
                    return Number(timeB) - Number(timeA);
                });

                setBookings(data);
                setLoading(false);
            },
            (err) => {
                console.error('Firestore query error:', err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, navigate]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFeedbackMsg('');
        try {
            const res = await api.post('/djs', { ...profile, name: user?.name });
            if (res.data?.data) {
                setProfile(res.data.data);
            }
            setFeedbackMsg('Profile updated successfully.');
        } catch (err: any) {
            setFeedbackMsg(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: 'accepted' | 'rejected') => {
        try {
            const { db } = ensureFirebase();
            await updateDoc(doc(db, 'bookings', id), { status: newStatus });
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="size-8 bg-white rounded-full animate-ping"></div>
            </div>
        );
    }

    return (
        <div className="w-full">

                <div className="flex-grow pt-8 px-6 lg:px-20 pb-20 flex w-full max-w-7xl mx-auto gap-12">

                    {/* Sidebar */}
                    <div className="w-64 flex-shrink-0 hidden lg:block">
                        <div className="sticky top-32 space-y-2">
                            <h4 className="font-mono text-xs text-gray-500 uppercase mb-6 tracking-widest px-4">Command Center</h4>

                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`block w-full text-left px-4 py-3 text-sm font-display uppercase tracking-widest transition-colors ${activeTab === 'requests' ? 'text-white bg-white/10 border-l-2 border-white' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                Requests <span className="ml-2 text-[10px] bg-white text-black px-2 py-0.5 rounded-full">{bookings.filter(b => b.status === 'pending').length}</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`block w-full text-left px-4 py-3 text-sm font-display uppercase tracking-widest transition-colors ${activeTab === 'profile' ? 'text-white bg-white/10 border-l-2 border-white' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                Profile Config
                            </button>

                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`block w-full text-left px-4 py-3 text-sm font-display uppercase tracking-widest transition-colors ${activeTab === 'analytics' ? 'text-white bg-white/10 border-l-2 border-white' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                Analytics
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">

                        {/* Requests Tab */}
                        {activeTab === 'requests' && (
                            <div className="fade-in">
                                <div className="mb-10 border-b border-white/10 pb-6 flex justify-between items-end">
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-2 text-white">Signal Ingress</h1>
                                        <p className="font-mono text-sm text-gray-400">Incoming booking requests and active events.</p>
                                    </div>
                                    {bookings.length > 0 && (
                                        <div className="animate-pulse flex items-center gap-2 font-mono text-[10px] text-green-400 uppercase tracking-widest bg-green-400/5 px-3 py-1.5 border border-green-400/20 rounded-full">
                                            <span className="block size-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span> Live Signal
                                        </div>
                                    )}
                                </div>

                                {bookings.length === 0 ? (
                                    <div className="border border-white/10 bg-black/50 backdrop-blur-sm p-12 text-center fade-in">
                                        <p className="font-mono text-gray-400 uppercase tracking-widest text-sm">No signals detected on your frequency.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {bookings.map((booking, idx) => (
                                            <div 
                                                key={booking.id} 
                                                className="border border-white/10 bg-black/40 hover:bg-black/60 transition-all duration-500 backdrop-blur-sm p-6 relative group overflow-hidden fade-in"
                                                style={{ animationDelay: `${idx * 150}ms` }}
                                            >
                                                <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-500 group-hover:w-1.5
                              ${booking.status === 'pending' ? 'bg-yellow-500' : ''}
                              ${booking.status === 'confirmed' || booking.status === 'accepted' ? 'bg-green-500' : ''}
                              ${booking.status === 'rejected' || booking.status === 'cancelled' ? 'bg-red-500' : ''}
                              ${booking.status === 'completed' ? 'bg-blue-500' : ''}
                            `}></div>

                                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pl-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className={`font-mono text-[10px] px-2 py-0.5 uppercase tracking-widest border transition-colors
                                    ${booking.status === 'pending' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' : ''}
                                    ${booking.status === 'confirmed' || booking.status === 'accepted' ? 'border-green-500/50 text-green-500 bg-green-500/10' : ''}
                                    ${booking.status === 'rejected' ? 'border-red-500/50 text-red-500 bg-red-500/10' : ''}
                                    ${booking.status === 'completed' ? 'border-blue-500/50 text-blue-500 bg-blue-500/10' : ''}
                                    ${booking.status === 'cancelled' ? 'border-red-500/50 text-red-400 bg-red-500/10' : ''}
                                  `}>
                                                                {booking.status === 'confirmed' || booking.status === 'accepted' ? 'CONFIRMED' : booking.status.toUpperCase()}
                                                            </span>
                                                            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest ml-auto">
                                                                ID: {booking.id.slice(-6).toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-2xl font-display font-bold uppercase leading-none mb-1 text-white group-hover:tracking-wider transition-all duration-500">
                                                            {booking.userName || 'Unknown Client'}
                                                        </h3>

                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm max-w-xl mt-4">
                                                            <div>
                                                                <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Target Date</span>
                                                                <span className="text-white">{new Date(booking.targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Duration</span>
                                                                <span className="text-white">{booking.hours} Hours</span>
                                                            </div>
                                                            <div className="col-span-2 md:col-span-1">
                                                                <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Location Context</span>
                                                                <span className="text-white truncate block" title={booking.venueLocation}>{booking.venueLocation}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col md:items-end justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 gap-4 min-w-[140px]">
                                                        <div className="text-left md:text-right">
                                                            <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Gross Value</span>
                                                            <span className="block text-2xl font-bold font-mono text-white group-hover:text-yellow-400 transition-colors">₹{(booking.totalAmount || 0).toLocaleString('en-IN')}</span>
                                                        </div>

                                                        {booking.status === 'pending' && (() => {
                                                            const eventDate = new Date(booking.targetDate);
                                                            const now = new Date();
                                                            const hoursUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                                                            const canRespond = hoursUntil >= 5;

                                                            return (
                                                                <div className="flex flex-col gap-2 w-full">
                                                                    <div className="flex gap-2 w-full">
                                                                        <button
                                                                            disabled={!canRespond}
                                                                            onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                                                                            className={`flex-1 bg-white text-black hover:bg-gray-200 transition-colors px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-center ${!canRespond ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                        >
                                                                            Accept
                                                                        </button>
                                                                        <button
                                                                            disabled={!canRespond}
                                                                            onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                                                                            className={`flex-1 border border-white/20 text-white hover:bg-white/10 transition-colors px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-center ${!canRespond ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                        >
                                                                            Decline
                                                                        </button>
                                                                    </div>
                                                                    {!canRespond && (
                                                                        <span className="font-mono text-[8px] text-red-500 uppercase text-center mt-1">Expired ( &lt; 5h )</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="fade-in">
                                <div className="mb-10 border-b border-white/10 pb-6">
                                    <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-2">Profile Config</h1>
                                    <p className="font-mono text-sm text-gray-400">Define your public marketplace presence.</p>
                                </div>

                                {feedbackMsg && (
                                    <div className="mb-6 p-4 border border-white/20 bg-white/5 font-mono text-sm text-white uppercase tracking-widest">
                                        {feedbackMsg}
                                    </div>
                                )}

                                <div className="border border-white/10 bg-black/60 backdrop-blur-md p-8">
                                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Profile Slug (Unique)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. shivani-tech"
                                                    value={profile.slug}
                                                    onChange={(e) => setProfile({ ...profile, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                    className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm lowercase focus:outline-none focus:border-white transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Current Base (City/Location)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Mumbai, India"
                                                    value={profile.location}
                                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                                    className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all"
                                                />
                                            </div>
                                        </div>

                                        {profile.bpm && (
                                            <div className="p-4 border border-yellow-500/30 bg-yellow-500/5 flex items-center justify-between">
                                                <span className="font-mono text-[10px] text-yellow-500 uppercase tracking-widest">Global Telemetry Signature</span>
                                                <span className="font-display font-bold text-white text-xl">{profile.bpm} BPM</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Primary Genre</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Techno, Deep House"
                                                    value={profile.genre}
                                                    onChange={(e) => setProfile({ ...profile, genre: e.target.value })}
                                                    className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Hourly Rate (USD)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    placeholder="0"
                                                    value={profile.hourlyRate}
                                                    onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value })}
                                                    className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Profile Image</label>
                                            <div className="flex items-center gap-4">
                                                {profile.imageUrl && (
                                                    <div className="size-16 rounded-full border border-white/20 overflow-hidden shrink-0">
                                                        <img src={profile.imageUrl.startsWith('/') ? `${api.defaults.baseURL?.replace('/api', '')}${profile.imageUrl}` : profile.imageUrl} alt="Profile preview" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setSaving(true);
                                                        setFeedbackMsg('');
                                                        try {
                                                            const formData = new FormData();
                                                            formData.append('image', file);
                                                            const res = await api.post('/upload', formData, {
                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                            });
                                                            setProfile({ ...profile, imageUrl: res.data.url });
                                                            setFeedbackMsg('Image uploaded successfully.');
                                                        } catch (err) {
                                                            setFeedbackMsg('Failed to upload image.');
                                                        } finally {
                                                            setSaving(false);
                                                        }
                                                    }}
                                                    className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-mono file:uppercase file:bg-white file:text-black hover:file:bg-gray-200"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Biography / Sonic Manifesto</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={profile.bio}
                                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white transition-all resize-none"
                                            ></textarea>
                                        </div>

                                        <div className="pt-6 border-t border-white/10 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="bg-white text-black font-display font-bold uppercase tracking-widest px-8 py-4 hover:bg-gray-200 transition-colors disabled:opacity-50 text-xs"
                                            >
                                                {saving ? 'Transmitting...' : 'Save Configuration'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="fade-in">
                                <div className="mb-10 border-b border-white/10 pb-6">
                                    <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-2">Metrics</h1>
                                    <p className="font-mono text-sm text-gray-400">Performance and telemetry data.</p>
                                </div>

                                {(() => {
                                    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'accepted');
                                    const totalBookings = confirmedBookings.length;
                                    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                                    const upcomingEvents = confirmedBookings.filter(b => {
                                        const d = new Date(b.targetDate);
                                        return d >= new Date();
                                    }).length;

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="border border-white/10 bg-black/50 p-8 flex flex-col justify-between aspect-square">
                                                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Total Bookings</span>
                                                <span className="text-8xl font-display font-bold tracking-tighter text-white">
                                                    {totalBookings}
                                                </span>
                                            </div>

                                            <div className="border border-white/10 bg-black/50 p-8 flex flex-col justify-between aspect-square">
                                                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Total Revenue</span>
                                                <span className="text-6xl md:text-7xl font-display font-bold tracking-tighter text-yellow-400">
                                                    ₹{totalRevenue.toLocaleString('en-IN')}
                                                </span>
                                            </div>

                                            <div className="border border-white/10 bg-white/5 p-8 flex flex-col justify-between aspect-square">
                                                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Upcoming Events</span>
                                                <span className="text-8xl font-display font-bold tracking-tighter text-white">
                                                    {upcomingEvents}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                    </div>
                </div>
            </div>
    );
};

export default DJDashboard;
