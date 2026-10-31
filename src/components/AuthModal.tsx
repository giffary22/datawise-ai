import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, Phone, User, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, googleLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setError('Please enter your email/phone and password.');
        return;
      }
      try {
        setLoading(true);
        await login(email.trim(), password);
        onClose();
      } catch (err: any) {
        setError(err?.message || 'Login failed. Please check credentials.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'register') {
      if (!fullName.trim() || !email.trim() || !password) {
        setError('Please complete all required fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (!acceptedTerms) {
        setError('Please accept the Terms and Conditions.');
        return;
      }

      try {
        setLoading(true);
        await register({
          full_name: fullName.trim(),
          email: email.trim(),
          phone_number: phone.trim(),
          password,
        });
        onClose();
      } catch (err: any) {
        setError(err?.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your registered email address.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setForgotSuccess(true);
      }, 700);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      await googleLogin();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center pb-2">
          <div className="mx-auto inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>DataWise AI</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {mode === 'login' && 'Sign in to DataWise'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' && 'Track your Nigerian mobile subscriptions & budgets'}
            {mode === 'register' && 'Take control of your data expenses across all networks'}
            {mode === 'forgot' && 'We will send a reset link to your verified email'}
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        {forgotSuccess ? (
          <div className="my-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Reset instructions dispatched</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              If an account is associated with {email}, you will receive a secure password restoration link shortly.
            </p>
            <button
              onClick={() => {
                setForgotSuccess(false);
                setMode('login');
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-2 block mx-auto"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
            {/* Google Authentication Option */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
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

            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative bg-white px-2 text-[11px] font-medium text-slate-400 dark:bg-slate-900 uppercase tracking-wider">
                Or with credentials
              </span>
            </div>

            {/* Registration specific fields */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adedayo Ayomide"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email or Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {mode === 'login' ? 'Email Address or Phone Number' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={mode === 'login' ? 'text' : 'email'}
                  required
                  placeholder={mode === 'login' ? 'name@gmail.com or 08031234567' : 'name@gmail.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Phone for register */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+234 803 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password for register */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Remember Me / Terms */}
            {mode === 'login' && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 dark:text-slate-400">
                  Remember me on this browser
                </label>
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="ml-2 block text-xs text-slate-600 dark:text-slate-400">
                  I accept the DataWise AI Terms of Service and Privacy Policy.
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all mt-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'login' ? (
                <span>Login</span>
              ) : mode === 'register' ? (
                <span>Create Account</span>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        {/* Switch Mode Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          {mode === 'login' && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('register');
                }}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create one now
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('login');
                }}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setError('');
                setMode('login');
              }}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
