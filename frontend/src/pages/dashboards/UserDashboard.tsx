import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ensureFirebase } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

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

const UserDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'user') {
            navigate('/login');
            return;
        }

        const { db } = ensureFirebase();
        const uid = user.uid || user._id || user.id;

        if (!uid) {
            setLoading(false);
            return;
        }

        // Real-time Firestore listener
        const q = query(
            collection(db, 'bookings'),
            where('userId', '==', uid)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
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

    const handleCancelBooking = async (id: string) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const { db } = ensureFirebase();
            const { doc, updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'bookings', id), { status: 'cancelled' });
        } catch (err) {
            console.error('Failed to cancel booking:', err);
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
                            <div className="border border-white/10 bg-black/50 backdrop-blur-sm p-12 text-center fade-in">
                                <p className="font-mono text-gray-400 uppercase tracking-widest text-sm mb-6">No bookings found in system.</p>
                                <Link to="/explore" className="bg-white text-black font-display font-bold uppercase tracking-widest px-8 py-4 hover:bg-gray-200 transition-colors inline-block text-xs">
                                    Explore Talent
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {bookings.map((booking, idx) => (
                                    <div
                                        key={booking.id}
                                        className="border border-white/10 bg-black/40 hover:bg-black/60 transition-all duration-500 backdrop-blur-sm p-6 relative group overflow-hidden fade-in"
                                        style={{ animationDelay: `${idx * 150}ms` }}
                                    >
                                        {/* Status Indicator Bar */}
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
                                                    {booking.djName || 'Unknown DJ'}
                                                </h3>
                                                <p className="font-mono text-xs text-gray-400 mb-4">Open Format</p>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm max-w-xl">
                                                    <div>
                                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Event Date</span>
                                                        <span className="text-white">{new Date(booking.targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Session Duration</span>
                                                        <span className="text-white">{booking.hours} Hours</span>
                                                    </div>
                                                    <div className="col-span-2 md:col-span-1">
                                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Venue Location</span>
                                                        <span className="text-white truncate block" title={booking.venueLocation}>{booking.venueLocation}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 gap-4 min-w-[140px]">
                                                <div className="text-left md:text-right">
                                                    <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Fee</span>
                                                    <span className="block text-2xl font-bold font-mono text-white group-hover:text-green-400 transition-colors">
                                                        ₹{(booking.totalAmount || 0).toLocaleString('en-IN')}
                                                    </span>
                                                </div>

                                                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                    <button
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                        className="border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 px-4 py-2 text-[10px] font-display font-bold uppercase tracking-widest"
                                                    >
                                                        Cancel Request
                                                    </button>
                                                )}
                                                {(booking.status === 'confirmed' || booking.status === 'completed') && (
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
                </div>
            </div>
    );
};

export default UserDashboard;
