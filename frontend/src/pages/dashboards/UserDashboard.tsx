import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Booking {
    _id: string;
    dj: {
        name: string;
        genre: string;
    };
    eventDate: string;
    duration: number;
    location: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    totalPrice: number;
}

const UserDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'user') {
            navigate('/login');
        }
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings');
            setBookings(response.data.data || response.data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancelBooking = async (id: string) => {
        if (window.confirm("Are you sure you want to cancel this booking request?")) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings(); // Refresh the list
            } catch (err) {
                console.error('Failed to cancel booking:', err);
            }
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
        <>
            <div className="grain-overlay"></div>
            <div className="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col min-h-screen w-full">
                <header className="fixed top-0 w-full z-50 flex items-center justify-between border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 lg:px-10 py-4">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="size-6 bg-white rounded-full animate-pulse"></div>
                        <h2 className="text-white text-lg font-display font-bold uppercase tracking-widest">DJ Night</h2>
                    </Link>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6 mr-2">
                            <span className="text-white text-xs font-display uppercase tracking-widest">{user?.name}</span>
                            <span className="text-gray-500 font-mono text-[10px] uppercase">Standard Client</span>
                        </div>
                        <button onClick={logout} className="text-gray-400 hover:text-white transition-colors text-xs font-display uppercase tracking-widest">
                            Log Out
                        </button>
                    </div>
                </header>

                <main className="flex-grow pt-28 px-6 lg:px-20 pb-20 flex w-full max-w-7xl mx-auto gap-12">

                    {/* Sidebar */}
                    <div className="w-64 flex-shrink-0 hidden lg:block">
                        <div className="sticky top-32 space-y-2">
                            <h4 className="font-mono text-xs text-gray-500 uppercase mb-6 tracking-widest px-4">Navigation</h4>
                            <Link to="/explore" className="block w-full text-left px-4 py-3 text-sm font-display uppercase tracking-widest text-gray-400 hover:bg-white/5 transition-colors">
                                Directory
                            </Link>
                            <button className="block w-full text-left px-4 py-3 text-sm font-display uppercase tracking-widest text-white bg-white/10 border-l-2 border-white transition-colors">
                                My Events
                            </button>
                            <button className="block w-full text-left px-4 py-3 text-sm font-display uppercase tracking-widest text-gray-400 hover:bg-white/5 transition-colors">
                                Settings
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-10 border-b border-white/10 pb-6">
                            <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-2">My Events</h1>
                            <p className="font-mono text-sm text-gray-400">Manage your active booking requests and event history.</p>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="border border-white/10 bg-black/50 backdrop-blur-sm p-12 text-center">
                                <p className="font-mono text-gray-400 uppercase tracking-widest text-sm mb-6">No bookings found in system.</p>
                                <Link to="/explore" className="bg-white text-black font-display font-bold uppercase tracking-widest px-8 py-4 hover:bg-gray-200 transition-colors inline-block text-xs">
                                    Explore Talent
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="border border-white/10 bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-sm p-6 relative group overflow-hidden">
                                        {/* Status Indicator Bar */}
                                        <div className={`absolute top-0 left-0 w-1 h-full 
                      ${booking.status === 'pending' ? 'bg-yellow-500' : ''}
                      ${booking.status === 'accepted' ? 'bg-green-500' : ''}
                      ${booking.status === 'rejected' ? 'bg-red-500' : ''}
                      ${booking.status === 'completed' ? 'bg-blue-500' : ''}
                    `}></div>

                                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pl-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`font-mono text-[10px] px-2 py-0.5 uppercase tracking-widest border 
                            ${booking.status === 'pending' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' : ''}
                            ${booking.status === 'accepted' ? 'border-green-500/50 text-green-500 bg-green-500/10' : ''}
                            ${booking.status === 'rejected' ? 'border-red-500/50 text-red-500 bg-red-500/10' : ''}
                            ${booking.status === 'completed' ? 'border-blue-500/50 text-blue-500 bg-blue-500/10' : ''}
                          `}>
                                                        {booking.status}
                                                    </span>
                                                    <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                                                        ID: {booking._id.slice(-6).toUpperCase()}
                                                    </span>
                                                </div>

                                                <h3 className="text-2xl font-display font-bold uppercase leading-none mb-1">
                                                    {booking.dj?.name || 'Unknown DJ'}
                                                </h3>
                                                <p className="font-mono text-xs text-gray-400 mb-4">{booking.dj?.genre || 'Open Format'}</p>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm max-w-xl">
                                                    <div>
                                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Date</span>
                                                        <span className="text-white">{new Date(booking.eventDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Duration</span>
                                                        <span className="text-white">{booking.duration} Hours</span>
                                                    </div>
                                                    <div className="col-span-2 md:col-span-1">
                                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Location</span>
                                                        <span className="text-white truncate" title={booking.location}>{booking.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 gap-4">
                                                <div className="text-left md:text-right">
                                                    <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Fee</span>
                                                    <span className="block text-2xl font-bold font-mono text-white">${booking.totalPrice}</span>
                                                </div>

                                                {booking.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelBooking(booking._id)}
                                                        className="border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 px-4 py-2 text-[10px] font-display font-bold uppercase tracking-widest"
                                                    >
                                                        Cancel Request
                                                    </button>
                                                )}
                                                {(booking.status === 'accepted' || booking.status === 'completed') && (
                                                    <button
                                                        className="bg-white text-black hover:bg-gray-200 transition-all duration-300 px-4 py-2 text-[10px] font-display font-bold uppercase tracking-widest"
                                                    >
                                                        Message DJ
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default UserDashboard;
