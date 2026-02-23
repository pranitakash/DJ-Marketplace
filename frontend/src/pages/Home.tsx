import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const Home: React.FC = () => {

  return (
    <>
      <div className="grain-overlay"></div>
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>

      <div className="fixed left-6 top-0 bottom-0 w-px bg-white/10 z-40 hidden lg:block">
        <div className="w-full bg-white scroll-progress-bar origin-top"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar isTransparent={true} />

        <main className="flex-grow pl-0 lg:pl-20">
          <section className="relative h-screen w-full flex items-center justify-center overflow-hidden border-b border-white/10">
            <div className="absolute inset-0 z-0 opacity-40">
              <div className="absolute inset-0 bg-cover bg-center grayscale contrast-125 brightness-75 vinyl-spin scale-150" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}></div>
            </div>

            <motion.div
              className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-[90vw]"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="mb-6 flex items-center gap-4 text-xs font-display uppercase tracking-[0.3em] text-white/70">
                <span className="block h-px w-12 bg-white/50"></span>
                <span>Sonic Architecture</span>
                <span className="block h-px w-12 bg-white/50"></span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-8xl md:text-[10rem] lg:text-[12rem] font-display font-bold leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-transparent mix-blend-difference select-none">
                SOUND<br />SYSTEM
              </motion.h1>

              <motion.div variants={itemVariants} className="mt-12 flex flex-col md:flex-row gap-6 w-full max-w-md md:max-w-2xl justify-between items-end">
                <p className="text-left text-sm md:text-base text-gray-400 max-w-xs font-mono">
                  [001] Curating high-fidelity experiences.<br />
                  [002] Connecting venues with sonic artists.
                </p>
                <div className="flex gap-4">
                  <Link to="/explore" className="group relative overflow-hidden bg-white px-8 py-4 text-black transition-all hover:bg-gray-200 hover-butter">
                    <span className="relative z-10 font-display font-bold uppercase tracking-widest text-xs">Book Talent</span>
                  </Link>
                  <Link to="/signup" className="group relative overflow-hidden border border-white px-8 py-4 text-white transition-all hover:bg-white hover:text-black hover-butter">
                    <span className="relative z-10 font-display font-bold uppercase tracking-widest text-xs">Join Roster</span>
                  </Link>
                </div>
              </motion.div>
            </motion.div>

            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
              <span className="font-mono text-xs text-white/50">SCROLL TO EXPLORE</span>
              <span className="font-mono text-xs text-white/50">VOL. 1.0</span>
            </div>
          </section>

          <div className="border-b border-white/10 bg-black py-4 overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee">
              <div className="flex gap-16 px-8">
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white/20">Techno</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white">House</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white/20">Minimal</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white/20">Ambient</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white">Disco</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white/20">Experimental</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white/20">Garage</span>
              </div>
              <div className="flex gap-16 px-8">
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white/20">Techno</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white">House</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white/20">Minimal</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white/20">Ambient</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white">Disco</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white/20">Experimental</span>
                <span className="text-4xl md:text-6xl font-display font-bold uppercase text-white/20">Garage</span>
              </div>
            </div>
          </div>

          <section className="border-b border-white/10 bg-background-dark py-24 px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start mb-20 gap-8">
              <h2 className="text-6xl md:text-7xl font-display font-bold uppercase leading-[0.8] tracking-tighter">
                Select<br />Artists
              </h2>
              <div className="max-w-sm pt-2">
                <p className="font-mono text-sm text-gray-400 mb-6">
                  // ROSTER_V1<br />
                  Hand-picked selectors pushing the boundaries of contemporary sound. From warehouse raves to intimate listening bars.
                </p>
                <Link to="/explore" className="inline-flex items-center gap-2 border-b border-white pb-1 font-display uppercase tracking-widest text-xs hover:text-gray-300">
                  View Full Roster <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
              {/* Artist Card 1 */}
              <Link to="/explore" className="group relative aspect-[3/4] overflow-hidden bg-black block cursor-pointer hover-butter border border-transparent hover:border-white/20">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 grayscale group-hover:grayscale-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}></div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-100 transition-opacity duration-300">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs border border-white/30 px-2 py-1 rounded-full backdrop-blur-sm">01</span>
                    <span className="material-symbols-outlined text-white rotate-45 group-hover:rotate-0 transition-transform duration-500">arrow_outward</span>
                  </div>
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-3xl font-display font-bold uppercase leading-none mb-2">DJ Axon</h3>
                    <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-500">
                      <p className="text-sm font-mono text-gray-300 pt-2 border-t border-white/20 mt-2">
                        Techno / Berlin<br />
                        Rate: €€€
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Artist Card 2 */}
              <Link to="/explore" className="group relative aspect-[3/4] overflow-hidden bg-black block cursor-pointer hover-butter border border-transparent hover:border-white/20">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 grayscale group-hover:grayscale-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574169208538-4f45163ade8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}></div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-100 transition-opacity duration-300">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs border border-white/30 px-2 py-1 rounded-full backdrop-blur-sm">02</span>
                    <span className="material-symbols-outlined text-white rotate-45 group-hover:rotate-0 transition-transform duration-500">arrow_outward</span>
                  </div>
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-3xl font-display font-bold uppercase leading-none mb-2">Vera Ló</h3>
                    <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-500">
                      <p className="text-sm font-mono text-gray-300 pt-2 border-t border-white/20 mt-2">
                        Deep House / Zurich<br />
                        Rate: €€
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Artist Card 3 */}
              <Link to="/explore" className="group relative aspect-[3/4] overflow-hidden bg-black block cursor-pointer hover-butter border border-transparent hover:border-white/20">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 grayscale group-hover:grayscale-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}></div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-100 transition-opacity duration-300">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs border border-white/30 px-2 py-1 rounded-full backdrop-blur-sm">03</span>
                    <span className="material-symbols-outlined text-white rotate-45 group-hover:rotate-0 transition-transform duration-500">arrow_outward</span>
                  </div>
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-3xl font-display font-bold uppercase leading-none mb-2">The Collective</h3>
                    <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-500">
                      <p className="text-sm font-mono text-gray-300 pt-2 border-t border-white/20 mt-2">
                        Minimal / London<br />
                        Rate: €€€€
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Artist Card 4 */}
              <Link to="/explore" className="group relative aspect-[3/4] overflow-hidden bg-black block cursor-pointer hover-butter border border-transparent hover:border-white/20">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 grayscale group-hover:grayscale-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}></div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-100 transition-opacity duration-300">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs border border-white/30 px-2 py-1 rounded-full backdrop-blur-sm">04</span>
                    <span className="material-symbols-outlined text-white rotate-45 group-hover:rotate-0 transition-transform duration-500">arrow_outward</span>
                  </div>
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-3xl font-display font-bold uppercase leading-none mb-2">Mina K</h3>
                    <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-500">
                      <p className="text-sm font-mono text-gray-300 pt-2 border-t border-white/20 mt-2">
                        Experimental / Tokyo<br />
                        Rate: €€
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          <section className="border-b border-white/10 bg-black py-24 px-6 md:px-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
              <div className="h-full w-px bg-white absolute left-1/3"></div>
              <div className="h-full w-px bg-white absolute left-2/3"></div>
              <div className="w-full h-px bg-white absolute top-1/2"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
              <div className="flex flex-col justify-center">
                <div className="mb-12">
                  <h2 className="text-4xl md:text-5xl font-display font-bold uppercase mb-4">Operations<br />Protocol</h2>
                  <p className="text-gray-400 font-mono text-sm max-w-md">Streamlined logistics for complex events. We handle the signal chain from inquiry to performance.</p>
                </div>

                <div className="space-y-8">
                  <div className="group flex gap-6 items-start glass-card hover-butter p-6 -mx-4 rounded cursor-default min-h-[140px]">
                    <span className="font-mono text-xs text-white border border-white/30 size-8 flex items-center justify-center rounded-full flex-shrink-0 group-hover:bg-white group-hover:text-black transition-colors">01</span>
                    <div>
                      <h3 className="text-xl font-display font-bold uppercase mb-1">Discovery Phase</h3>
                      <p className="text-sm text-gray-400 font-mono">Filter database by genre, bpm, and atmosphere requirements.</p>
                    </div>
                  </div>

                  <div className="group flex gap-6 items-start glass-card hover-butter p-6 -mx-4 rounded cursor-default min-h-[140px]">
                    <span className="font-mono text-xs text-white border border-white/30 size-8 flex items-center justify-center rounded-full flex-shrink-0 group-hover:bg-white group-hover:text-black transition-colors">02</span>
                    <div>
                      <h3 className="text-xl font-display font-bold uppercase mb-1">Execution Contract</h3>
                      <p className="text-sm text-gray-400 font-mono">Automated rider verification and secure payment escrow.</p>
                    </div>
                  </div>

                  <div className="group flex gap-6 items-start glass-card hover-butter p-6 -mx-4 rounded cursor-default min-h-[140px]">
                    <span className="font-mono text-xs text-white border border-white/30 size-8 flex items-center justify-center rounded-full flex-shrink-0 group-hover:bg-white group-hover:text-black transition-colors">03</span>
                    <div>
                      <h3 className="text-xl font-display font-bold uppercase mb-1">Live Interface</h3>
                      <p className="text-sm text-gray-400 font-mono">Real-time coordination and technical support during the event.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-[600px] border border-white/10 p-2">
                <div className="h-full w-full relative overflow-hidden bg-[#111]">
                  <div className="absolute inset-0 bg-cover bg-center grayscale contrast-125" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574169208507-84376144848b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")' }}></div>
                  <div className="absolute top-4 left-4 border border-white/30 bg-black/50 backdrop-blur px-3 py-1">
                    <span className="font-mono text-[10px] text-white uppercase tracking-widest">● LIVE SIGNAL</span>
                  </div>
                  <div className="absolute bottom-4 right-4 text-right">
                    <span className="block font-mono text-4xl text-white font-bold tracking-tighter">128 BPM</span>
                    <span className="block font-mono text-[10px] text-gray-400 uppercase">Current Tempo</span>
                  </div>

                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-40 bg-white/20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-[1px] bg-white/20"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
};

export default Home;
