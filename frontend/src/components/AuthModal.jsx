import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Lock, User as UserIcon, ShieldCheck, Store, ShoppingBag, 
  AlertCircle, CheckCircle2, ArrowRight, Sparkles, KeyRound, Truck 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  requiredRole = null, // e.g. 'Platform Admin'
  message = null
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(requiredRole || 'Customer');

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [showGoogleSheet, setShowGoogleSheet] = useState(false);
  const [googleName, setGoogleName] = useState('Pavan Teja');
  const [googleEmail, setGoogleEmail] = useState('pavan.teja@gmail.com');
  const [googleRole, setGoogleRole] = useState(requiredRole || 'Customer');

  useEffect(() => {
    if (requiredRole) {
      setRole(requiredRole);
      setGoogleRole(requiredRole);
    }
  }, [requiredRole]);

  // Reset errors on mode change
  useEffect(() => {
    setErrors({});
    setTouched({});
    setServerError('');
    setServerSuccess('');
    setShowGoogleSheet(false);
  }, [mode]);

  // Google Social Sign-In & Direct Registration Handler
  const handleGoogleAuth = async (customPayload = null) => {
    setServerError('');
    setServerSuccess('');
    setLoading(true);

    try {
      const selectedRole = customPayload?.role || googleRole || requiredRole || role || 'Customer';
      const selectedName = (customPayload?.name || googleName || name || 'Pavan Teja').trim();
      const selectedEmail = (customPayload?.email || googleEmail || email || 'pavanteja.google@gmail.com').trim();

      const payload = {
        name: selectedName,
        email: selectedEmail,
        role: selectedRole,
        googleId: `google_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedName)}`
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google Social Authentication failed.');
      }

      // Check role permissions if a specific role is required
      if (requiredRole && data.role !== requiredRole && data.role !== 'Platform Admin') {
        throw new Error(
          `Access Denied: Logged in as "${data.role}". This portal requires "${requiredRole}" privileges.`
        );
      }

      setServerSuccess(`Signed in with Google! Welcome, ${data.name}.`);
      localStorage.setItem('shopsphere_user', JSON.stringify(data));

      setTimeout(() => {
        if (onSuccess) onSuccess(data);
        onClose();
      }, 700);

    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Client-side field validations
  const validateField = (field, value) => {
    let error = '';
    if (field === 'email') {
      if (!value || !value.trim()) {
        error = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        error = 'Please enter a valid email (e.g. name@example.com).';
      }
    }

    if (field === 'password') {
      if (!value) {
        error = 'Password is required.';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters.';
      }
    }

    if (field === 'name' && mode === 'register') {
      if (!value || !value.trim()) {
        error = 'Full name is required.';
      } else if (value.trim().length < 2) {
        error = 'Name must be at least 2 characters.';
      }
    }

    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === 'email' ? email : field === 'password' ? password : name;
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, val) => {
    if (field === 'email') setEmail(val);
    if (field === 'password') setPassword(val);
    if (field === 'name') setName(val);

    if (touched[field]) {
      const err = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleSubmit = async (e, overrideCreds = null) => {
    if (e) e.preventDefault();
    setServerError('');
    setServerSuccess('');

    const activeMode = overrideCreds ? overrideCreds.mode || 'login' : mode;
    const activeEmail = overrideCreds ? overrideCreds.email : email;
    const activePassword = overrideCreds ? overrideCreds.password : password;
    const activeRole = overrideCreds ? overrideCreds.role : role;

    // Run full validations
    const emailErr = validateField('email', activeEmail);
    const passErr = validateField('password', activePassword);
    const nameErr = activeMode === 'register' ? validateField('name', name) : '';

    const newErrors = { email: emailErr, password: passErr, name: nameErr };
    setErrors(newErrors);
    setTouched({ email: true, password: true, name: true });

    if (emailErr || passErr || nameErr) {
      return;
    }

    setLoading(true);

    try {
      const endpoint = activeMode === 'login' 
        ? `${API_BASE_URL}/api/auth/login` 
        : `${API_BASE_URL}/api/auth/register`;

      const payload = activeMode === 'login'
        ? { email: activeEmail.trim(), password: activePassword }
        : { name: name.trim(), email: activeEmail.trim(), password: activePassword, role: activeRole };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed. Please check credentials.');
      }

      // Check role permissions if a specific role is required
      if (requiredRole && data.role !== requiredRole && data.role !== 'Platform Admin') {
        throw new Error(
          `Access Denied: You are logged in as "${data.role}". This portal requires "${requiredRole}" privileges.`
        );
      }

      setServerSuccess(`Success! Welcome, ${data.name}.`);
      localStorage.setItem('shopsphere_user', JSON.stringify(data));

      setTimeout(() => {
        if (onSuccess) onSuccess(data);
        onClose();
      }, 700);

    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click Demo Fill
  const fillDemoAccount = (demoEmail, demoPassword, demoRole = 'Customer') => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setRole(demoRole);
    setMode('login');
    setErrors({});
    setServerError('');

    handleSubmit(null, { email: demoEmail, password: demoPassword, mode: 'login', role: demoRole });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl glass-panel-3d border border-white/15 p-7 text-white shadow-2xl z-10 overflow-hidden"
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-bold text-teal-300 mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              <span>ShopSphere Secure Access</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {requiredRole
                ? `Administrator credentials required to enter ${requiredRole} portal.`
                : 'Access multi-vendor carts, seller analytics, and live order tracking.'}
            </p>
          </div>

          {/* Required Role Warning Banner */}
          {requiredRole && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Role Validation Active:</span>
                <p className="mt-0.5 text-amber-300/80">
                  You must be verified as a <strong className="text-amber-200 font-bold">{requiredRole}</strong> to access this view.
                </p>
              </div>
            </div>
          )}

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Server Feedback Alerts */}
          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{serverError}</span>
            </div>
          )}

          {serverSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{serverSuccess}</span>
            </div>
          )}

          {/* Official Google Social Auth Button */}
          <div className="mb-4">
            {!showGoogleSheet ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowGoogleSheet(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] border border-slate-200 group"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{mode === 'login' ? 'Continue with Google' : 'Sign up directly with Google'}</span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-white/10 border border-teal-400/30 text-white space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span className="text-xs font-bold">Google Direct Registration</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGoogleSheet(false)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-0.5">Google Profile Name</label>
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="e.g. Pavan Teja"
                      className="w-full px-2.5 py-1.5 bg-black/40 rounded-lg border border-white/15 text-xs text-white focus:outline-none focus:border-brand-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-0.5">Google Email Address</label>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="e.g. pavanteja.google@gmail.com"
                      className="w-full px-2.5 py-1.5 bg-black/40 rounded-lg border border-white/15 text-xs text-white focus:outline-none focus:border-brand-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-0.5">Portal Role Permission</label>
                    <select
                      value={googleRole}
                      onChange={(e) => setGoogleRole(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 rounded-lg border border-white/15 text-xs text-white focus:outline-none focus:border-brand-400"
                    >
                      <option value="Customer" className="bg-dark-900 text-white">Customer (Marketplace Shopper)</option>
                      <option value="Seller" className="bg-dark-900 text-white">Independent Merchant / Seller</option>
                      <option value="Delivery Partner" className="bg-dark-900 text-white">Delivery Partner / Logistics</option>
                      <option value="Platform Admin" className="bg-dark-900 text-white">Platform Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleGoogleAuth()}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-brand-500 hover:from-teal-600 hover:to-brand-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Authorize with Google</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleGoogleAuth({ name: 'Pavan Teja', email: 'pavanteja.google@gmail.com', role: googleRole })}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-300 font-bold text-xs transition-all border border-teal-500/30"
                    title="1-Click Quick Register as Pavan Teja"
                  >
                    ⚡ 1-Click
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 text-[10px] uppercase tracking-wider font-extrabold bg-dark-900 text-gray-400 rounded-full">
              or continue with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Jane Doe"
                    className={`w-full pl-9 pr-3 py-2.5 bg-black/40 rounded-xl border text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.name && touched.name
                        ? 'border-rose-500/80 focus:border-rose-500'
                        : 'border-white/10 focus:border-brand-400'
                    }`}
                  />
                </div>
                {errors.name && touched.name && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="admin@shopsphere.com"
                  className={`w-full pl-9 pr-3 py-2.5 bg-black/40 rounded-xl border text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    errors.email && touched.email
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-white/10 focus:border-brand-400'
                  }`}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-2.5 bg-black/40 rounded-xl border text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    errors.password && touched.password
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-white/10 focus:border-brand-400'
                  }`}
                />
              </div>
              {errors.password && touched.password && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Role selector (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Account Type / Portal Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/40 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-brand-400"
                >
                  <option value="Customer" className="bg-dark-900 text-white">Customer (Shopper)</option>
                  <option value="Seller" className="bg-dark-900 text-white">Independent Merchant / Seller</option>
                  <option value="Delivery Partner" className="bg-dark-900 text-white">Delivery Partner / Logistics</option>
                  <option value="Platform Admin" className="bg-dark-900 text-white">Platform Administrator</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-brand-500 to-teal-400 hover:from-brand-600 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Authenticate & Enter' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Instant Demo Quick Logins */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
              ⚡ 1-Click Role Logins (Instant Access)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('pavan@example.com', 'Customer@123', 'Customer')}
                className="p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Login as Customer (Marketplace & Orders only)"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">Customer</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('seller@shopsphere.com', 'Seller@123', 'Seller')}
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Login as Seller (Seller Hub unlocked)"
              >
                <Store className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Seller</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('delivery@shopsphere.com', 'Delivery@123', 'Delivery Partner')}
                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Login as Delivery Partner (Delivery Portal unlocked)"
              >
                <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Delivery Partner</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('admin@shopsphere.com', 'Admin@123', 'Platform Admin')}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Login as Platform Administrator (All hubs unlocked)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Platform Admin</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
