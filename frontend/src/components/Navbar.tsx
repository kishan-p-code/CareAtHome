'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Activity, 
  ShoppingBag, 
  Bell, 
  User as UserIcon, 
  MapPin, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  Stethoscope,
  ChevronDown,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, quickDemoLogin, notifications, unreadNotifsCount, markNotificationRead } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const cartCount = items.length;

  const handleDemoSwitch = async (role: 'customer' | 'staff' | 'admin') => {
    await quickDemoLogin(role);
    setDemoModalOpen(false);
    setUserDropdownOpen(false);
    if (role === 'admin') router.push('/admin');
    else if (role === 'staff') router.push('/staff');
    else router.push('/dashboard');
  };

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-teal-900 text-teal-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-teal-700/80 text-emerald-300 px-2 py-0.5 rounded-full font-medium text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> NABL Partner Labs
            </span>
            <span className="hidden sm:inline text-teal-200">
              100% Temperature-Controlled Cold Chain &bull; Free Home Collection on orders above ₹999
            </span>
          </div>

          <div className="flex items-center gap-4 text-teal-200">
            <span className="hidden md:flex items-center gap-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Serviceable in Bengaluru, Mumbai, Delhi NCR, Pune & Hyderabad
            </span>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="text-amber-300 hover:text-amber-200 font-semibold text-[11px] flex items-center gap-1 bg-teal-800/80 px-2 py-0.5 rounded transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Quick Role Switcher
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-teal-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
                  <Activity className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black tracking-tight text-gray-900">
                      Care<span className="text-teal-600">At</span>Home
                    </span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      India
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-emerald-700 tracking-wide">
                    Healthcare That Comes To You.
                  </p>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden lg:flex items-center gap-1">
                <Link
                  href="/"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    pathname === '/' 
                      ? 'text-teal-700 bg-teal-50' 
                      : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/tests"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    pathname === '/tests' 
                      ? 'text-teal-700 bg-teal-50' 
                      : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                  }`}
                >
                  Blood Tests & Packages
                </Link>
                <Link
                  href="/#how-it-works"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-teal-600 hover:bg-gray-50 transition"
                >
                  How It Works
                </Link>
                <Link
                  href="/#why-us"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-teal-600 hover:bg-gray-50 transition"
                >
                  Why CareAtHome
                </Link>
                <Link
                  href="/#faqs"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-teal-600 hover:bg-gray-50 transition"
                >
                  FAQs
                </Link>
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition"
                title="View Selected Tests"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2.5 rounded-xl text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute 1 top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full" />
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Notifications ({unreadNotifsCount} new)
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                markNotificationRead(notif.id);
                                if (notif.action_link) router.push(notif.action_link);
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-3 text-xs cursor-pointer transition hover:bg-teal-50/60 ${
                                !notif.is_read ? 'bg-teal-50/30' : ''
                              }`}
                            >
                              <div className="font-semibold text-gray-900 flex items-center justify-between">
                                <span>{notif.title}</span>
                                {!notif.is_read && <span className="w-2 h-2 rounded-full bg-teal-600"></span>}
                              </div>
                              <p className="text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile or Login CTA */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-teal-200 hover:border-teal-400 bg-teal-50/50 hover:bg-teal-50 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">{user.full_name}</p>
                      <p className="text-[10px] uppercase font-semibold text-teal-700 tracking-wider">
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                          {user.role} portal active
                        </span>
                      </div>

                      <div className="py-1 text-sm font-medium text-gray-700">
                        {/* Role-based dashboard links */}
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <UserIcon className="w-4 h-4 text-teal-600" /> Customer Dashboard
                        </Link>

                        {(user.role === 'staff' || user.role === 'admin') && (
                          <Link
                            href="/staff"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <Stethoscope className="w-4 h-4 text-emerald-600" /> Phlebotomist Portal
                          </Link>
                        )}

                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" /> Administrator Console
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setDemoModalOpen(true);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-amber-50 text-amber-700"
                        >
                          <Sparkles className="w-4 h-4 text-amber-600" /> Switch Demo Account
                        </button>
                      </div>

                      <div className="pt-1 border-t border-gray-100">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            router.push('/');
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-teal-700 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/tests"
                    className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl shadow-sm transition"
                  >
                    Book a Test
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-teal-600"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-800 hover:bg-teal-50"
            >
              Home
            </Link>
            <Link
              href="/tests"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-800 hover:bg-teal-50"
            >
              Blood Tests & Packages
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-800 hover:bg-teal-50"
            >
              How It Works
            </Link>
            <Link
              href="/#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-800 hover:bg-teal-50"
            >
              Why CareAtHome
            </Link>
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDemoModalOpen(true);
                }}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-amber-50 text-amber-800 border border-amber-200"
              >
                Quick Demo Role Switcher
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Quick Demo Switcher Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Demo Role Switcher</h3>
                  <p className="text-xs text-gray-500">Test all three system personas in 1 click</p>
                </div>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div
                onClick={() => handleDemoSwitch('customer')}
                className="p-4 rounded-2xl border border-teal-100 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-300 cursor-pointer transition flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">Customer Persona</h4>
                    <span className="text-[10px] bg-teal-200 text-teal-800 font-bold px-1.5 py-0.2 rounded">Patient</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Ananya Sharma (Koramangala, Bengaluru). View appointments, live status tracker, download lab PDF reports.
                  </p>
                </div>
              </div>

              <div
                onClick={() => handleDemoSwitch('staff')}
                className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">Collection Professional (Phlebotomist)</h4>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Staff</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Rahul Verma (Certified DMLT). View assigned home visits, Google Maps route, scan barcodes & record cold-chain draw.
                  </p>
                </div>
              </div>

              <div
                onClick={() => handleDemoSwitch('admin')}
                className="p-4 rounded-2xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">Medical Operations Administrator</h4>
                    <span className="text-[10px] bg-purple-200 text-purple-800 font-bold px-1.5 py-0.2 rounded">Admin</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Dr. Vikramaditya. Analytics charts, assign phlebotomists, upload/auto-generate NABL PDF reports, manage PIN codes.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 text-center">
              CareAtHome &bull; Target Market: India (INR ₹) &bull; Built with FastAPI & Next.js
            </p>
          </div>
        </div>
      )}
    </>
  );
}

