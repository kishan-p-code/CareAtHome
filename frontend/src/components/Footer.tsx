import React from 'react';
import Link from 'next/link';
import { Activity, Phone, Mail, MapPin, ShieldCheck, Heart, Award, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-teal-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Care<span className="text-teal-400">At</span>Home
                </span>
                <p className="text-[11px] font-medium text-emerald-400">
                  Healthcare That Comes To You.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              India's leading on-demand diagnostic platform providing safe, painless, 
              temperature-controlled home blood sample collection by certified phlebotomists 
              in partnership with NABL accredited reference laboratories.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+91 80 4910 8800 (Mon - Sun, 6:00 AM - 10:00 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@careathome.in / lab@careathome.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>CareAtHome Health Tech Hub, Koramangala 4th Block, Bengaluru, KA 560034</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Popular Tests
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link href="/tests" className="hover:text-teal-300 transition">Complete Blood Count (CBC)</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">HbA1c & Fasting Glucose</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">Complete Lipid Profile</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">Thyroid Profile (T3, T4, TSH)</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">Vitamin D (25-OH) & B12</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">Liver Function Test (LFT)</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">Kidney Function Test (KFT)</Link></li>
            </ul>
          </div>

          {/* Packages */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Health Packages
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link href="/tests" className="hover:text-teal-300 transition">Full Body Health Checkup (65+ Params)</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">Senior Citizen Wellness Profile</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">Advanced Diabetes Care Profile</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">Cardiac Health Assessment</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">Women's Hormonal Balance</Link></li>
              <li><Link href="/tests" className="hover:text-teal-300 transition">Fasting Instructions Guide</Link></li>
            </ul>
          </div>

          {/* Trust & Accreditations */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Clinical Quality
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="p-3 rounded-xl bg-gray-800/80 border border-gray-700/60">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Award className="w-4 h-4" /> NABL Partner Labs
                </div>
                <p className="text-[11px] leading-snug">
                  Samples analyzed at ISO 15189:2012 certified reference laboratories.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-800/80 border border-gray-700/60">
                <div className="flex items-center gap-1.5 text-teal-400 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" /> Certified Phlebotomists
                </div>
                <p className="text-[11px] leading-snug">
                  100% background-verified DMLT/BMLT specialists with sterile single-use kits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory & Partnership Statement */}
        <div className="py-6 border-b border-gray-800 text-[11px] text-gray-400 leading-relaxed">
          <p className="font-semibold text-gray-300 mb-1">Healthcare Architecture & Compliance Disclosure:</p>
          CareAtHome operates as a technology and cold-chain sample logistics partner. Blood specimen processing, 
          biochemical analysis, diagnostic evaluation, and medical verification are performed by licensed pathologist-led 
          diagnostic laboratories holding active NABL accreditations. Phlebotomists follow standard biomedical waste handling 
          and cold-chain protocol (2-8°C). Test reports are digitally authenticated under the Information Technology Act, 2000.
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} CareAtHome Technologies Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Prices in INR (₹) inclusive of GST</span>
            <Link href="/#faqs" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/#faqs" className="hover:text-gray-300">Terms of Booking</Link>
            <Link href="/#faqs" className="hover:text-gray-300">Sample Transport Protocol</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

