import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks: React.FC = () => {
    return (
        <div className="px-6 lg:px-20 max-w-6xl mx-auto w-full pb-20 pt-12">
                    <div className="mb-12 flex items-center gap-4 text-xs font-display uppercase tracking-[0.3em] text-white/70 animate-fade-in-up">
                        <span className="block h-px w-12 bg-white/50"></span>
                        <span>Operations Protocol</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-16 text-white leading-none animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        System<br />Mechanics
                    </h1>

                    <div className="grid grid-cols-1 gap-12 mt-16 max-w-4xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="relative border border-white/10 p-8 md:p-12 hover:bg-white/5 transition-colors group">
                            <span className="absolute -top-4 -left-4 font-mono text-sm text-black bg-white px-3 py-1 font-bold">PHASE 01</span>
                            <h3 className="text-2xl md:text-4xl font-display font-bold uppercase text-white mb-4">Discovery</h3>
                            <p className="font-mono text-gray-400 leading-relaxed max-w-2xl">
                                Gain access to our curated directory of artists. Filter incoming signals by genre, geographic coordinates, and booking frequency. Our database is specifically fine-tuned for high-fidelity electronic music.
                            </p>
                        </div>

                        <div className="relative border border-white/10 p-8 md:p-12 hover:bg-white/5 transition-colors group ml-0 md:ml-12">
                            <span className="absolute -top-4 -left-4 font-mono text-sm text-black bg-white px-3 py-1 font-bold">PHASE 02</span>
                            <h3 className="text-2xl md:text-4xl font-display font-bold uppercase text-white mb-4">Transmission</h3>
                            <p className="font-mono text-gray-400 leading-relaxed max-w-2xl">
                                Submit an encrypted booking request directly through the artist's terminal. Detail your event parameters, set timings, and await validation.
                            </p>
                        </div>

                        <div className="relative border border-white/10 p-8 md:p-12 hover:bg-white/5 transition-colors group ml-0 md:ml-24">
                            <span className="absolute -top-4 -left-4 font-mono text-sm text-black bg-white px-3 py-1 font-bold">PHASE 03</span>
                            <h3 className="text-2xl md:text-4xl font-display font-bold uppercase text-white mb-4">Lock & Load</h3>
                            <p className="font-mono text-gray-400 leading-relaxed max-w-2xl">
                                Upon artist approval, the contract is finalized in the system ledger. Monitor upcoming gigs via your personalized dashboard and maintain direct comms until extraction.
                            </p>
                        </div>
                    </div>

                    <div className="mt-24 text-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <Link to="/explore" className="inline-block bg-white text-black font-display font-bold uppercase tracking-widest px-12 py-5 hover:bg-gray-200 transition-colors text-sm hover:scale-105 transform duration-300">
                            Initialize Sequence
                        </Link>
                    </div>
        </div>
    );
};

export default HowItWorks;
