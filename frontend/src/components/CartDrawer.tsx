'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Trash2, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { 
    items, 
    removeItem, 
    clearCart, 
    subtotal, 
    collectionFee, 
    discountAmount, 
    totalAmount, 
    couponCode, 
    couponMessage, 
    isApplyingCoupon, 
    applyCoupon, 
    removeCoupon, 
    isCartOpen, 
    setIsCartOpen 
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon) {
      await applyCoupon(inputCoupon);
      setInputCoupon('');
    }
  };

  const handleProceed = () => {
    setIsCartOpen(false);
    router.push('/book');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-teal-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Your Health Cart</h2>
                <p className="text-xs text-gray-500">{items.length} item(s) selected for home draw</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 mb-6">
                  Browse our diagnostic blood tests and full-body health packages to book home sample collection.
                </p>
                <Link
                  href="/tests"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition"
                >
                  Explore Tests & Packages
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-1 text-xs text-gray-500">
                  <span>Selected Blood Tests</span>
                  <button 
                    onClick={clearCart} 
                    className="text-red-500 hover:text-red-700 font-semibold text-[11px]"
                  >
                    Clear All
                  </button>
                </div>

                {items.map((item) => (
                  <div
                    key={`${item.item_type}-${item.id}`}
                    className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-teal-200 transition flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                          {item.item_type}
                        </span>
                        {item.fasting_required && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {item.fasting_hours}h Fasting
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{item.name}</h4>
                      <p className="text-xs font-extrabold text-teal-700 mt-0.5">₹{Math.round(item.price)}</p>
                    </div>

                    <button
                      onClick={() => removeItem(item.id, item.item_type)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Free Collection Progress */}
                <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs">
                  {subtotal >= 999 ? (
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Congratulations! You unlocked FREE Home Blood Collection.</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between font-semibold text-teal-900 mb-1">
                        <span>Add ₹{999 - subtotal} more for FREE home collection</span>
                        <span>₹{subtotal} / ₹999</span>
                      </div>
                      <div className="w-full bg-teal-200/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Coupon Code Input */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-teal-600" /> Apply Discount Coupon
                  </p>
                  {couponCode ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Code &apos;{couponCode}&apos; Applied (-₹{Math.round(discountAmount)})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-600 hover:underline font-bold text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon e.g. CAREFIRST"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs uppercase border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !inputCoupon}
                        className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}
                  {couponMessage && (
                    <p className="text-[11px] mt-1 text-teal-700 font-medium">{couponMessage}</p>
                  )}
                  {!couponCode && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Tip: Use <span className="font-bold text-teal-700 cursor-pointer" onClick={() => applyCoupon('CAREFIRST')}>CAREFIRST</span> for 15% off or <span className="font-bold text-teal-700 cursor-pointer" onClick={() => applyCoupon('HEALTH500')}>HEALTH500</span> for ₹500 off packages.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/60 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Tests Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Home Phlebotomist Visit:</span>
                  {collectionFee === 0 ? (
                    <span className="font-bold text-emerald-700">FREE</span>
                  ) : (
                    <span className="font-semibold text-gray-900">₹{collectionFee}</span>
                  )}
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount:</span>
                    <span>-₹{Math.round(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-extrabold text-gray-900">
                  <span>Total Amount (INR):</span>
                  <span className="text-teal-700 text-lg">₹{Math.round(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition"
              >
                Proceed to Home Booking <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>NABL Accredited Partner Lab &bull; Free Digital PDF Report</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

