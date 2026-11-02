
import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  Droplets,
  Lock,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  User,
  Eye,
  EyeOff,
} from 'lucide-react';

import { auth } from '../../firebase';
import { useApp } from '../../context/AppContext';

export const OwnerLogin: React.FC = () => {
  const { loginAsOwner, setCurrentView, addToast } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = identifier.trim();

    if (!email || !password) {
      addToast('error', 'Missing Details', 'Enter your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Temporary navigation flow.
      // Owner/staff permissions must be verified separately.
      loginAsOwner();
    } catch (error) {
      console.error('Firebase login failed:', error);

      addToast(
        'error',
        'Login Failed',
        'Check your email and password, and ensure Firebase Authentication is configured.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = identifier.trim();

    if (!email) {
      addToast(
        'info',
        'Enter Your Email',
        'Enter your registered email address first.'
      );
      return;
    }

    setIsResettingPassword(true);

    try {
      await sendPasswordResetEmail(auth, email);

      addToast(
        'success',
        'Reset Email Sent',
        'If this email is registered, check your inbox for password reset instructions.'
      );
    } catch (error) {
      console.error('Password reset failed:', error);

      addToast(
        'error',
        'Unable to Send Email',
        'Check the email address and your Firebase Authentication settings.'
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex flex-col justify-between p-3.5 sm:p-6 lg:p-8">
      {/* Top navigation */}
      <div className="max-w-7xl w-full mx-auto flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCurrentView('public-home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 sm:px-3.5 py-2 rounded-xl backdrop-blur-md transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Website</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-blue-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Encrypted Portal</span>
        </div>
      </div>

      {/* Login card */}
      <div className="max-w-md w-full mx-auto my-6 sm:my-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-bl-full -z-0 pointer-events-none" />

          {/* Logo and heading */}
          <div className="relative z-10 text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-600/30 mb-3">
              <Droplets className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ambika Dry Wash
            </h1>

            <p className="text-xs text-slate-500 mt-1 font-medium">
              Management Portal • Patamata, Vijayawada
            </p>
          </div>

          {/* Firebase authentication form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="text-xs font-bold text-slate-700 block mb-1"
              >
                Email Address
              </label>

              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />

                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="text-xs font-bold text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword}
                  className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer disabled:opacity-50"
                >
                  {isResettingPassword ? 'Sending...' : 'Forgot Password?'}
                </button>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />

                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />

                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Management Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Authorized management &amp; staff access only • +91 63016 82969
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-slate-400">
        Ambika Dry Wash • Patamata, Vijayawada, Andhra Pradesh
      </div>
    </div>
  );
};
