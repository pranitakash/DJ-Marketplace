import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { io } from 'socket.io-client';

interface DJProfileData {
    genre: string;
    hourlyRate: string | number;
    bio: string;
    imageUrl: string;
}

interface Booking {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    eventDate: string;
    duration: number;
    location: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    totalPrice: number;
    eventType?: string;
}

const MOCK_BOOKINGS: Booking[] = [
    {
        _id: 'mock_1',
        user: { name: 'Rohan Sharma', email: 'rohan@example.com' },
        eventType: 'Wedding',
        eventDate: '2026-03-12T00:00:00.000Z',
        duration: 4,
        location: 'Delhi',
        status: 'pending',
        totalPrice: 1200
    },
    {
        _id: 'mock_2',
        user: { name: 'Priya Events', email: 'priya@example.com' },
        eventType: 'College Fest',
        eventDate: '2026-03-25T00:00:00.000Z',
        duration: 6,
        location: 'Noida',
        status: 'accepted',
        totalPrice: 800
    },
    {
        _id: 'mock_3',
        user: { name: 'Aman Verma', email: 'aman@example.com' },
        eventType: 'Birthday Party',
        eventDate: '2026-04-02T00:00:00.000Z',
        duration: 3,
        location: 'Gurgaon',
        status: 'pending',
        totalPrice: 450
    },
    {
        _id: 'mock_4',
        user: { name: 'Elite Corp', email: 'elite@example.com' },
        eventType: 'Corporate Event',
        eventDate: '2026-04-18T00:00:00.000Z',
        duration: 5,
        location: 'Delhi',
        status: 'accepted',
        totalPrice: 2200
    },
    {
        _id: 'mock_5',
        user: { name: 'DJ Carnival', email: 'carnival@example.com' },
        eventType: 'Club Night',
        eventDate: '2026-04-30T00:00:00.000Z',
        duration: 4,
        location: 'Faridabad',
        status: 'pending',
        totalPrice: 1500
    }
];

interface Analytics {
    totalBookings: number;
    totalRevenue: number;
    upcomingEvents: number;
}

const MOCK_ANALYTICS: Analytics = {
    totalBookings: 128,
    totalRevenue: 12450,
    upcomingEvents: 6
};

const DJDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'requests' | 'profile' | 'analytics'>('requests');

    const [profile, setProfile] = useState<DJProfileData>({
        genre: '',
        hourlyRate: '',
        bio: '',
        imageUrl: ''
    });
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'dj') {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [profileRes, bookingsRes, analyticsRes] = await Promise.all([
                    api.get('/djs/me').catch(() => ({ data: { data: null } })), // May not exist yet
                    api.get('/bookings/dj'),
                    api.get('/djs/analytics')
                ]);

                if (profileRes.data?.data) {
                    setProfile(profileRes.data.data);
                }
                setBookings(bookingsRes.data?.data || bookingsRes.data || []);
                setAnalytics(analyticsRes.data?.data || analyticsRes.data || null);
            } catch (err) {
                console.error('Data fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Setup Socket
        const newSocket = io(api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000', {
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.on('newBooking', (booking: Booking) => {
            setBookings(prev => [booking, ...prev]);
        });

        newSocket.on('bookingStatusUpdate', (updated: Booking) => {
            setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user, navigate]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFeedbackMsg('');
        try {
            // Create or update
            await api.post('/djs', { ...profile, name: user?.name });
            setFeedbackMsg('Profile updated successfully.');
        } catch (err) {
            setFeedbackMsg('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: 'accepted' | 'rejected') => {
        try {
            await api.put(`/bookings/${id}/status`, { status: newStatus });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
        } catch (err) {
            console.error('Failed to update status:', err);
            // Fallback: reload bookings
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
                                    {(bookings.length > 0 || MOCK_BOOKINGS.length > 0) && (
                                        <div className="animate-pulse flex items-center gap-2 font-mono text-[10px] text-green-400 uppercase tracking-widest bg-green-400/5 px-3 py-1.5 border border-green-400/20 rounded-full">
                                            <span className="block size-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span> Live Signal
                                        </div>
                                    )}
                                </div>

                                {(() => {
                                    const displayBookings = bookings.length > 0 ? bookings : MOCK_BOOKINGS;

                                    if (displayBookings.length === 0) {
                                        return (
                                            <div className="border border-white/10 bg-black/50 backdrop-blur-sm p-12 text-center fade-in">
                                                <p className="font-mono text-gray-400 uppercase tracking-widest text-sm">No signals detected on your frequency.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-6">
                                            {displayBookings.map((booking, idx) => (
                                                <div 
                                                    key={booking._id} 
                                                    className="border border-white/10 bg-black/40 hover:bg-black/60 transition-all duration-500 backdrop-blur-sm p-6 relative group overflow-hidden fade-in"
                                                    style={{ animationDelay: `${idx * 150}ms` }}
                                                >
                                                    <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-500 group-hover:w-1.5
                              ${booking.status === 'pending' ? 'bg-yellow-500' : ''}
                              ${booking.status === 'accepted' ? 'bg-green-500' : ''}
                              ${booking.status === 'rejected' ? 'bg-red-500' : ''}
                              ${booking.status === 'completed' ? 'bg-blue-500' : ''}
                            `}></div>

                                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pl-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className={`font-mono text-[10px] px-2 py-0.5 uppercase tracking-widest border transition-colors
                                    ${booking.status === 'pending' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' : ''}
                                    ${booking.status === 'accepted' ? 'border-green-500/50 text-green-500 bg-green-500/10' : ''}
                                    ${booking.status === 'rejected' ? 'border-red-500/50 text-red-500 bg-red-500/10' : ''}
                                    ${booking.status === 'completed' ? 'border-blue-500/50 text-blue-500 bg-blue-500/10' : ''}
                                  `}>
                                                                    {booking.status === 'accepted' ? 'CONFIRMED' : booking.status.toUpperCase()}
                                                                </span>
                                                                {booking.eventType && (
                                                                    <span className="font-mono text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 border border-white/10 uppercase tracking-widest">
                                                                        {booking.eventType}
                                                                    </span>
                                                                )}
                                                                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest ml-auto">
                                                                    ID: {booking._id.startsWith('mock_') ? `DEMO-${booking._id.split('_')[1]}` : booking._id.slice(-6).toUpperCase()}
                                                                </span>
                                                            </div>

                                                            <h3 className="text-2xl font-display font-bold uppercase leading-none mb-1 text-white group-hover:tracking-wider transition-all duration-500">
                                                                {booking.user?.name || 'Unknown Client'}
                                                            </h3>

                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm max-w-xl mt-4">
                                                                <div>
                                                                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Target Date</span>
                                                                    <span className="text-white">{new Date(booking.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Duration</span>
                                                                    <span className="text-white">{booking.duration} Hours</span>
                                                                </div>
                                                                <div className="col-span-2 md:col-span-1">
                                                                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Location Context</span>
                                                                    <span className="text-white truncate block" title={booking.location}>{booking.location}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col md:items-end justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 gap-4 min-w-[140px]">
                                                            <div className="text-left md:text-right">
                                                                <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Gross Value</span>
                                                                <span className="block text-2xl font-bold font-mono text-white group-hover:text-yellow-400 transition-colors">${booking.totalPrice.toLocaleString()}</span>
                                                            </div>

                                                            {!booking._id.startsWith('mock_') && booking.status === 'pending' && (
                                                                <div className="flex gap-2 w-full">
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                                                                        className="flex-1 bg-white text-black hover:bg-gray-200 transition-colors px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-center"
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                                        className="flex-1 border border-white/20 text-white hover:bg-white/10 transition-colors px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-center"
                                                                    >
                                                                        Decline
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {booking._id.startsWith('mock_') && (
                                                                <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] italic">Telemetry Simulation</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
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
                                    // Logic: Use real data if any value is non-zero, otherwise fallback to mock
                                    const hasRealData = analytics && (analytics.totalBookings > 0 || analytics.totalRevenue > 0 || analytics.upcomingEvents > 0);
                                    const displayData = hasRealData ? analytics : MOCK_ANALYTICS;

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="border border-white/10 bg-black/50 p-8 flex flex-col justify-between aspect-square">
                                                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Total Bookings</span>
                                                <span className="text-8xl font-display font-bold tracking-tighter text-white">
                                                    {displayData.totalBookings}
                                                </span>
                                            </div>

                                            <div className="border border-white/10 bg-black/50 p-8 flex flex-col justify-between aspect-square">
                                                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Total Revenue</span>
                                                <span className="text-6xl md:text-7xl font-display font-bold tracking-tighter text-yellow-400">
                                                    ${displayData.totalRevenue.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="border border-white/10 bg-white/5 p-8 flex flex-col justify-between aspect-square">
                                                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Upcoming Events</span>
                                                <span className="text-8xl font-display font-bold tracking-tighter text-white">
                                                    {displayData.upcomingEvents}
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
