import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDropdown from '../components/CustomDropdown';
import { createOrder, verifyPayment, loadRazorpayScript } from '../services/payment';
import type { RazorpayPaymentResponse, PaymentStatus } from '../types/payment';
import { useArtist } from '../hooks/useArtist';
import { resolveImageUrl } from '../utils/imageUtils';
import api from '../services/api';
import type { ArtistData } from '../types/artist';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const ArtistProfile: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { artist, loading, error } = useArtist(slug);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookingForm, setBookingForm] = useState({
        date: null as Date | null,
        duration: '2',
        location: '',
    });
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    
    // State for dynamic related DJs
    const [relatedDjs, setRelatedDjs] = useState<ArtistData[]>([]);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const response = await api.get('/djs?limit=4');
                const data = response.data.data || response.data;
                const filtered = Array.isArray(data) ? data.filter((d: any) => d.id !== artist?.id).slice(0, 3) : [];
                setRelatedDjs(filtered);
            } catch (err) {
                console.error("Failed to fetch related DJs");
            }
        };
        if (artist) {
            fetchRelated();
        }
    }, [artist?.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="size-8 bg-white rounded-full animate-ping"></div>
            </div>
        );
    }

    if (error || !artist) {
        return (
            <div className="flex flex-col items-center justify-center text-white font-mono gap-4 py-20 min-h-screen">
                <span className="text-6xl font-display font-bold text-white/10">404</span>
                <span>{error || 'Artist not found.'}</span>
                <Link to="/explore" className="border border-white/30 px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Back to Directory
                </Link>
            </div>
        );
    }

    const RATE_PER_HOUR = artist.hourlyRate || 5000;
    const numericDuration = parseInt(bookingForm.duration) || 0;
    const totalAmount = numericDuration * RATE_PER_HOUR;
    const isDurationValid = numericDuration > 0;

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setBookingForm({
                date: null,
                duration: '2',
                location: '',
            });
            navigate('/login');
            return;
        }
        if (!isDurationValid || !bookingForm.date || !bookingForm.location) return;

        setPaymentStatus('loading');
        setPaymentError(null);

        try {
            // 1. Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                throw new Error('Failed to load Razorpay SDK. Check your internet connection.');
            }

            // 2. Create order on backend (amount calculated server-side)
            const bookingPayload = {
                djId: artist.id || artist.slug,
                djName: artist.name,
                userId: user.uid || user._id || user.id,
                userName: user.name || user.displayName || 'User',
                targetDate: bookingForm.date ? bookingForm.date.toISOString() : '',
                hours: numericDuration,
                venueLocation: bookingForm.location,
            };

            const { order } = await createOrder(bookingPayload);

            // 3. Open Razorpay checkout
            const razorpay = new window.Razorpay({
                key: RAZORPAY_KEY,
                amount: order.amount,
                currency: order.currency,
                name: 'DJ Night',
                description: `Booking: ${artist.name} — ${numericDuration}hr`,
                order_id: order.id,
                handler: async (response: RazorpayPaymentResponse) => {
                    try {
                        // 4. Verify payment on backend
                        const result = await verifyPayment({
                            ...bookingPayload,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (result.success) {
                            setPaymentStatus('success');
                            setShowSuccessToast(true);

                            // Auto-redirect to dashboard after 2 seconds
                            setTimeout(() => {
                                navigate('/dashboard/user');
                            }, 2000);
                        } else {
                            setPaymentStatus('failed');
                            setPaymentError(result.message || 'Payment verification failed.');
                        }
                    } catch (err: any) {
                        setPaymentStatus('failed');
                        setPaymentError(err.response?.data?.message || 'Payment verification failed.');
                    }
                },
                prefill: {
                    name: user.name || user.displayName || '',
                    email: user.email || '',
                    contact: user.phone || '',
                },
                theme: {
                    color: '#ffffff',
                },
                modal: {
                    ondismiss: () => {
                        setPaymentStatus('idle');
                    },
                },
            });

            razorpay.on('payment.failed', (response: any) => {
                setPaymentStatus('failed');
                setPaymentError(response?.error?.description || 'Payment failed. Please try again.');
            });

            razorpay.open();
        } catch (err: any) {
            setPaymentStatus('failed');
            setPaymentError(err.response?.data?.message || err.message || 'Something went wrong.');
        }
    };

    return (
        <div className="w-full">
            {/* Left System Info Bar */}
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
                <div className="flex-grow pt-0">
                    {/* Hero Section */}
                    <section className="relative w-full h-[85vh] border-b border-white/10 overflow-hidden group">
                        <div className="absolute inset-0 z-0">
                            <motion.div
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 10, ease: "easeOut" }}
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale contrast-125 brightness-75"
                                style={{ backgroundImage: `url("${resolveImageUrl(artist.imageUrl)}")` }}
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
                                        {artist.name}
                                    </h1>
                                    <p className="mt-6 text-base md:text-xl text-gray-300 max-w-2xl font-light font-body leading-relaxed line-clamp-2 md:line-clamp-none">
                                        {artist.bio || 'Architect of deep, hypnotic landscapes. Delivering high-fidelity sonic experiences for large-scale warehouse events and intimate underground clubs.'}
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
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{artist.genre}</div>
                                            <div className="h-0.5 w-full bg-white/10 mt-2 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 h-full w-2/3 bg-white"></div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <span className="block text-[10px] font-mono text-gray-400 mb-1">BPM_RANGE</span>
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{artist.bpm} BPM</div>
                                        </div>
                                        <div className="group">
                                            <span className="block text-[10px] font-mono text-gray-400 mb-1">LOCATION</span>
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{artist.location}</div>
                                        </div>
                                        <div className="group">
                                            <span className="block text-[10px] font-mono text-gray-400 mb-1">HOURLY_RATE</span>
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{formatCurrency(RATE_PER_HOUR)}/hr</div>
                                        </div>
                                        {artist.nextAvailable && (
                                            <div className="group">
                                                <span className="block text-[10px] font-mono text-gray-400 mb-1">NEXT_AVAILABLE</span>
                                                <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{artist.nextAvailable}</div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Booking Form */}
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    className="pt-8 border-t border-white/10"
                                >
                                    <h3 className="font-mono text-xs text-white uppercase tracking-widest mb-6 pb-2 border-b border-white/20">Init Booking Protocol</h3>

                                    {paymentStatus === 'success' && (
                                        <div className="mb-6 p-4 border border-green-500/30 bg-green-500/10 text-green-400 font-mono text-xs uppercase tracking-widest text-center">
                                            Payment Verified. Booking Confirmed. Redirecting...
                                        </div>
                                    )}

                                    {paymentError && (
                                        <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-xs uppercase tracking-widest text-center">
                                            {paymentError}
                                        </div>
                                    )}

                                    <form onSubmit={handleBooking} className="space-y-5">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500">Target Date</label>
                                            <DatePicker
                                                selected={bookingForm.date}
                                                onChange={(date: Date | null) => setBookingForm(prev => ({ ...prev, date }))}
                                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all hover:bg-white/5"
                                                placeholderText="SELECT DATE..."
                                                dateFormat="yyyy/MM/dd"
                                                portalId="root-portal"
                                                required
                                                disabled={paymentStatus === 'loading'}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500">Duration Vector</label>
                                            <CustomDropdown
                                                value={bookingForm.duration}
                                                onChange={(val) => setBookingForm(prev => ({ ...prev, duration: val }))}
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
                                                value={bookingForm.location}
                                                onChange={(e) => setBookingForm(prev => ({ ...prev, location: e.target.value }))}
                                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-white transition-all placeholder:text-gray-600 hover:bg-white/5"
                                                disabled={paymentStatus === 'loading'}
                                            />
                                        </div>

                                        <div className="pt-4 pb-2 border-t border-white/5">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">Total Deployment Cost</label>
                                                    <div className="text-3xl font-display font-bold text-white tracking-tighter">
                                                        {formatCurrency(totalAmount)}
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-mono text-gray-600 text-right">
                                                    @{formatCurrency(RATE_PER_HOUR)}/HR
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-6 border-t border-white/10 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={!isDurationValid || paymentStatus === 'loading' || paymentStatus === 'success'}
                                                className="bg-white text-black font-display font-bold uppercase tracking-widest px-6 py-3 hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all text-xs flex items-center gap-2 group"
                                            >
                                                {paymentStatus === 'loading' ? (
                                                    <>
                                                        <span className="inline-block size-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                                                        Processing...
                                                    </>
                                                ) : paymentStatus === 'success' ? (
                                                    'Confirmed ✓'
                                                ) : user ? (
                                                    <>
                                                        Deploy
                                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                                    </>
                                                ) : (
                                                    'Log In to Book'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>

                                {/* Success Toast */}
                                {showSuccessToast && (
                                    <div className="fixed bottom-8 right-8 z-50 bg-green-500 text-black font-display font-bold uppercase tracking-widest px-6 py-4 text-xs animate-bounce shadow-[0_0_30px_rgba(74,222,128,0.5)]">
                                        ✓ BOOKING CONFIRMED — REDIRECTING TO DASHBOARD
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="lg:col-span-8 bg-background-dark">
                            {/* Marquee Header */}
                            <div className="border-b border-white/10 py-6 overflow-hidden bg-black flex relative">
                                <div className="absolute inset-0 z-10 pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
                                <div className="flex whitespace-nowrap animate-marquee">
                                    <span className="text-5xl font-display font-bold uppercase text-transparent px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{artist.genre}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-white px-8">{artist.name}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{artist.location}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{artist.bpm} BPM</span>
                                    <span className="text-5xl font-display font-bold uppercase text-white px-8">{artist.genre}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{artist.name}</span>
                                </div>
                            </div>

                            {/* Bio Section */}
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
                                        {artist.bio || 'Emerging from the concrete depths of the industrial sector, this artist has become synonymous with a sound that is both surgically precise and deeply emotional.'}
                                    </p>
                                    <p>
                                        With a background in sound engineering, they approach each performance as a technical challenge, pushing the venue's sound system to its absolute limits. Their tracks have been played by tastemakers worldwide, cementing their status in the modern electronic scene. Every booking brings a relentless energy and a deeply uncompromising vision of dance music.
                                    </p>
                                </motion.div>
                            </section>

                            {/* Critics Section */}
                            <section className="p-8 md:p-16 bg-[#080808] border-b border-white/10">
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
                                        <span className="absolute -left-3 top-0 bg-[#080808] text-gray-500 text-[10px] font-mono px-1">001</span>
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
                                        <span className="absolute -left-3 top-0 bg-[#080808] text-gray-500 text-[10px] font-mono px-1">002</span>
                                        <blockquote className="text-2xl md:text-3xl font-display uppercase font-light text-white leading-tight mb-4">
                                            "Technical brutalism at its finest. The sound design is impeccable."
                                        </blockquote>
                                        <cite className="not-italic font-mono text-xs text-gray-400 block">— MIXMAG</cite>
                                    </motion.article>
                                </div>
                            </section>

                            {/* More Artists Section */}
                            <section className="p-8 md:p-16">
                                <div className="flex items-start gap-4 mb-12">
                                    <span className="font-mono text-xs text-gray-500 border border-white/20 px-2 py-1">[003] MORE ARTISTS (BACKEND)</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
                                    {relatedDjs.length > 0 ? relatedDjs.map((other, idx) => (
                                        <Link
                                            to={`/dj/${other.id}`}
                                            key={other.id}
                                            className="group relative aspect-[3/4] overflow-hidden bg-black block"
                                        >
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
                                                style={{ backgroundImage: `url("${resolveImageUrl(other.imageUrl)}")` }}
                                            ></div>
                                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors duration-500"></div>
                                            <div className="absolute inset-0 flex flex-col justify-between p-6">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-mono text-[10px] bg-white text-black px-1.5 py-0.5 font-bold">
                                                        {String(idx + 1).padStart(3, '0')}
                                                    </span>
                                                    <span className="material-symbols-outlined text-white rotate-45 group-hover:rotate-0 transition-transform duration-500">
                                                        arrow_outward
                                                    </span>
                                                </div>
                                                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                    <h3 className="text-2xl font-display font-bold uppercase leading-none mb-2">{other.name}</h3>
                                                    <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-500">
                                                        <p className="text-sm font-mono text-gray-300 pt-2 border-t border-white/20 mt-2">
                                                            {other.genre} / {other.location}<br />
                                                            Rate: {formatCurrency(other.hourlyRate)}/hr
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )) : (
                                        <div className="col-span-3 py-10 text-center font-mono text-xs text-gray-500 uppercase">
                                            No additional active recordings.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistProfile;
