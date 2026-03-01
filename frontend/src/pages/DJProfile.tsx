import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDropdown from '../components/CustomDropdown';
import { useArtist } from '../hooks/useArtist';
import { resolveImageUrl } from '../utils/imageUtils';
import { createOrder, verifyPayment, loadRazorpayScript } from '../services/payment';
import type { RazorpayPaymentResponse } from '../types/payment';
import Footer from '../components/Footer';

const DJProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { artist: dj, loading, error } = useArtist(id);

    // Booking Form State
    const [bookingForm, setBookingForm] = useState({
        date: null as Date | null,
        duration: '2',
        location: '',
    });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    // Use environment variable for Razorpay Key
    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

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

        const numericDuration = Number(bookingForm.duration);
        if (!numericDuration || !bookingForm.date || !bookingForm.location) return;

        setPaymentStatus('loading');
        setPaymentError(null);
        setBookingLoading(true);

        try {
            // 1. Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                throw new Error('Failed to load Razorpay SDK. Check your internet connection.');
            }

            // 2. Create order on backend (amount calculated server-side)
            const resolvedDjId = dj?.id || dj?.slug || id;
            if (!resolvedDjId) {
                throw new Error('DJ ID is missing. Cannot proceed with booking.');
            }

            const bookingPayload = {
                djId: resolvedDjId,
                djName: dj?.name || 'Unknown DJ',
                userId: user.uid || user._id || user.id,
                userName: user.name || user.displayName || 'User',
                targetDate: bookingForm.date.toISOString(),
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
                description: `Booking: ${dj?.name || 'DJ'} — ${numericDuration}hr`,
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
                                navigate('/dashboard');
                            }, 2000);
                        } else {
                            throw new Error('Payment verification failed on the server.');
                        }
                    } catch (verifyErr) {
                        console.error('Verification error:', verifyErr);
                        setPaymentStatus('error');
                        setPaymentError('Payment captured but verification failed. Please contact support.');
                    } finally {
                        setBookingLoading(false);
                    }
                },
                prefill: {
                    name: user.name || user.displayName || '',
                    email: user.email || '',
                },
                theme: {
                    color: '#ffffff', // Match your dark theme (white button)
                },
                modal: {
                    ondismiss: () => {
                        setPaymentStatus('idle');
                        setBookingLoading(false);
                    }
                }
            });

            razorpay.on('payment.failed', function (response: any) {
                console.error('Payment failed payload:', response.error);
                setPaymentStatus('error');
                setPaymentError(response.error.description || 'Payment failed. Please try again.');
                setBookingLoading(false);
            });

            razorpay.open();
            
        } catch (err: any) {
             console.error('Booking setup error:', err);
             setPaymentStatus('error');
             setPaymentError(err.message || 'Transmission failed. Try again.');
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
            <div className="min-h-screen bg-background-dark flex items-center justify-center text-white font-mono flex-col gap-4">
                <span className="text-6xl font-display font-bold text-white/10">404</span>
                <span>{error || 'DJ Profile not found.'}</span>
                <Link to="/explore" className="border border-white/30 px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Back to Directory
                </Link>
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="w-full">

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


                <div className="flex-grow pt-0">
                    <section className="relative w-full h-[85vh] border-b border-white/10 overflow-hidden group">
                        <div className="absolute inset-0 z-0">
                            <motion.div
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 10, ease: "easeOut" }}
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale contrast-125 brightness-75"
                                style={{ backgroundImage: `url("${resolveImageUrl(dj.imageUrl)}")` }}
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
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{dj.genre}</div>
                                            <div className="h-0.5 w-full bg-white/10 mt-2 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 h-full w-2/3 bg-white"></div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <span className="block text-[10px] font-mono text-gray-400 mb-1">BPM_RANGE</span>
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{dj.bpm} BPM</div>
                                        </div>
                                        <div className="group">
                                            <span className="block text-[10px] font-mono text-gray-400 mb-1">LOCATION</span>
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{dj.location}</div>
                                        </div>
                                        <div className="group">
                                            <span className="block text-[10px] font-mono text-gray-400 mb-1">HOURLY_RATE</span>
                                            <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{formatCurrency(dj.hourlyRate)}</div>
                                        </div>
                                        {dj.nextAvailable && (
                                            <div className="group">
                                                <span className="block text-[10px] font-mono text-gray-400 mb-1">NEXT_AVAILABLE</span>
                                                <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">{dj.nextAvailable}</div>
                                            </div>
                                        )}
                                        {dj.rating && (
                                            <div className="group">
                                                <span className="block text-[10px] font-mono text-gray-400 mb-1">EXPERIENCE_RATING</span>
                                                <div className="text-2xl font-display uppercase font-medium text-white group-hover:pl-2 transition-all duration-300">★ {dj.rating}</div>
                                            </div>
                                        )}
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
                                    <div className="mb-6">
                                        <h3 className="font-display font-black text-2xl uppercase tracking-widest text-white mb-2">Book Deployment</h3>
                                        <p className="font-mono text-gray-500 text-sm">Secure your timeline vector</p>
                                    </div>
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

                                        {paymentError && (
                                            <div className="bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-start gap-3">
                                                <span className="material-symbols-outlined text-red-500 text-lg shrink-0 mt-0.5">error</span>
                                                <div>
                                                    <p className="text-red-500 font-mono text-xs uppercase tracking-widest font-bold mb-1">Transmission Failed</p>
                                                    <p className="text-red-400/80 font-mono text-[10px]">{paymentError}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-center group">
                                            <div className="font-mono">
                                                <span className="text-gray-500 text-[10px] uppercase tracking-widest block mb-1">Estimated Cost</span>
                                                <span className="text-xl font-bold text-white">{formatCurrency(dj.hourlyRate * Number(bookingForm.duration))}</span>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={bookingLoading || paymentStatus === 'loading'}
                                                className="bg-white text-black font-display font-bold uppercase tracking-widest px-6 py-3 hover:bg-gray-200 transition-colors disabled:opacity-50 text-xs flex items-center gap-2"
                                            >
                                                {paymentStatus === 'loading' ? 'Encrypting...' : (user ? 'Deploy' : 'Log In')}
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
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{dj.genre}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-white px-8">{dj.name}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{dj.location}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{dj.bpm} BPM</span>
                                    <span className="text-5xl font-display font-bold uppercase text-white px-8">{dj.genre}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{dj.name}</span>
                                </div>
                                {/* duplicate for seamless marquee */}
                                <div className="flex whitespace-nowrap animate-marquee absolute top-6 left-full">
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{dj.genre}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-white px-8">{dj.name}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{dj.location}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{dj.bpm} BPM</span>
                                    <span className="text-5xl font-display font-bold uppercase text-white px-8">{dj.genre}</span>
                                    <span className="text-5xl font-display font-bold uppercase text-transparent !text-outline px-8" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>{dj.name}</span>
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
                </div>
            </div>

            {/* Success Toast Overlay */}
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed bottom-8 right-8 z-[9999] bg-white text-black p-6 shadow-2xl max-w-sm border border-black/10 flex gap-4 items-start"
                    >
                        <div className="size-10 bg-black rounded-full flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white text-xl">verified</span>
                        </div>
                        <div>
                            <h4 className="font-display font-black uppercase tracking-widest text-sm mb-1">Link Established</h4>
                            <p className="font-mono text-[10px] text-gray-600 leading-relaxed uppercase">
                                Neural handshake complete. Payment verified. Redirecting to command center...
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default DJProfile;
