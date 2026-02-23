import React from 'react';
import { Link } from 'react-router-dom';

interface StaticPageProps {
    title: string;
}

const StaticPage: React.FC<StaticPageProps> = ({ title }) => {
    return (
        <>
            <div className="grain-overlay"></div>
            <div className="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col min-h-screen w-full">
                <header className="fixed top-0 w-full z-50 flex items-center justify-between border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 py-5">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="size-6 bg-white rounded-full animate-pulse"></div>
                        <h2 className="text-white text-lg font-display font-bold uppercase tracking-widest">DJ Night</h2>
                    </Link>
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors text-xs font-display uppercase tracking-widest">
                        Return Home
                    </Link>
                </header>

                <main className="flex-grow pt-32 px-6 flex items-center justify-center">
                    <div className="text-center border border-white/10 bg-black/50 backdrop-blur-md p-12 max-w-2xl w-full">
                        <div className="mb-6 flex items-center justify-center gap-4 text-xs font-display uppercase tracking-[0.3em] text-white/70">
                            <span className="block h-px w-8 bg-white/50"></span>
                            <span>Information Protocol</span>
                            <span className="block h-px w-8 bg-white/50"></span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-6 text-white text-balance">{title}</h1>
                        <p className="font-mono text-gray-400 text-sm mb-10 text-balance leading-relaxed">
                            This node is currently under active construction. The sonic architecture for the {title} sector is being calibrated. Please check back later.
                        </p>
                        <Link to="/explore" className="inline-block bg-white text-black font-display font-bold uppercase tracking-widest px-8 py-4 hover:bg-gray-200 transition-colors text-xs">
                            Explore Active Roster
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
};

export default StaticPage;
