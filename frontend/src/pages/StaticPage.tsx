import React from 'react';
import { Link } from 'react-router-dom';

interface StaticPageProps {
    title: string;
}

const StaticPage: React.FC<StaticPageProps> = ({ title }) => {
    return (
        <div className="flex-grow pt-12 px-6 flex items-center justify-center">
                    <div className="text-center glass-card hover-butter p-12 max-w-2xl w-full">
                        <div className="mb-6 flex items-center justify-center gap-4 text-xs font-display uppercase tracking-[0.3em] text-white/70">
                            <span className="block h-px w-8 bg-white/50"></span>
                            <span>System Module</span>
                            <span className="block h-px w-8 bg-white/50"></span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-6 text-white text-balance">{title}</h1>
                        <p className="font-mono text-gray-400 text-sm mb-10 text-balance leading-relaxed">
                            This node focuses on {title}. Access parameters are being refined for full public deployment.
                        </p>
                        <Link to="/explore" className="inline-block bg-white text-black font-display font-bold uppercase tracking-widest px-8 py-4 hover:bg-gray-200 transition-colors text-xs">
                            Return to Directory
                        </Link>
                    </div>
        </div>
    );
};

export default StaticPage;
