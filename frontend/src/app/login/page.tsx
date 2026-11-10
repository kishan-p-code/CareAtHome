'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickDemoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async (role: 'customer' | 'staff' | 'admin') => {
    setIsLoading(true);
    try {
      await quickDemoLogin(role);
      if (role === 'admin') router.push('/admin');
      else if (role === 'staff') router.push('/staff');
      else router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-black">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              Care<span className="text-teal-600">At</span>Home
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="text-xs text-gray-500">Access your home collection visits and digital NABL reports</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Demo Fast Login Buttons */}
        <div className="p-4 rounded-3xl bg-teal-50/70 border border-teal-200/80 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 block text-center">
            ⚡ Quick 1-Click Demo Login
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemo('customer')}
              className="p-2.5 rounded-xl bg-white hover:bg-teal-100/60 border border-teal-200 font-bold text-teal-900 transition flex flex-col items-center gap-1 shadow-sm"
            >
              <User className="w-4 h-4 text-teal-600" /> Patient
            </button>
            <button
              type="button"
              onClick={() => handleDemo('staff')}
              className="p-2.5 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200 font-bold text-emerald-900 transition flex flex-col items-center gap-1 shadow-sm"
            >
              <Stethoscope className="w-4 h-4 text-emerald-600" /> Phlebotomist
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="p-2.5 rounded-xl bg-white hover:bg-purple-100/60 border border-purple-200 font-bold text-purple-900 transition flex flex-col items-center gap-1 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Admin
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-teal-100">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold text-gray-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-gray-700">Password</label>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold text-gray-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 mt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-teal-700 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

