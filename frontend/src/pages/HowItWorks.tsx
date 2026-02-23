import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks: React.FC = () => {
    return (
        <>
            <div className="grain-overlay"></div>
            <div className="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col min-h-screen w-full">
                <header className="fixed top-0 w-full z-50 flex items-center justify-between border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 py-5">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="size-6 bg-white rounded-full animate-pulse group-hover:bg-gray-300 transition-colors"></div>
                        <h2 className="text-white text-lg font-display font-bold uppercase tracking-widest group-hover:text-gray-300 transition-colors">DJ Night</h2>
                    </Link>
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors text-xs font-display uppercase tracking-widest relative group">
                        Return Home
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </header>

                <main className="flex-grow pt-32 px-6 lg:px-20 max-w-6xl mx-auto w-full pb-20">
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
                </main>
            </div>
        </>
    );
};

export default HowItWorks;
