import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type {
  ConfirmationResult,
  RecaptchaVerifier,
} from 'firebase/auth';
import {
  signInWithGoogle,
  setupRecaptcha,
  sendPhoneOtp,
  confirmPhoneOtp,
  saveUserToFirestore,
} from '../services/firebaseAuth';
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Phone auth state
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const { login } = useAuth();
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

  // ─── Redirect helper based on role ─────────────────────────────────────────
  const redirectToDashboard = (role: string) => {
    if (role === 'admin') {
      navigate('/dashboard/admin');
    } else if (role === 'dj') {
      navigate('/dashboard/dj');
    } else {
      navigate('/explore');
    }
  };

  // ─── Google Sign Up ────────────────────────────────────────────────────────
  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      const user = result.user;

      await saveUserToFirestore(
        user.uid,
        user.displayName || 'User',
        user.email || '',
        formData.role
      );

      login(
        {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          role: formData.role,
        },
        await user.getIdToken()
      );

      redirectToDashboard(formData.role);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Silently ignore duplicate popup requests
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ─── Phone Auth: Send OTP ──────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number with country code (e.g. +91XXXXXXXXXX)');
      return;
    }

    setPhoneLoading(true);
    setError('');

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = setupRecaptcha('recaptcha-container');
      }

      const confirmationResult = await sendPhoneOtp(phoneNumber, recaptchaVerifierRef.current);
      confirmationResultRef.current = confirmationResult;
      setOtpSent(true);
    } catch (err: any) {
      // Reset recaptcha on error so it can be re-created
      recaptchaVerifierRef.current = null;

      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Use format: +91XXXXXXXXXX');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  // ─── Phone Auth: Verify OTP ────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    if (!confirmationResultRef.current) {
      setError('Session expired. Please resend the OTP.');
      return;
    }

    setPhoneLoading(true);
    setError('');

    try {
      const result = await confirmPhoneOtp(confirmationResultRef.current, otp);
      const user = result.user;

      await saveUserToFirestore(
        user.uid,
        user.displayName || 'Phone User',
        user.email || '',
        formData.role
      );

      login(
        {
          uid: user.uid,
          name: user.displayName || 'Phone User',
          email: user.email || user.phoneNumber || '',
          role: formData.role,
        },
        await user.getIdToken()
      );

      redirectToDashboard(formData.role);
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please resend.');
        setOtpSent(false);
      } else {
        setError(err.message || 'OTP verification failed.');
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
      <div className="flex flex-col w-full items-center justify-center p-6 py-12">

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
                disabled={googleLoading}
                className="w-full border border-white/30 text-white font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGoogleSignup}
              >
                {googleLoading ? (
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="size-4 bg-white rounded-full flex items-center justify-center text-black text-[10px] bg-opacity-80">G</div>
                )}
                {googleLoading ? 'Connecting...' : 'Join via Google'}
              </button>

              <button
                type="button"
                disabled={phoneLoading}
                className="w-full border border-white/30 text-white font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setShowPhoneInput(!showPhoneInput);
                  setError('');
                }}
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                Join via Phone
              </button>
            </div>

            {/* Phone Auth Input Section */}
            {showPhoneInput && (
              <div className="mt-6 space-y-4 p-4 border border-white/10 bg-black/30">
                {!otpSent ? (
                  <>
                    <label className="block text-xs font-display uppercase tracking-widest text-gray-400">
                      Phone Number (with country code)
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91XXXXXXXXXX"
                      className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      disabled={phoneLoading}
                      onClick={handleSendOtp}
                      className="w-full bg-white text-black font-display font-bold uppercase tracking-widest text-xs py-3 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {phoneLoading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-mono text-green-400 uppercase tracking-widest">
                      ✓ OTP sent to {phoneNumber}
                    </p>
                    <label className="block text-xs font-display uppercase tracking-widest text-gray-400">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 font-mono text-sm text-center tracking-[0.5em] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-gray-600"
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={phoneLoading}
                        onClick={handleVerifyOtp}
                        className="flex-1 bg-white text-black font-display font-bold uppercase tracking-widest text-xs py-3 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {phoneLoading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                          recaptchaVerifierRef.current = null;
                        }}
                        className="px-4 border border-white/30 text-white font-display font-bold uppercase tracking-widest text-xs py-3 hover:bg-white/10 transition-colors"
                      >
                        Resend
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container"></div>

          <p className="font-mono text-center text-xs mt-8 text-gray-400">
            Node Already Exists? <Link to="/login" className="text-white hover:underline transition-all">Establish Connection</Link>
          </p>
        </div>
      </div>
  );
};

export default Signup;
