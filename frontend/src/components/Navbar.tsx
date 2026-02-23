import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

interface NavbarProps {
    isTransparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isTransparent = false }) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showLogoutWarning, setShowLogoutWarning] = useState(false);
    const location = useLocation();

    const handleLogoutClick = () => {
        setIsMobileMenuOpen(false);
        setShowLogoutWarning(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutWarning(false);
    };

    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const baseHeaderClass = `fixed top-0 w-full z-50 flex items-center justify-between border-b border-white/10 px-6 lg:pl-20 lg:pr-10 py-5 transition-colors duration-300`;
    const bgClass = isTransparent && !scrolled ? 'bg-transparent' : 'bg-background-dark/80 backdrop-blur-md';

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path;
        return `transition-colors text-xs font-display uppercase tracking-widest relative group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`;
    };

    const getIndicatorClass = (path: string) => {
        const isActive = location.pathname === path;
        return `absolute -bottom-1 left-0 h-px transition-all duration-300 ${isActive ? 'w-full bg-white' : 'w-0 bg-white group-hover:w-full'}`;
    };

    return (
        <>
            <header className={`${baseHeaderClass} ${bgClass}`}>
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="size-6 bg-white rounded-full animate-pulse group-hover:bg-gray-300 transition-colors"></div>
                    <h2 className="text-white text-lg font-display font-bold uppercase tracking-widest group-hover:text-gray-300 transition-colors">DJ Night</h2>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <nav className="flex gap-12">
                        <Link to="/about" className={getLinkClass('/about')}>
                            About
                            <span className={getIndicatorClass('/about')}></span>
                        </Link>
                        <Link to="/how-it-works" className={getLinkClass('/how-it-works')}>
                            How it Works
                            <span className={getIndicatorClass('/how-it-works')}></span>
                        </Link>
                        <Link to="/contact" className={getLinkClass('/contact')}>
                            Contact Us
                            <span className={getIndicatorClass('/contact')}></span>
                        </Link>
                    </nav>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-white text-xs font-display uppercase tracking-widest">{user.name}</span>
                            <button onClick={handleLogoutClick} className="border border-white/30 hover:bg-white hover:text-black hover:border-white transition-all duration-300 px-6 py-2 text-xs font-bold uppercase tracking-widest hover-butter">
                                Log Out
                            </button>
                            <Link to={`/dashboard/${user.role || 'user'}`} className="bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all duration-300 px-6 py-2 text-xs font-bold uppercase tracking-widest hover-butter">
                                Dashboard
                            </Link>
                        </div>
                    ) : (
                        <Link to="/login" className="border border-white/30 hover:bg-white hover:text-black hover:border-white transition-all duration-300 px-6 py-2 text-xs font-bold uppercase tracking-widest hover-butter">
                            Log In
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white z-50">
                    <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 transition-transform duration-500 flex flex-col items-center justify-center gap-8 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-display uppercase tracking-widest text-white hover:text-gray-400">About</Link>
                <Link to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-display uppercase tracking-widest text-white hover:text-gray-400">How it Works</Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-display uppercase tracking-widest text-white hover:text-gray-400">Contact Us</Link>

                {user ? (
                    <div className="flex flex-col items-center gap-6 mt-8">
                        <span className="text-gray-400 font-mono text-sm uppercase tracking-widest border-b border-white/20 pb-2">Logged in as {user.name}</span>
                        <Link to={`/dashboard/${user.role || 'user'}`} onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-black px-12 py-4 text-sm font-bold uppercase tracking-widest w-full text-center">
                            Dashboard
                        </Link>
                        <button onClick={handleLogoutClick} className="border border-white/30 text-white px-12 py-4 text-sm font-bold uppercase tracking-widest w-full text-center hover:bg-white/10">
                            Log Out
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 mt-8 w-64">
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 px-6 py-4 text-sm text-center font-bold uppercase tracking-widest w-full">
                            Log In
                        </Link>
                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-black hover:bg-gray-200 transition-all duration-300 px-6 py-4 text-sm text-center font-bold uppercase tracking-widest w-full">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </div >

            {/* Logout Warning Modal */ }
            <AnimatePresence>
    {
        showLogoutWarning && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowLogoutWarning(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-black border border-white/20 p-8 shadow-2xl glass-card overflow-hidden text-center"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

                    <div className="size-16 rounded-full border border-red-500/50 flex items-center justify-center mx-auto mb-6 text-red-500">
                        <span className="material-symbols-outlined text-3xl">warning</span>
                    </div>

                    <h3 className="text-2xl font-display font-bold uppercase mb-4 tracking-tight">Disconnect Node?</h3>
                    <p className="font-mono text-sm text-gray-400 mb-8 leading-relaxed">
                        You are about to terminate your active session and disconnect from the network.
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowLogoutWarning(false)}
                            className="flex-1 border border-white/30 text-white px-6 py-3 font-display font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmLogout}
                            className="flex-1 bg-white text-black px-6 py-3 font-display font-bold uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-colors"
                        >
                            Confirm Disconnect
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }
            </AnimatePresence >
        </>
    );
};

export default Navbar;
