import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
    isTransparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isTransparent = false }) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const baseHeaderClass = `fixed top-0 w-full z-50 flex items-center justify-between border-b border-white/10 px-6 lg:pl-20 lg:pr-10 py-5 transition-colors duration-300`;
    const bgClass = isTransparent ? 'bg-transparent' : 'bg-background-dark/80 backdrop-blur-md';

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
                        <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-xs font-display uppercase tracking-widest relative group">
                            About
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors text-xs font-display uppercase tracking-widest relative group">
                            How it Works
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-xs font-display uppercase tracking-widest relative group">
                            Contact Us
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </nav>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-white text-xs font-display uppercase tracking-widest">{user.name}</span>
                            <button onClick={logout} className="border border-white/30 hover:bg-white hover:text-black hover:border-white transition-all duration-300 px-6 py-2 text-xs font-bold uppercase tracking-widest hover-butter">
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
                        <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="border border-white/30 text-white px-12 py-4 text-sm font-bold uppercase tracking-widest w-full text-center hover:bg-white/10">
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
        </>
    );
};

export default Navbar;
