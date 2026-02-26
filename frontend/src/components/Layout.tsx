import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    isTransparentNavbar?: boolean;
    mainClassName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, isTransparentNavbar = false, mainClassName = "pt-20" }) => {
    return (
        <div className="flex flex-col min-h-screen w-full bg-background-dark text-text-main font-body antialiased selection:bg-white selection:text-black">
            <div className="grain-overlay"></div>
            <div className="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>
            
            <Navbar isTransparent={isTransparentNavbar} />
            
            <main className={`flex-grow ${mainClassName}`}>
                {children}
            </main>
            
            <Footer />
        </div>
    );
};

export default Layout;
