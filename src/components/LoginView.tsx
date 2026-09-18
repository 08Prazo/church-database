import React, { useState } from 'react';
import { Church, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CHURCH_NAME, APP_NAME, INITIAL_SUPER_ADMIN_EMAIL } from '../lib/constants';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, signInWithGmailAddress } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      // If popup blocked or domain unauthorized, provide graceful guidance
      console.warn('Google Sign-In notice:', err);
      setError(
        err?.message?.includes('unauthorized-domain')
          ? 'Google popup domain restriction detected. Please enter your Gmail address below to log in directly.'
          : err?.message || 'Could not complete Google Sign-In. You can log in using your Gmail address below.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectGmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your Gmail address.');
      return;
    }
    if (!trimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await signInWithGmailAddress(trimmed);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickSignIn = async (email: string) => {
    try {
      setSubmitting(true);
      setError(null);
      await signInWithGmailAddress(email);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="login-screen"
      className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 antialiased"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
            <Church className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {CHURCH_NAME}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {APP_NAME}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="space-y-1 text-center">
            <h2 className="text-base font-semibold text-slate-900">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500">
              Every member and administrator logs in using their own Gmail account
            </p>
          </div>

          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary: Google Popup Button */}
          <button
            type="button"
            id="google-signin-btn"
            disabled={submitting}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition shadow-2xs disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-100" />
            <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-medium">
              or enter Gmail
            </span>
            <div className="w-full border-t border-slate-100" />
          </div>

          {/* Direct Gmail Input */}
          <form onSubmit={handleDirectGmailSignIn} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gmail Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In with Gmail'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Sign-In for Initial Super Admin */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Initial Super Admin Account:</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickSignIn(INITIAL_SUPER_ADMIN_EMAIL)}
              disabled={submitting}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition flex items-center justify-between group"
            >
              <div className="truncate pr-2">
                <span className="text-xs font-semibold text-slate-800 block truncate">
                  {INITIAL_SUPER_ADMIN_EMAIL}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Full Administrative Privileges
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0 group-hover:border-slate-300">
                Sign In
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
