import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs: React.FC = () => {
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
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors text-xs font-display uppercase tracking-widest">
                        Return Home
                    </Link>
                </header>

                <main className="flex-grow pt-32 px-6 lg:px-20 max-w-6xl mx-auto w-full pb-20">
                    <div className="mb-12 flex items-center gap-4 text-xs font-display uppercase tracking-[0.3em] text-white/70 animate-fade-in-up">
                        <span className="block h-px w-12 bg-white/50"></span>
                        <span>Origin Story</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-16 text-white leading-none animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        Sonic<br />Architecture
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-20 animate-fade-in-up min-h-[500px]" style={{ animationDelay: '200ms' }}>
                        <div className="space-y-8">
                            <p className="font-mono text-gray-400 text-sm leading-relaxed">
                                [001] DJ Night was conceptualized in the underground techno bunkers of Berlin. We recognized a latency in the signal chain between high-fidelity selectors and the venues that rely on them.
                            </p>
                            <p className="font-mono text-gray-400 text-sm leading-relaxed">
                                [002] Our platform acts as a low-noise operational amplifier. We strip away the archaic booking bureaucracy, introducing a glass-smooth interface that connects raw talent directly with promoters worldwide.
                            </p>
                            <div className="pt-8 border-t border-white/10">
                                <h3 className="text-2xl font-display font-bold uppercase text-white mb-4">Core Principles</h3>
                                <ul className="space-y-4 font-mono text-sm text-gray-400">
                                    <li className="flex gap-4"><span className="text-white">●</span> Quality Control over Quantity</li>
                                    <li className="flex gap-4"><span className="text-white">●</span> Transparent Financial Routing</li>
                                    <li className="flex gap-4"><span className="text-white">●</span> Real-time Operational Support</li>
                                </ul>
                            </div>
                        </div>

                        <div className="relative border border-white/10 overflow-hidden group">
                            <div className="absolute inset-0 bg-cover bg-center grayscale contrast-125 transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}></div>
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
                            <div className="absolute bottom-6 left-6 border border-white/30 bg-black/50 backdrop-blur-md px-4 py-2">
                                <span className="font-mono text-[10px] text-white uppercase tracking-widest">HQ / Berlin, DE</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div >
        </>
    );
};

export default AboutUs;
