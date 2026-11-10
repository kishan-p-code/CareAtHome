'use client';

import React from 'react';
import { ShieldCheck, Check, Clock, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { TestPackage } from '../types';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

interface PackageCardProps {
  pkg: TestPackage;
  featured?: boolean;
}

export default function PackageCard({ pkg, featured = false }: PackageCardProps) {
  const { addItem, removeItem, isInCart } = useCart();
  const router = useRouter();

  const inCart = isInCart(pkg.id, 'package');

  const discountPercent = Math.round(
    ((pkg.market_price - pkg.price) / pkg.market_price) * 100
  );

  const handleToggle = () => {
    if (inCart) {
      removeItem(pkg.id, 'package');
    } else {
      addItem({
        id: pkg.id,
        item_type: 'package',
        name: pkg.name,
        price: pkg.price,
        sample_type: pkg.sample_types,
        fasting_required: pkg.fasting_required,
        fasting_hours: pkg.fasting_hours,
      });
    }
  };

  const handleBookNow = () => {
    if (!inCart) {
      addItem({
        id: pkg.id,
        item_type: 'package',
        name: pkg.name,
        price: pkg.price,
        sample_type: pkg.sample_types,
        fasting_required: pkg.fasting_required,
        fasting_hours: pkg.fasting_hours,
      });
    }
    router.push('/book');
  };

  return (
    <div
      className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
        featured
          ? 'bg-gradient-to-b from-teal-900 to-emerald-950 text-white shadow-elevated border-2 border-emerald-400/40'
          : 'bg-white text-gray-900 border border-teal-100 shadow-soft hover:shadow-elevated'
      }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-emerald-400 to-teal-300 text-teal-950 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
          <Sparkles className="w-3.5 h-3.5" /> Most Recommended Full Body Audit
        </div>
      )}

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${
              featured
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-teal-50 text-teal-800'
            }`}
          >
            {pkg.parameters_count}+ Parameters
          </span>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
              featured
                ? 'bg-teal-800/60 text-teal-200'
                : 'bg-amber-50 text-amber-800'
            }`}
          >
            <Clock className="w-3 h-3" /> {pkg.fasting_hours}h Fasting Required
          </span>
        </div>

        {/* Package Title */}
        <h3
          className={`text-xl font-extrabold tracking-tight mt-1 ${
            featured ? 'text-white' : 'text-gray-900'
          }`}
        >
          {pkg.name}
        </h3>

        {pkg.tagline && (
          <p
            className={`text-xs mt-1.5 font-medium ${
              featured ? 'text-emerald-300' : 'text-teal-700'
            }`}
          >
            {pkg.tagline}
          </p>
        )}

        {/* Description */}
        <p
          className={`text-xs mt-3 leading-relaxed ${
            featured ? 'text-teal-100/80' : 'text-gray-500'
          }`}
        >
          {pkg.description}
        </p>

        {/* Included Tests highlights */}
        <div className="mt-5 pt-4 border-t border-teal-500/20 space-y-2">
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              featured ? 'text-emerald-300' : 'text-gray-700'
            }`}
          >
            Key Diagnostic Profiles Included:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              'Complete Blood Count (CBC)',
              'Liver Function (LFT)',
              'Kidney Profile (KFT)',
              'Lipid Profile (Cholesterol)',
              'Blood Glucose Fasting',
              'Thyroid Screening (TSH)',
            ].map((name, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Check
                  className={`w-3.5 h-3.5 ${
                    featured ? 'text-emerald-400' : 'text-teal-600'
                  }`}
                />
                <span className={featured ? 'text-teal-100' : 'text-gray-600'}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="mt-6 pt-5 border-t border-teal-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span
              className={`text-xs block ${
                featured ? 'text-teal-300' : 'text-gray-500'
              }`}
            >
              Inclusive of home draw & digital report
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black ${
                  featured ? 'text-white' : 'text-gray-900'
                }`}
              >
                ₹{Math.round(pkg.price)}
              </span>
              <span
                className={`text-xs line-through ${
                  featured ? 'text-teal-400/60' : 'text-gray-400'
                }`}
              >
                ₹{Math.round(pkg.market_price)}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  featured
                    ? 'bg-emerald-400 text-teal-950'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Save {discountPercent}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleToggle}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              inCart
                ? 'bg-emerald-600 text-white'
                : featured
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added to Cart
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>

          <button
            onClick={handleBookNow}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              featured
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300 text-teal-950 hover:opacity-95 shadow-lg'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
            }`}
          >
            Book Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

