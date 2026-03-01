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
  getUserFromFirestore,
} from '../services/firebaseAuth';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // ─── Redirect helper based on role ─────────────────────────────────────────
  const redirectToDashboard = (role: string, uid: string) => {
    if (role === 'admin') {
      navigate('/dashboard/admin');
    } else {
      const isSetup = localStorage.getItem(`setupComplete_${uid}`);
      if (isSetup) {
        navigate(role === 'dj' ? '/dashboard/dj' : '/explore');
      } else {
        navigate('/setup-info');
      }
    }
  };

  // ─── Email/Password Login ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      login(user, token);
      redirectToDashboard(user.role, user.uid);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Sign In ────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      const user = result.user;

      // Check if user exists in Firestore, create if not
      let userData = await getUserFromFirestore(user.uid);
      if (!userData) {
        await saveUserToFirestore(
          user.uid,
          user.displayName || 'User',
          user.email || '',
          'user'
        );
        userData = { uid: user.uid, name: user.displayName || 'User', email: user.email || '', role: 'user' };
      }

      login(
        {
          uid: user.uid,
          name: userData.name || user.displayName || 'User',
          email: userData.email || user.email || '',
          role: userData.role || 'user',
        },
        await user.getIdToken()
      );

      redirectToDashboard(userData.role || 'user', user.uid);
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
        recaptchaVerifierRef.current = setupRecaptcha('recaptcha-container-login');
      }

      const confirmationResult = await sendPhoneOtp(phoneNumber, recaptchaVerifierRef.current);
      confirmationResultRef.current = confirmationResult;
      setOtpSent(true);
    } catch (err: any) {
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

      // Check if user exists in Firestore, create if not
      let userData = await getUserFromFirestore(user.uid);
      if (!userData) {
        await saveUserToFirestore(
          user.uid,
          user.displayName || 'Phone User',
          user.email || '',
          'user'
        );
        userData = { uid: user.uid, name: 'Phone User', email: user.phoneNumber || '', role: 'user' };
      }

      login(
        {
          uid: user.uid,
          name: userData.name || 'Phone User',
          email: userData.email || user.phoneNumber || '',
          role: userData.role || 'user',
        },
        await user.getIdToken()
      );

      redirectToDashboard(userData.role || 'user', user.uid);
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

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-center font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">Alternative Protocols</p>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                disabled={googleLoading}
                className="w-full border border-white/30 text-white font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGoogleSignIn}
              >
                {googleLoading ? (
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="size-4 bg-white rounded-full flex items-center justify-center text-black text-[10px] bg-opacity-80">G</div>
                )}
                {googleLoading ? 'Connecting...' : 'Sign In via Google'}
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
                Sign In via Phone
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
          <div id="recaptcha-container-login"></div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center font-mono text-xs text-gray-500">
            No active profile?{' '}
            <Link to="/signup" className="text-white hover:underline uppercase tracking-wider ml-1">
              Join Roster
            </Link>
          </div>
        </div>
      </div>
  );
};

export default Login;
