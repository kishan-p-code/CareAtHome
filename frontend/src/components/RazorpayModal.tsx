'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Building2, 
  CheckCircle2, 
  Lock, 
  Smartphone, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../lib/api';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  bookingCode: string;
  totalAmount: number;
  patientName: string;
  patientPhone: string;
  onSuccess: (paymentId: string) => void;
}

export default function RazorpayModal({
  isOpen,
  onClose,
  bookingId,
  bookingCode,
  totalAmount,
  patientName,
  patientPhone,
  onSuccess,
}: RazorpayModalProps) {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('gpay');
  const [upiId, setUpiId] = useState(`${patientPhone ? patientPhone.replace(/[^0-9]/g, '') : '9876543210'}@okaxis`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('890');
  const [bank, setBank] = useState('HDFC Bank');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. Create order on backend
      const orderRes = await ApiClient.post('/payments/create-order', {
        booking_id: bookingId,
      });

      const orderId = orderRes.order_id;
      const paymentId = `pay_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const testSig = 'simulated_test_sig_verified';

      // 2. Verify payment on backend
      await ApiClient.post('/payments/verify', {
        booking_id: bookingId,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: testSig,
        payment_method: activeTab.toUpperCase(),
      });

      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#10b981', '#34d399', '#f59e0b'],
        });
      } catch (e) {
        // Safe fallback
      }

      onSuccess(paymentId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Razorpay Brand Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">Razorpay</span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold px-1.5 py-0.5 rounded uppercase">
                Secured Sandbox
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">CareAtHome &bull; {bookingCode}</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-blue-300">Amount Due</span>
            <p className="text-xl font-extrabold text-white">₹{Math.round(totalAmount)}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 p-1.5 gap-1 text-xs font-bold text-gray-600">
          <button
            onClick={() => setActiveTab('upi')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'upi' ? 'bg-white text-blue-900 shadow-sm' : 'hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> UPI Apps
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'card' ? 'bg-white text-blue-900 shadow-sm' : 'hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Cards
          </button>
          <button
            onClick={() => setActiveTab('netbanking')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'netbanking' ? 'bg-white text-blue-900 shadow-sm' : 'hover:text-gray-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Net Banking
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {activeTab === 'upi' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-medium">Select your preferred UPI app or scan QR:</p>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                {[
                  { id: 'gpay', name: 'Google Pay', icon: '🟢' },
                  { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                  { id: 'paytm', name: 'Paytm', icon: '🔵' },
                  { id: 'qr', name: 'Scan QR', icon: '📷' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedUpiApp(item.id as any)}
                    className={`p-3 rounded-2xl border transition flex flex-col items-center gap-1.5 ${
                      selectedUpiApp === item.id
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[11px]">{item.name}</span>
                  </button>
                ))}
              </div>

              {selectedUpiApp === 'qr' ? (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-2">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto border border-gray-200 flex items-center justify-center">
                    <QrCode className="w-28 h-28 text-gray-800" />
                  </div>
                  <p className="text-[11px] text-gray-500">Scan with any UPI App (GPay, PhonePe, Paytm)</p>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-semibold text-gray-800"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">A payment request will be verified instantly.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'card' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Valid Thru (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit encryption. Card details are never stored locally.</span>
              </div>
            </div>
          )}

          {activeTab === 'netbanking' && (
            <div className="space-y-3 text-xs">
              <label className="font-bold text-gray-700 block">Select Popular Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map(
                  (b) => (
                    <button
                      key={b}
                      onClick={() => setBank(b)}
                      className={`p-2.5 rounded-xl border text-left font-semibold text-xs transition ${
                        bank === b ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200'
                      }`}
                    >
                      {b}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col gap-2.5">
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying with Razorpay...
              </span>
            ) : (
              <>
                Pay ₹{Math.round(totalAmount)} Securely <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> PCI-DSS Compliant Gateway
            </span>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-medium">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

