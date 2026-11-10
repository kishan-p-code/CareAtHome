'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await register({
        full_name: fullName,
        email,
        phone,
        password,
        role: 'customer',
      });
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
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
          <h2 className="text-2xl font-extrabold text-gray-900">Create Patient Account</h2>
          <p className="text-xs text-gray-500">Book home blood sample collections across India</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-teal-100">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Email Address *</label>
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
              <label className="font-bold text-gray-700 block mb-1">Mobile Number (+91) *</label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Password *</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="password"
                  required
                  placeholder="Create a secure password"
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
              {isLoading ? 'Creating Account...' : 'Register'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 mt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-teal-700 hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

