'use client';

import React, { useState } from 'react';
import { Clock, Check, Plus, AlertCircle, Info, Shield, CheckCircle2, X } from 'lucide-react';
import { TestItem } from '../types';
import { useCart } from '../context/CartContext';

interface TestCardProps {
  test: TestItem;
}

export default function TestCard({ test }: TestCardProps) {
  const { addItem, removeItem, isInCart } = useCart();
  const [showModal, setShowModal] = useState(false);

  const inCart = isInCart(test.id, 'test');

  const handleCartToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCart) {
      removeItem(test.id, 'test');
    } else {
      addItem({
        id: test.id,
        item_type: 'test',
        name: test.name,
        price: test.price,
        sample_type: test.sample_type,
        fasting_required: test.fasting_required,
        fasting_hours: test.fasting_hours,
      });
    }
  };

  const discountPercent = test.market_price
    ? Math.round(((test.market_price - test.price) / test.market_price) * 100)
    : 0;

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="bg-white rounded-3xl p-5 border border-teal-100/80 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
      >
        <div>
          {/* Header row: category and fasting */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg">
              {test.category}
            </span>

            {test.fasting_required ? (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" /> {test.fasting_hours}h Fasting
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> No Fasting
              </span>
            )}
          </div>

          {/* Test Name */}
          <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-700 transition leading-snug line-clamp-2">
            {test.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {test.short_description}
          </p>

          {/* Highlights */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
            <span className="bg-gray-50 px-2 py-0.5 rounded text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-600" /> Reports in {test.turnaround_time_hours} hrs
            </span>
            <span className="bg-gray-50 px-2 py-0.5 rounded text-gray-600">
              {test.sample_type.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 pt-3 border-t border-teal-50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-gray-900">
                ₹{Math.round(test.price)}
              </span>
              {test.market_price && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{Math.round(test.market_price)}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="text-[10px] font-bold text-emerald-700">
                Save {discountPercent}%
              </span>
            )}
          </div>

          <button
            onClick={handleCartToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              inCart
                ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white border border-teal-200 hover:border-teal-600'
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Book Test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-teal-100 text-teal-800 rounded">
                  {test.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">{test.name}</h3>
                <p className="text-xs text-gray-500">Test Code: {test.code}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-gray-700">
              <div>
                <h4 className="font-bold text-gray-900 mb-1 text-sm">About This Test</h4>
                <p className="leading-relaxed text-gray-600">{test.description}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60">
                <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-700" /> Partner Lab Preparation Instructions
                </h4>
                <p className="text-amber-800 leading-relaxed">
                  {test.preparation_instructions}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Sample Type</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{test.sample_type}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Vacutainer Tube</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{test.tube_color}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Turnaround Time</span>
                  <p className="font-semibold text-gray-800 mt-0.5">Online within {test.turnaround_time_hours} hrs</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Parameters Analyzed</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{test.parameters_count} Parameter(s)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500">Price in INR</span>
                <p className="text-2xl font-extrabold text-gray-900">₹{Math.round(test.price)}</p>
              </div>

              <button
                onClick={(e) => {
                  handleCartToggle(e);
                  setShowModal(false);
                }}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  inCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'
                }`}
              >
                {inCart ? 'Remove from Cart' : 'Add to Home Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

