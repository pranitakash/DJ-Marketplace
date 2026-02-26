import React, { useState } from 'react';

const ContactUs: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setTimeout(() => {
            setStatus('sent');
            setFormData({ name: '', email: '', message: '' });
        }, 1500);
    };

    return (
        <div className="px-6 lg:px-20 max-w-6xl mx-auto w-full pb-20 pt-12">
                    <div className="mb-12 flex items-center gap-4 text-xs font-display uppercase tracking-[0.3em] text-white/70 animate-fade-in-up">
                        <span className="block h-px w-12 bg-white/50"></span>
                        <span>Transmission Matrix</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-16 text-white leading-none animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        Establish<br />Contact
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-20 animate-fade-in-up" style={{ animationDelay: '200ms' }}>

                        {/* Contact Form */}
                        <div className="border border-white/10 p-8 bg-black/40 backdrop-blur-sm">
                            <h3 className="text-2xl font-display font-bold uppercase text-white mb-6">Direct Line</h3>

                            {status === 'sent' ? (
                                <div className="py-20 text-center">
                                    <div className="size-16 rounded-full border border-green-500/50 flex items-center justify-center mx-auto mb-6 text-green-400">
                                        <span className="material-symbols-outlined text-3xl">check</span>
                                    </div>
                                    <h4 className="text-xl font-display font-bold uppercase tracking-widest text-white mb-2">Signal Received</h4>
                                    <p className="font-mono text-xs text-gray-400">Our operations team will respond shortly.</p>
                                    <button onClick={() => setStatus('idle')} className="mt-8 border-b border-white text-xs font-display uppercase hover:text-gray-400 py-1">Send another dispatch</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500">Call Sign [Name]</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all transition-colors duration-300 placeholder:text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500">Return Vector [Email]</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all transition-colors duration-300 placeholder:text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500">Payload [Message]</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all transition-colors duration-300 placeholder:text-gray-700"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="w-full bg-white text-black font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        {status === 'sending' ? 'Transmitting...' : 'Send Signal'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* General Info */}
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-4 border-b border-white/10 pb-2">HQ Coordinate</h3>
                                <p className="font-mono text-white text-sm leading-relaxed">
                                    DJ Night Operations<br />
                                    100 Techno Allee<br />
                                    Friedrichshain, Berlin 10243<br />
                                    Germany
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-4 border-b border-white/10 pb-2">Electronic Comms</h3>
                                <p className="font-mono text-white text-sm leading-relaxed space-y-2">
                                    <span className="block hover:text-gray-400 cursor-pointer transition-colors">booking@djnight.com</span>
                                    <span className="block hover:text-gray-400 cursor-pointer transition-colors">support@djnight.com</span>
                                    <span className="block hover:text-gray-400 cursor-pointer transition-colors">press@djnight.com</span>
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-4 border-b border-white/10 pb-2">Frequency</h3>
                                <div className="flex gap-4 font-display font-bold uppercase tracking-wider text-xs">
                                    <a href="#" className="border border-white/30 px-6 py-2 hover:bg-white hover:text-black transition-colors">Instagram</a>
                                    <a href="#" className="border border-white/30 px-6 py-2 hover:bg-white hover:text-black transition-colors">Soundcloud</a>
                                </div>
                            </div>
                        </div>

                    </div>
        </div>
    );
};

export default ContactUs;
