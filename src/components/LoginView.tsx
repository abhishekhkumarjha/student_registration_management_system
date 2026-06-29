/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<void>;
  defaultPassword: string;
}

export default function LoginView({ onLogin, defaultPassword }: LoginViewProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onLogin(username, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid username or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] px-4 py-12 relative overflow-hidden">
      {/* Decorative ambient background elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-teal-50/80 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-50/70 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-amber-400 shadow-lg shadow-teal-900/10 mb-4 border border-teal-600">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Student Registry System
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sign in as Administrator to manage records
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-600 font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Username
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all text-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 pl-11 pr-11 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all text-sm"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Buttons: Login and Reset */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition-all shadow-md shadow-teal-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>

          {/* Quick Info Credentials for local review */}
          <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Demo Access Credentials</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Username:</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-100 font-medium">admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Default Password:</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-100 font-medium">{defaultPassword}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
