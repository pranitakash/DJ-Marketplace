import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import api from '../services/api';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grain-overlay"></div>
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen w-full items-center justify-center p-6 py-20">
        <Link to="/" className="absolute top-8 left-8 text-white flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="size-6 bg-white rounded-full animate-pulse"></div>
          <h2 className="text-lg font-display font-bold uppercase tracking-widest">DJ Night</h2>
        </Link>

        <div className="w-full max-w-xl border border-white/10 bg-background-dark/80 backdrop-blur-xl p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-2 text-white">Join the System</h2>
            <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">Configure New Identity Node</p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 flex items-center gap-3 text-red-400 font-mono text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Alias [Name]</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Signal ID [Email]</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-display uppercase tracking-widest text-gray-400">Passcode</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="block text-xs font-display text-center uppercase tracking-widest text-gray-400">Select Access Level</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`cursor-pointer border p-6 flex flex-col items-center justify-center gap-4 transition-all ${formData.role === 'user' ? 'border-white bg-white/5' : 'border-white/20 bg-black/50 hover:bg-white/5'}`}
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                >
                  <span className="text-3xl">🎵</span>
                  <span className="font-display text-xs uppercase tracking-widest font-bold">Standard Node</span>
                </div>
                <div
                  className={`cursor-pointer border p-6 flex flex-col items-center justify-center gap-4 transition-all ${formData.role === 'dj' ? 'border-white bg-white/5' : 'border-white/20 bg-black/50 hover:bg-white/5'}`}
                  onClick={() => setFormData({ ...formData, role: 'dj' })}
                >
                  <span className="text-3xl">🎧</span>
                  <span className="font-display text-xs uppercase tracking-widest font-bold">Professional</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Identity...' : 'Initialize Identity'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-center font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">Alternative Protocols</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                className="w-full border border-white/30 text-white font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                onClick={() => alert("Google Auth Flow Initiated")}
              >
                <div className="size-4 bg-white rounded-full flex items-center justify-center text-black text-[10px] bg-opacity-80">G</div>
                Join via Google
              </button>

              <button
                type="button"
                className="w-full border border-white/30 text-white font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                onClick={() => alert("Phone Auth Flow Initiated")}
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                Join via Phone
              </button>
            </div>
          </div>

          <p className="font-mono text-center text-xs mt-8 text-gray-400">
            Node Already Exists? <Link to="/login" className="text-white hover:underline transition-all">Establish Connection</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
