import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Stats {
    totalUsers: number;
    totalDJs: number;
    totalBookings: number;
    totalRevenue: number;
}

interface DJAdmin {
    _id: string;
    name: string;
    email: string;
    isBlocked: boolean;
    rating: number;
}

interface BookingAdmin {
    _id: string;
    user: { name: string; email: string };
    dj: { name: string };
    status: string;
    totalPrice: number;
    eventDate: string;
}

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'metrics' | 'talent' | 'ledger'>('metrics');

    const [stats, setStats] = useState<Stats | null>(null);
    const [djs, setDjs] = useState<DJAdmin[]>([]);
    const [bookings, setBookings] = useState<BookingAdmin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [statsRes, djsRes, bookingsRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/djs'),
                    api.get('/admin/bookings')
                ]);

                setStats(statsRes.data.data || statsRes.data);
                setDjs(djsRes.data.data || djsRes.data);
                setBookings(bookingsRes.data.data || bookingsRes.data);
            } catch (err) {
                console.error('Admin fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const toggleBlockStatus = async (djId: string, currentStatus: boolean) => {
        try {
            const endpoint = currentStatus ? `/admin/unblock/${djId}` : `/admin/block/${djId}`;
            await api.put(endpoint);
            setDjs(prev => prev.map(dj => dj._id === djId ? { ...dj, isBlocked: !currentStatus } : dj));
        } catch (err) {
            console.error('Failed to toggle block status:', err);
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
                    <Link to="/" className="flex items-center gap-3 w-1/3">
                        <div className="size-6 bg-red-500 rounded-full animate-pulse"></div>
                        <h2 className="text-white text-lg font-display font-bold uppercase tracking-widest">DJ Night <span className="text-red-500 text-xs ml-2">ADMIN</span></h2>
                    </Link>

                    <div className="flex w-1/3 justify-center text-xs font-mono text-red-400 tracking-[0.3em] uppercase">
                        Overwatch Active
                    </div>

                    <div className="flex items-center justify-end gap-6 w-1/3">
                        <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6 mr-2">
                            <span className="text-white text-xs font-display uppercase tracking-widest">{user?.name}</span>
                            <span className="text-red-400 font-mono text-[10px] uppercase">System Administrator</span>
                        </div>
                        <button onClick={logout} className="text-gray-400 hover:text-white transition-colors text-xs font-display uppercase tracking-widest">
                            Log Out
                        </button>
                    </div>
                </header>

                <main className="flex-grow pt-28 px-6 lg:px-20 pb-20 flex w-full max-w-screen-2xl mx-auto gap-8">

                    {/* Sidebar */}
                    <div className="w-56 flex-shrink-0 hidden lg:block">
                        <div className="sticky top-32 space-y-2">
                            <h4 className="font-mono text-xs text-red-500 uppercase mb-6 tracking-widest px-4">Core Systems</h4>

                            <button
                                onClick={() => setActiveTab('metrics')}
                                className={`block w-full text-left px-4 py-3 text-sm font-display uppercase tracking-widest transition-colors ${activeTab === 'metrics' ? 'text-white bg-red-500/10 border-l-2 border-red-500' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                Command Center
                            </button>

                            <button
                                onClick={() => setActiveTab('talent')}
                                className={`block w-full text-left px-4 py-3 text-sm font-display uppercase tracking-widest transition-colors ${activeTab === 'talent' ? 'text-white bg-red-500/10 border-l-2 border-red-500' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                Talent Moderation
                            </button>

                            <button
                                onClick={() => setActiveTab('ledger')}
                                className={`block w-full text-left px-4 py-3 text-sm font-display uppercase tracking-widest transition-colors ${activeTab === 'ledger' ? 'text-white bg-red-500/10 border-l-2 border-red-500' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                Global Ledger
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">

                        {/* Metrics Tab */}
                        {activeTab === 'metrics' && (
                            <div className="fade-in">
                                <div className="mb-10 border-b border-white/10 pb-6 flex justify-between items-end">
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-2">Command Center</h1>
                                        <p className="font-mono text-sm text-gray-400">High-level platform telemetry and global metrics.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    <div className="border border-white/10 bg-black/50 p-6 flex flex-col justify-between aspect-square md:aspect-auto md:h-48">
                                        <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Global Users</span>
                                        <span className="text-5xl font-display font-bold tracking-tighter text-white">
                                            {stats?.totalUsers || 0}
                                        </span>
                                    </div>

                                    <div className="border border-white/10 bg-black/50 p-6 flex flex-col justify-between aspect-square md:aspect-auto md:h-48">
                                        <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Active Talent</span>
                                        <span className="text-5xl font-display font-bold tracking-tighter text-white">
                                            {stats?.totalDJs || 0}
                                        </span>
                                    </div>

                                    <div className="border border-white/10 bg-black/50 p-6 flex flex-col justify-between aspect-square md:aspect-auto md:h-48">
                                        <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Total Bookings</span>
                                        <span className="text-5xl font-display font-bold tracking-tighter text-white">
                                            {stats?.totalBookings || 0}
                                        </span>
                                    </div>

                                    <div className="border border-red-500/30 bg-red-500/10 p-6 flex flex-col justify-between aspect-square md:aspect-auto md:h-48">
                                        <span className="font-mono text-xs text-red-400 uppercase tracking-widest">Gross Platform Volume</span>
                                        <span className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-white">
                                            ${(stats?.totalRevenue || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Talent Moderation Tab */}
                        {activeTab === 'talent' && (
                            <div className="fade-in">
                                <div className="mb-10 border-b border-white/10 pb-6">
                                    <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-2">Talent Moderation</h1>
                                    <p className="font-mono text-sm text-gray-400">Manage DJ platform access and platform integrity.</p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left font-mono text-sm">
                                        <thead>
                                            <tr className="border-b border-white/20 text-xs text-gray-500 uppercase tracking-widest">
                                                <th className="pb-4 font-normal">ID</th>
                                                <th className="pb-4 font-normal">Alias</th>
                                                <th className="pb-4 font-normal">Email</th>
                                                <th className="pb-4 font-normal">Rating</th>
                                                <th className="pb-4 font-normal">Status</th>
                                                <th className="pb-4 font-normal text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {djs.map((dj) => (
                                                <tr key={dj._id} className="border-b border-white/10 transition-colors hover:bg-white/5">
                                                    <td className="py-4 text-gray-500">{dj._id.slice(-6)}</td>
                                                    <td className="py-4 text-white font-display font-bold uppercase">{dj.name}</td>
                                                    <td className="py-4 text-gray-400">{dj.email}</td>
                                                    <td className="py-4 text-yellow-400">★ {dj.rating}</td>
                                                    <td className="py-4">
                                                        {dj.isBlocked ? (
                                                            <span className="text-[10px] px-2 py-0.5 uppercase tracking-widest border border-red-500 bg-red-500/20 text-red-400">Restricted</span>
                                                        ) : (
                                                            <span className="text-[10px] px-2 py-0.5 uppercase tracking-widest border border-green-500/50 text-green-500">Active</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <button
                                                            onClick={() => toggleBlockStatus(dj._id, dj.isBlocked)}
                                                            className={`px-4 py-2 text-[10px] font-display font-bold uppercase tracking-widest transition-colors ${dj.isBlocked
                                                                ? 'bg-white text-black hover:bg-gray-200'
                                                                : 'border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white'
                                                                }`}
                                                        >
                                                            {dj.isBlocked ? 'Restore Access' : 'Restrict User'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {djs.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="py-8 text-center text-gray-500">No records found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Global Ledger Tab */}
                        {activeTab === 'ledger' && (
                            <div className="fade-in">
                                <div className="mb-10 border-b border-white/10 pb-6">
                                    <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-2">Global Ledger</h1>
                                    <p className="font-mono text-sm text-gray-400">Read-only audit log of all system transactions.</p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left font-mono text-sm">
                                        <thead>
                                            <tr className="border-b border-white/20 text-xs text-gray-500 uppercase tracking-widest">
                                                <th className="pb-4 font-normal">Date (UTC)</th>
                                                <th className="pb-4 font-normal">Transaction ID</th>
                                                <th className="pb-4 font-normal">Client {'->'} Talent</th>
                                                <th className="pb-4 font-normal">Value</th>
                                                <th className="pb-4 font-normal text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((booking) => (
                                                <tr key={booking._id} className="border-b border-white/10 transition-colors hover:bg-white/5">
                                                    <td className="py-4 text-gray-400">{new Date(booking.eventDate).toISOString().split('T')[0]}</td>
                                                    <td className="py-4 text-gray-500">{booking._id.slice(-8).toUpperCase()}</td>
                                                    <td className="py-4">
                                                        <span className="text-white">{booking.user?.name}</span>
                                                        <span className="text-gray-500 mx-2">{'->'}</span>
                                                        <span className="text-white">{booking.dj?.name}</span>
                                                    </td>
                                                    <td className="py-4 text-white font-bold">${booking.totalPrice}</td>
                                                    <td className="py-4 text-right">
                                                        <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest ${booking.status === 'completed' ? 'text-blue-400' :
                                                            booking.status === 'accepted' ? 'text-green-400' :
                                                                booking.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                                                            }`}
                                                        >
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {bookings.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-8 text-center text-gray-500">No transactions recorded.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </>
    );
};

export default AdminDashboard;
