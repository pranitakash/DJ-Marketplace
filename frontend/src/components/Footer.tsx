import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const Footer: React.FC = () => {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success'>('idle');
    const [email, setEmail] = useState('');

    const closeModal = () => setActiveModal(null);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribeStatus('success');
            setEmail('');
            setTimeout(() => setSubscribeStatus('idle'), 5000);
        }
    };

    const modalContent: Record<string, { title: string, content: React.ReactNode }> = {
        artists: {
            title: "Artists Network",
            content: "Explore our curated roster of top-tier sound architects. Filter by genre, tempo, and atmosphere to find the perfect sonic signature for your event."
        },
        venues: {
            title: "Venue Protocol",
            content: "We partner with premium locations across the globe. Our platform seamlessly connects world-class artists directly to venue directors, eliminating friction."
        },
        events: {
            title: "Live Events",
            content: "From intimate underground shows to massive warehouse raves, discover the most exclusive events curated by our roster of talented artists."
        },
        pricing: {
            title: "Completely Free",
            content: (
                <div className="space-y-4 text-center">
                    <p className="text-xl font-bold uppercase tracking-widest text-[#00ffcc]">100% Free For All Artists & Venues</p>
                    <p>There are zero subscription fees to use DJ Night.</p>
                    <p>We pride ourselves on a <span className="text-white font-bold">minimum commission-based earning model</span>. We only succeed when you succeed. We take a tiny frictionless cut from successful bookings to maintain the system.</p>
                </div>
            )
        },
        privacy: {
            title: "Privacy Policy",
            content: "Your data is secured through military-grade encryption protocols. We will never sell your personal information. Signal integrity is our absolute priority."
        },
        terms: {
            title: "Terms of Service",
            content: "By accessing the DJ Night platform, you agree to uphold the highest standard of professionalism. All contracts executed on the platform are legally binding."
        }
    };

    return (
        <>
            <footer className="bg-black text-white pt-24 pb-8 border-t border-white/10 w-full relative z-10">
                <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 max-w-7xl mx-auto">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-5xl font-display font-bold uppercase mb-6 tracking-tight">Stay Tuned</h2>
                        <form onSubmit={handleSubscribe} className="flex border-b border-white pb-2 max-w-md relative">
                            <input
                                className="bg-transparent border-none w-full text-white placeholder-gray-500 focus:outline-none px-0 font-mono text-sm uppercase"
                                placeholder="ENTER YOUR EMAIL"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="font-display font-bold uppercase text-sm hover:text-gray-300">Subscribe</button>
                            <AnimatePresence>
                                {subscribeStatus === 'success' && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute -bottom-8 left-0 text-xs font-mono text-[#00ffcc] uppercase tracking-widest"
                                    >
                                        You'll receive an email shortly
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>

                    <div>
                        <h4 className="font-mono text-xs text-gray-500 uppercase mb-6">Directory</h4>
                        <ul className="space-y-4 font-display uppercase tracking-wider text-sm text-gray-400">
                            <li><button onClick={() => setActiveModal('artists')} className="hover:text-white transition-colors">Artists</button></li>
                            <li><button onClick={() => setActiveModal('venues')} className="hover:text-white transition-colors">Venues</button></li>
                            <li><button onClick={() => setActiveModal('events')} className="hover:text-white transition-colors">Events</button></li>
                            <li><button onClick={() => setActiveModal('pricing')} className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors">Pricing</button></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-mono text-xs text-gray-500 uppercase mb-6">Connect</h4>
                        <ul className="space-y-4 font-display uppercase tracking-wider text-sm text-gray-400">
                            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                            <li><a href="https://soundcloud.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">SoundCloud</a></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="px-6 md:px-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-end gap-4 max-w-7xl mx-auto relative">
                    <p className="font-mono text-[10px] text-gray-500 uppercase">
                        © 2023 DJ Night Inc.<br />
                        All rights reserved.
                    </p>
                    <div className="flex gap-4 font-mono text-[10px] text-gray-500 uppercase z-10">
                        <button onClick={() => setActiveModal('privacy')} className="hover:text-white uppercase transition-colors">Privacy Policy</button>
                        <button onClick={() => setActiveModal('terms')} className="hover:text-white uppercase transition-colors">Terms of Service</button>
                    </div>
                    <h2 className="text-[12vw] md:text-[8vw] leading-[0.7] font-display font-bold text-[#111] select-none pointer-events-none absolute bottom-0 right-0 -z-0 opacity-50 overflow-hidden mix-blend-overlay">DJ NIGHT</h2>
                </div>
            </footer>

            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-black border border-white/20 p-8 shadow-2xl glass-card overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>

                            <div className="mb-6 flex items-center gap-4 text-xs font-display uppercase tracking-[0.3em] text-white/70">
                                <span className="block h-px w-8 bg-white/50"></span>
                                <span>Information Log</span>
                            </div>

                            <h3 className="text-3xl font-display font-bold uppercase mb-4 tracking-tight">{modalContent[activeModal].title}</h3>
                            <div className="font-mono text-sm text-gray-300 leading-relaxed">
                                {modalContent[activeModal].content}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Footer;
