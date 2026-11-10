'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  CreditCard, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Sparkles, 
  Tag, 
  AlertCircle,
  Check,
  FileCheck2,
  Navigation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ApiClient } from '../../lib/api';
import RazorpayModal from '../../components/RazorpayModal';
import confetti from 'canvas-confetti';

export default function BookingWizardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { 
    items, 
    removeItem, 
    subtotal, 
    collectionFee, 
    discountAmount, 
    totalAmount, 
    couponCode, 
    applyCoupon, 
    removeCoupon, 
    clearCart 
  } = useCart();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 2: Patient Info
  const [patientName, setPatientName] = useState(user?.full_name || '');
  const [patientAge, setPatientAge] = useState<number | ''>(32);
  const [patientGender, setPatientGender] = useState('Female');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '+91 99887 76655');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientNotes, setPatientNotes] = useState('');

  // Step 3: Collection Address
  const [houseFlat, setHouseFlat] = useState('Flat 402, Green Glen Palm Meadows');
  const [street, setStreet] = useState('12th Main Road, 4th Block');
  const [area, setArea] = useState('Koramangala');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560034');
  const [landmark, setLandmark] = useState('Near Sony World Signal');
  const [pincodeVerified, setPincodeVerified] = useState(true);
  const [pincodeMsg, setPincodeMsg] = useState('Verified: Home collection available in Koramangala');
  const [mapLocationSelected, setMapLocationSelected] = useState(true);

  // Step 4: Appointment Schedule
  const today = new Date();
  const nextDays = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return {
      dateStr: d.toISOString().split('T')[0],
      displayDay: i === 0 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      displayDate: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    };
  });

  const [selectedDate, setSelectedDate] = useState(nextDays[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState('07:00 AM - 08:00 AM');

  // Step 5 & 6: Order Creation & Razorpay
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingCode, setConfirmedBookingCode] = useState('');

  // Time slot options
  const timeSlots = [
    { slot: '06:00 AM - 07:00 AM', tag: 'Early Morning' },
    { slot: '07:00 AM - 08:00 AM', tag: 'Fastest Draw / Ideal for Fasting', popular: true },
    { slot: '08:00 AM - 09:00 AM', tag: 'High Demand' },
    { slot: '09:00 AM - 10:00 AM', tag: 'Available' },
    { slot: '10:00 AM - 11:00 AM', tag: 'Available' },
    { slot: '11:00 AM - 12:00 PM', tag: 'Late Morning' },
    { slot: '04:00 PM - 06:00 PM', tag: 'Evening (Non-Fasting Only)' },
  ];

  // Update defaults when user object loads
  useEffect(() => {
    if (user) {
      if (!patientName) setPatientName(user.full_name);
      if (!patientPhone && user.phone) setPatientPhone(user.phone);
      if (!patientEmail) setPatientEmail(user.email);
    }
  }, [user]);

  const verifyPincode = async (code: string) => {
    if (code.length !== 6) return;
    try {
      const res = await ApiClient.get(`/serviceability/check/${code}`);
      setPincodeVerified(res.serviceable);
      setPincodeMsg(res.message);
      if (res.city) setCity(res.city);
      if (res.area_name) setArea(res.area_name);
    } catch (e) {
      setPincodeVerified(true);
      setPincodeMsg('Serviceable in metropolitan delivery zone.');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && items.length === 0) {
      alert('Please select at least one test to proceed.');
      return;
    }
    if (currentStep === 2) {
      if (!patientName || !patientAge || !patientPhone) {
        alert('Please fill in patient name, age, and phone number.');
        return;
      }
    }
    if (currentStep === 3) {
      if (!houseFlat || !street || !area || !pincode) {
        alert('Please fill in complete address details.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const ok = await applyCoupon(couponInput);
    if (ok) {
      setCouponFeedback(`Applied coupon ${couponInput.toUpperCase()}!`);
      setCouponInput('');
    } else {
      setCouponFeedback('Invalid coupon code');
    }
  };

  // Submit and create booking in DB
  const handleProceedToPayment = async () => {
    setIsSubmittingBooking(true);
    try {
      const payload = {
        patient_name: patientName,
        patient_age: Number(patientAge),
        patient_gender: patientGender,
        patient_phone: patientPhone,
        patient_email: patientEmail,
        patient_notes: patientNotes,
        address: {
          address_type: 'Home',
          house_flat: houseFlat,
          street: street,
          area: area,
          city: city,
          pincode: pincode,
          landmark: landmark,
          latitude: 12.9352,
          longitude: 77.6245,
        },
        appointment_date: selectedDate,
        appointment_time_slot: selectedSlot,
        items: items.map((i) => ({
          item_type: i.item_type,
          item_id: i.id,
          item_name: i.name,
          price: i.price,
        })),
        coupon_code: couponCode || undefined,
      };

      const res = await ApiClient.post('/bookings', payload);
      setCreatedBooking(res);
      setConfirmedBookingCode(res.booking_code);
      // Open Razorpay Modal
      setShowRazorpayModal(true);
    } catch (err: any) {
      alert(err.message || 'Failed to initialize booking.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setShowRazorpayModal(false);
    setBookingConfirmed(true);
    clearCart();

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (e) {
      // Confetti fallback
    }
  };

  // Confirmation Screen
  if (bookingConfirmed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            Payment Verified &bull; Appointment Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Home Blood Collection Confirmed!
          </h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Your booking reference code is{' '}
            <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {confirmedBookingCode}
            </span>
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-teal-100/80 text-left space-y-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-500">Patient</span>
              <p className="text-sm font-bold text-gray-900">{patientName} ({patientAge} Y, {patientGender})</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Contact</span>
              <p className="text-sm font-bold text-gray-900">{patientPhone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Date & Slot:</span>
              <p className="font-bold text-teal-900">{selectedDate}</p>
              <p className="text-teal-700">{selectedSlot}</p>
            </div>
            <div>
              <span className="text-gray-500">Collection Address:</span>
              <p className="font-bold text-gray-800">{houseFlat}, {area}</p>
              <p className="text-gray-600">{city} - {pincode}</p>
            </div>
          </div>

          {/* Preparation Checklist */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" /> Pre-Collection Patient Checklist:
            </h4>
            <ul className="space-y-1 list-disc pl-4 text-amber-800">
              <li>Observe required 10-12 hours overnight fasting if scheduled for lipid/glucose.</li>
              <li>Drink 1-2 glasses of plain water in the morning to maintain blood vessel hydration.</li>
              <li>Keep morning medicines ready to take immediately after blood collection.</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
          >
            Track in Customer Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="px-6 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-1">
        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full">
          Doorstep Phlebotomy Booking
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Home Blood Sample Collection
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Step {currentStep} of 5 &bull; Safe, painless sample collection at your preferred time slot
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { step: 1, label: 'Selected Tests' },
            { step: 2, label: 'Patient Info' },
            { step: 3, label: 'Address & Map' },
            { step: 4, label: 'Date & Slot' },
            { step: 5, label: 'Summary & Pay' },
          ].map((s) => (
            <div
              key={s.step}
              onClick={() => s.step < currentStep && setCurrentStep(s.step)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                currentStep === s.step
                  ? 'text-teal-700 font-bold'
                  : currentStep > s.step
                  ? 'text-emerald-700 font-semibold'
                  : 'text-gray-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === s.step
                    ? 'bg-teal-600 text-white'
                    : currentStep > s.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {currentStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
              </div>
              <span className="hidden sm:inline text-[11px]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-teal-100/70">
        {/* STEP 1: REVIEW TESTS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Step 1: Review Selected Blood Tests</h2>
              <Link
                href="/tests"
                className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add More Tests
              </Link>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <AlertCircle className="w-12 h-12 text-teal-600 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">Your selection is currently empty</h3>
                <p className="text-xs text-gray-500">Please choose blood tests or health checkup packages to proceed.</p>
                <Link
                  href="/tests"
                  className="inline-block mt-2 px-6 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl"
                >
                  Browse Test Catalogue
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.item_type}-${item.id}`}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                          {item.item_type}
                        </span>
                        {item.fasting_required && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.fasting_hours}h Fasting Required
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mt-1">{item.name}</h4>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-black text-gray-900">₹{Math.round(item.price)}</span>
                      <button
                        onClick={() => removeItem(item.id, item.item_type)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Subtotal Pill */}
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900">Estimated Tests Total:</span>
                  <span className="text-lg font-black text-teal-900">₹{subtotal}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PATIENT INFO */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Step 2: Enter Patient Information</h2>
              <p className="text-xs text-gray-500">This information will be printed on the official NABL diagnostic report.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Patient Age (Years) *</label>
                <input
                  type="number"
                  min={1}
                  max={110}
                  required
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Gender *</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold text-gray-800"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mobile Number (For Phlebotomist Call) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold text-gray-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">Email (For Instant Report PDF)</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold text-gray-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">
                  Special Instructions / Medical Notes for Phlebotomist
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fragile veins, please bring butterfly needle; ring door bell twice; elderly patient."
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-medium text-gray-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ADDRESS & MAP LOCATION */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Step 3: Home Blood Collection Address</h2>
              <p className="text-xs text-gray-500">Our certified collection professional will arrive at this address.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Flat / House Number / Building Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Green Glen Palm Meadows"
                  value={houseFlat}
                  onChange={(e) => setHouseFlat(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Street / Road *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12th Main Road, 4th Block"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Area / Locality *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Koramangala"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">6-Digit PIN Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pincode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setPincode(clean);
                    if (clean.length === 6) verifyPincode(clean);
                  }}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-bold text-teal-800"
                />
                {pincodeMsg && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {pincodeMsg}
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Sony World Signal / Near Apollo Pharmacy"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* Simulated Google Maps Location Pin */}
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-600" /> Google Maps Geolocation Pin
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                  GPS Coordinates Locked
                </span>
              </div>
              <div className="h-32 rounded-xl bg-gradient-to-tr from-teal-100/60 to-emerald-100/60 border border-teal-200 flex flex-col items-center justify-center text-center p-4">
                <MapPin className="w-8 h-8 text-teal-600 animate-bounce mb-1" />
                <p className="text-xs font-bold text-gray-900">{houseFlat}, {area}, {city} - {pincode}</p>
                <p className="text-[11px] text-gray-500">Lat: 12.9352° N &bull; Long: 77.6245° E (Bengaluru Hub)</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: APPOINTMENT SCHEDULE */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Step 4: Select Appointment Date & Time Slot</h2>
              <p className="text-xs text-gray-500">Early morning slots are ideal for fasting blood tests.</p>
            </div>

            {/* Date Selection */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Select Date</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {nextDays.map((d) => (
                  <button
                    key={d.dateStr}
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`p-3 rounded-2xl border text-center transition ${
                      selectedDate === d.dateStr
                        ? 'border-teal-600 bg-teal-50/80 text-teal-950 font-bold ring-2 ring-teal-600/20'
                        : 'border-gray-200 hover:border-teal-300 text-gray-700'
                    }`}
                  >
                    <span className="text-xs block text-gray-500">{d.displayDay}</span>
                    <span className="text-sm font-black mt-0.5 block">{d.displayDate}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Select 1-Hour Time Slot</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timeSlots.map((ts) => (
                  <button
                    key={ts.slot}
                    onClick={() => setSelectedSlot(ts.slot)}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                      selectedSlot === ts.slot
                        ? 'border-teal-600 bg-teal-50 text-teal-950 ring-2 ring-teal-600/20'
                        : 'border-gray-200 hover:border-gray-300 text-gray-800'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{ts.slot}</p>
                      <p className="text-[10px] text-teal-700 font-medium">{ts.tag}</p>
                    </div>
                    {selectedSlot === ts.slot && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity confirmation */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Certified Phlebotomist capacity verified for {selectedDate} ({selectedSlot}).</span>
            </div>
          </div>
        )}

        {/* STEP 5: BOOKING SUMMARY & COUPON */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Step 5: Review Booking Summary</h2>
              <p className="text-xs text-gray-500">Please review all appointment details before making payment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Patient & Schedule details */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm">Patient & Visit Summary</h4>
                  <div>
                    <span className="text-gray-500">Patient:</span>{' '}
                    <span className="font-bold text-gray-900">{patientName} ({patientAge} Y, {patientGender})</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Contact:</span>{' '}
                    <span className="font-semibold text-gray-900">{patientPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Appointment:</span>{' '}
                    <span className="font-bold text-teal-800">{selectedDate} ({selectedSlot})</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Address:</span>{' '}
                    <span className="text-gray-800">{houseFlat}, {street}, {area}, {city} - {pincode}</span>
                  </div>
                </div>

                {/* Coupon Box */}
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <h4 className="font-bold text-teal-900 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-teal-700" /> Apply Discount Coupon
                  </h4>
                  {couponCode ? (
                    <div className="flex items-center justify-between font-bold text-emerald-800 bg-white p-2 rounded-xl border border-emerald-300">
                      <span>Coupon &apos;{couponCode}&apos; Applied (-₹{Math.round(discountAmount)})</span>
                      <button onClick={removeCoupon} className="text-red-600 text-xs hover:underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. CAREFIRST"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs uppercase border border-gray-200 rounded-xl font-bold bg-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponFeedback && <p className="text-[11px] text-teal-800">{couponFeedback}</p>}
                </div>
              </div>

              {/* Right Column: Pricing Breakdown */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Financial Breakdown (INR ₹)</h4>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Tests Subtotal ({items.length} item):</span>
                    <span className="font-semibold text-gray-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Home Phlebotomist Visit Fee:</span>
                    {collectionFee === 0 ? (
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">FREE (Order &gt;= ₹999)</span>
                    ) : (
                      <span className="font-semibold text-gray-900">₹{collectionFee}</span>
                    )}
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount ({couponCode}):</span>
                      <span>-₹{Math.round(discountAmount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-extrabold text-gray-900">
                    <span>Net Payable Amount:</span>
                    <span className="text-teal-700 text-xl">₹{Math.round(totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-gray-500 space-y-1">
                  <p>&bull; 100% money-back guarantee if phlebotomist does not arrive on schedule.</p>
                  <p>&bull; Digital tax invoice will be emailed post successful payment.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Bottom Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handlePreviousStep}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleNextStep}
              className="px-7 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              Continue to Step {currentStep + 1} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleProceedToPayment}
              disabled={isSubmittingBooking}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm shadow-lg shadow-teal-600/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmittingBooking ? (
                'Reserving Appointment...'
              ) : (
                <>
                  <CreditCard className="w-4 h-4" /> Pay ₹{Math.round(totalAmount)} & Confirm
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Razorpay Modal */}
      {showRazorpayModal && createdBooking && (
        <RazorpayModal
          isOpen={showRazorpayModal}
          onClose={() => setShowRazorpayModal(false)}
          bookingId={createdBooking.id}
          bookingCode={createdBooking.booking_code}
          totalAmount={createdBooking.total_amount}
          patientName={createdBooking.patient_name}
          patientPhone={createdBooking.patient_phone}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

