import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      login(user, token);

      // Role-based Redirect Logic
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'dj') {
        navigate('/dashboard/dj');
      } else {
        navigate('/explore');
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grain-overlay"></div>
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen w-full items-center justify-center p-6">
        <Link to="/" className="absolute top-8 left-8 text-white flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="size-6 bg-white rounded-full animate-pulse"></div>
          <h2 className="text-lg font-display font-bold uppercase tracking-widest">DJ Night</h2>
        </Link>

        <div className="w-full max-w-md border border-white/10 bg-background-dark/80 backdrop-blur-xl p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-2 text-white">Welcome Back</h2>
            <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">Initialize Session Protocol</p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 flex items-center gap-3 text-red-400 font-mono text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-display flex-col uppercase tracking-widest text-gray-400">Signal ID [Email]</label>
              <input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-display flex-col uppercase tracking-widest text-gray-400">Passcode</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Authenticating...' : 'Establish Connection'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center font-mono text-xs text-gray-500">
            No active profile?{' '}
            <Link to="/signup" className="text-white hover:underline uppercase tracking-wider ml-1">
              Join Roster
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
