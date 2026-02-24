import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDropdown from '../components/CustomDropdown';

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
    const [bookingDate, setBookingDate] = useState<Date | null>(null);
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
                eventDate: bookingDate?.toISOString(),
                duration: Number(duration),
                location
            });
            setBookingStatus('success');
            setBookingDate(null);
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

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
    };

    const durationOptions = [
        { value: '1', label: '1 Hour' },
        { value: '2', label: '2 Hours' },
        { value: '3', label: '3 Hours' },
        { value: '4', label: '4 Hours' },
        { value: '5', label: '5 Hours' },
        { value: '6', label: '6 Hours' },
        { value: '8', label: '8 Hours' },
        { value: '10', label: '10 Hours' },
    ];

    return (
        <div className="bg-background-dark text-text-main font-body antialiased min-h-screen flex flex-col overflow-x-hidden selection:bg-white selection:text-black">
            <div className="grain-overlay"></div>

            {/* Left System Info Bar (Hidden on Mobile, Visible on LG as per template) */}
            <div className="fixed left-0 top-0 bottom-0 w-16 md:w-20 border-r border-white/10 z-40 bg-background-dark hidden lg:flex flex-col items-center justify-between py-8">
                <div className="rotate-90 origin-center whitespace-nowrap text-[10px] font-mono tracking-widest text-gray-500 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    System Online
                </div>
                <div className="flex flex-col gap-8 items-center">
                    <div className="h-32 w-px bg-white/10 relative">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: '50%' }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute top-0 w-full bg-white"
                        ></motion.div>
                    </div>
                    <span className="font-mono text-xs text-gray-500">01</span>
                </div>
                <div className="font-mono text-xs text-gray-500" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    <span className="uppercase tracking-widest">Artist Profile</span>
                </div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen w-full lg:pl-20">

                {/* Navbar (Preserved original functionality but matching the new aesthetics) */}
                <header className="fixed top-0 right-0 left-0 lg:left-20 z-50 flex items-center justify-between border-b border-white/10 bg-background-dark/90 backdrop-blur-md px-6 py-4">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="flex flex-col">
                            <span className="text-xs font-mono text-gray-400 leading-none mb-1">ID: {dj.id?.slice(-6).toUpperCase() || 'AX-909'}</span>
                            <h2 className="text-white text-xl font-display font-bold uppercase tracking-widest leading-none group-hover:text-gray-300 transition-colors">DJ Night</h2>
                        </div>
                    </Link>

                    <div className="flex items-center gap-8">
                        <nav className="hidden md:flex gap-8">
                            <Link to="/explore" className="text-gray-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest">[Directory]</Link>
                        </nav>
                        {user ? (
                            <div className="hidden md:flex items-center gap-4">
                                <span className="text-white text-xs font-mono uppercase tracking-widest truncate max-w-[100px]">{user.name}</span>
                                <Link to={`/dashboard/${user.role || 'user'}`} className="bg-white text-black hover:bg-gray-200 transition-colors px-5 py-2 text-xs font-bold font-mono uppercase tracking-widest">
                                    [Dashboard]
                                </Link>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-white text-black hover:bg-gray-200 transition-colors px-5 py-2 text-xs font-bold font-mono uppercase tracking-widest">
                                Establish Auth
                            </Link>
                        )}
                    </div>
                </header>

                <main className="flex-grow pt-[73px]">
                    <section className="relative w-full h-[85vh] border-b border-white/10 overflow-hidden group">
                        <div className="absolute inset-0 z-0">
                            <motion.div
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 10, ease: "easeOut" }}
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale contrast-125 brightness-75"
                                style={{ backgroundImage: `url("${dj.imageUrl || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=2071&auto=format&fit=crop'}")` }}
                            ></motion.div>
                            <div className="absolute inset-0 blueprint-grid z-10 opacity-30"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-10"></div>
                        </div>
                        <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-12 lg:p-16 pb-0">
                            <div className="flex flex-col md:flex-row items-end justify-between w-full border-t border-white/20 pt-8 pb-12 backdrop-blur-sm">
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeInUp}
                                    className="max-w-4xl"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="px-2 py-1 border border-white/30 text-[10px] font-mono uppercase tracking-widest text-white backdrop-blur-md">Verified Artist</span>
                                        <span className="text-white/50 text-xs font-mono">// SOUND_BASE</span>
                                    </div>
                                    <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-display font-bold leading-[0.8] tracking-tighter text-white uppercase mix-blend-difference break-words overflow-hidden">
                                        {dj.name}
                                    </h1>
                                    <p className="mt-6 text-base md:text-xl text-gray-300 max-w-2xl font-light font-body leading-relaxed line-clamp-2 md:line-clamp-none">
                                        {dj.bio || 'Architect of deep, hypnotic landscapes. Delivering high-fidelity sonic experiences for large-scale warehouse events and intimate underground clubs.'}
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="hidden md:flex flex-col items-end gap-2 mb-2"
                                >
                                    <div className="w-32 h-32 border border-white/20 rounded-full flex items-center justify-center relative animate-[spin_10s_linear_infinite]">
                                        <div className="absolute inset-0 border-t border-white w-full h-full rounded-full"></div>
                                        <span className="material-symbols-outlined text-4xl text-white">album</span>
                                    </div>
                                    <span className="font-mono text-xs text-gray-400">STATUS: ACTIVE RECORDING</span>
                                </motion.div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-12 h-full w-px bg-white/10 hidden md:block"></div>
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/10"></div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 border-r border-white/10 bg-[#0a0a0a] p-8 lg:p-12 sticky top-[73px] self-start h-auto lg:h-[calc(100vh-73px)] overflow-y-auto custom-scrollbar">
                            <div className="space-y-12">
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                >
                                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-6 pb-2 border-b border-white/10">Technical Specifications</h3>
                                    <div className="space-y-6">
                                        <div className="group">
                                            <span className="block text-[10px] font-mono text-gray-400 mb-1">GENRE_CLASSIFICATION</span>
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{dj.genre || 'Open Format'}</div>
                                            <div className="h-0.5 w-full bg-white/10 mt-2 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 h-full w-2/3 bg-white"></div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <span className="block text-[10px] font-mono text-gray-400 mb-1">HOURLY_RATE</span>
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">${dj.hourlyRate || 0} USD</div>
                                        </div>
                                        <div className="group">
                                            <span className="block text-[10px] font-mono text-gray-400 mb-1">EXPERIENCE_RATING</span>
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">★ {dj.rating || 'New'}</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Directly Integrated Booking Form */}
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    className="pt-8 border-t border-white/10"
                                >
                                    <h3 className="font-mono text-xs text-white uppercase tracking-widest mb-6 pb-2 border-b border-white/20">Init Booking Protocol</h3>

                                    {bookingStatus === 'success' && (
                                        <div className="mb-6 p-4 border border-green-500/30 bg-green-500/10 text-green-400 font-mono text-xs uppercase tracking-widest text-center">
                                            Signal Transmitted Successfully.
                                        </div>
                                    )}
                                    {bookingStatus === 'error' && (
                                        <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-xs uppercase tracking-widest text-center">
                                            Transmission Failed. Try again.
                                        </div>
                                    )}

                                    <form onSubmit={handleBooking} className="space-y-5">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500">Target Date</label>
                                            <DatePicker
                                                selected={bookingDate}
                                                onChange={(date: Date | null) => setBookingDate(date)}
                                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all hover:bg-white/5"
                                                placeholderText="SELECT DATE..."
                                                dateFormat="yyyy/MM/dd"
                                                portalId="root-portal"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500">Duration Vector</label>
                                            <CustomDropdown
                                                value={duration}
                                                onChange={setDuration}
                                                options={durationOptions}
                                                className="w-full"
                                                btnClassName="hover:bg-white/5"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500">Venue Coordinates</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="ENTER LOCATION..."
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all placeholder:text-gray-600 hover:bg-white/5"
                                            />
                                        </div>

                                        <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-center group">
                                            <div className="font-mono">
                                                <span className="text-gray-500 text-[10px] uppercase tracking-widest block mb-1">Estimated Cost</span>
                                                <span className="text-xl font-bold text-white">${(dj.hourlyRate || 0) * Number(duration)}</span>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={bookingLoading}
                                                className="bg-white text-black font-display font-bold uppercase tracking-widest px-6 py-3 hover:bg-gray-200 transition-colors disabled:opacity-50 text-xs flex items-center gap-2"
                                            >
                                                {bookingLoading ? 'Processing...' : (user ? 'Deploy' : 'Log In')}
                                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="lg:col-span-8 bg-background-dark">

                            {/* Marquee Header */}
                            <div className="border-b border-white/10 py-6 overflow-hidden bg-black flex relative">
                                <div className="absolute inset-0 z-10 pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
                                <div className="flex whitespace-nowrap animate-marquee">
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>Hypnotic</span>
                                    <span className="text-5xl font-display font-bold uppercase text-white px-8">Techno</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>Warehouse</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>Industrial</span>
                                    <span className="text-5xl font-display font-bold uppercase text-white px-8">Detroit</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>Underground</span>
                                </div>
                                {/* duplicate for seamless marquee */}
                                <div className="flex whitespace-nowrap animate-marquee absolute top-6 left-full">
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>Hypnotic</span>
                                    <span className="text-5xl font-display font-bold uppercase text-white px-8">Techno</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>Warehouse</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>Industrial</span>
                                    <span className="text-5xl font-display font-bold uppercase text-white px-8">Detroit</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>Underground</span>
                                </div>
                            </div>

                            <section className="p-8 md:p-16 border-b border-white/10">
                                <div className="flex items-start gap-4 mb-8">
                                    <span className="font-mono text-xs text-gray-500 border border-white/20 px-2 py-1">[001] BIO</span>
                                </div>
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    className="columns-1 md:columns-2 gap-12 text-sm md:text-base text-gray-300 font-body leading-relaxed text-justify"
                                >
                                    <p className="mb-6 first-letter:text-6xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px] first-letter:text-white">
                                        {dj.bio || 'Emerging from the concrete depths of the industrial sector, this artist has become synonymous with a sound that is both surgically precise and deeply emotional. His sets are architectural constructions, building layer upon layer of rhythmic tension until the release is inevitable.'}
                                    </p>
                                    <p>
                                        With a background in sound engineering, they approach each performance as a technical challenge, pushing the venue's sound system to its absolute limits. Their tracks have been played by tastemakers worldwide, cementing their status in the modern electronic scene. Every booking brings a relentless energy and a deeply uncompromising vision of dance music.
                                    </p>
                                </motion.div>
                            </section>

                            <section className="p-8 md:p-16 bg-[#080808]">
                                <div className="flex items-start gap-4 mb-12">
                                    <span className="font-mono text-xs text-gray-500 border border-white/20 px-2 py-1">[002] CRITICS</span>
                                </div>
                                <div className="space-y-12">
                                    <motion.article
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6 }}
                                        viewport={{ once: true }}
                                        className="relative pl-8 border-l border-white/20"
                                    >
                                        <span className="absolute -left-3 top-0 bg-background-dark text-gray-500 text-[10px] font-mono px-1">001</span>
                                        <blockquote className="text-2xl md:text-3xl font-display uppercase font-light text-white leading-tight mb-4">
                                            "A masterclass in tension and release. They don't just play tracks; they rewire the room's energy."
                                        </blockquote>
                                        <cite className="not-italic font-mono text-xs text-gray-400 block">— RESIDENT ADVISOR</cite>
                                    </motion.article>

                                    <motion.article
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        viewport={{ once: true }}
                                        className="relative pl-8 border-l border-white/20"
                                    >
                                        <span className="absolute -left-3 top-0 bg-background-dark text-gray-500 text-[10px] font-mono px-1">002</span>
                                        <blockquote className="text-2xl md:text-3xl font-display uppercase font-light text-white leading-tight mb-4">
                                            "Technical brutalism at its finest. The sound design is impeccable."
                                        </blockquote>
                                        <cite className="not-italic font-mono text-xs text-gray-400 block">— MIXMAG</cite>
                                    </motion.article>
                                </div>
                            </section>

                        </div>
                    </div>
                </main>
            </div>
            {/* Footer remains global if exist or omit here since it's global layout usually, 
                Wait, app uses global footer or page-specific? Explore has no footer. 
                DJProfile originally just has <main>. We'll end here. */}
        </div>
    );
};

export default DJProfile;
