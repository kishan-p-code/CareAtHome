'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Calendar, 
  Truck, 
  Microscope, 
  FileText, 
  ChevronRight, 
  Star, 
  Plus, 
  Check, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { ApiClient } from '../lib/api';
import { TestItem, TestPackage } from '../types';
import TestCard from '../components/TestCard';
import PackageCard from '../components/PackageCard';

export default function HomePage() {
  const router = useRouter();

  const [tests, setTests] = useState<TestItem[]>([]);
  const [packages, setPackages] = useState<TestPackage[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<any>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // Fetch tests and packages
    ApiClient.get<TestItem[]>('/tests')
      .then((data) => setTests(data || []))
      .catch((err) => console.error(err));

    ApiClient.get<TestPackage[]>('/packages')
      .then((data) => setPackages(data || []))
      .catch((err) => console.error(err));
  }, []);

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput || pincodeInput.trim().length !== 6) return;
    setCheckingPincode(true);
    setPincodeResult(null);

    try {
      const res = await ApiClient.get(`/serviceability/check/${pincodeInput.trim()}`);
      setPincodeResult(res);
    } catch (err: any) {
      setPincodeResult({
        serviceable: false,
        message: 'Currently not serviceable. Our team is expanding to this location soon!',
      });
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tests?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/tests');
    }
  };

  const categories = ['All', 'Full Body', 'Diabetes', 'Heart', 'Thyroid', 'Vitamins', 'Liver & Kidney'];

  const filteredTests = tests.filter((t) => {
    if (activeCategory === 'All') return true;
    return t.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const faqs = [
    {
      q: 'How does home blood collection work?',
      a: 'After you book online, a certified and qualified phlebotomist visits your home at your selected time slot. They use single-use, sterile vacuum collection tubes and painless butterfly needles. Samples are instantly labeled with your unique barcode and stored in cold-chain boxes (2-8°C) for direct transport to our partner NABL reference laboratory.'
    },
    {
      q: 'Do I need to fast before my blood test?',
      a: 'Tests like Fasting Blood Glucose, Lipid Profile, and Iron Studies require 10-12 hours of overnight fasting. Only plain water is permitted. For non-fasting tests like CBC, Thyroid Profile, and HbA1c, no fasting is necessary. Detailed preparation instructions are shown on every test card and in your appointment confirmation.'
    },
    {
      q: 'How and when will I receive my diagnostic reports?',
      a: 'Reports are verified by senior MD Pathologists and uploaded directly to your secure CareAtHome dashboard within 8 to 24 hours depending on the test. You will receive an immediate SMS/Email alert with a one-click download link for your official PDF report.'
    },
    {
      q: 'Are your phlebotomists certified and safe?',
      a: 'Yes. 100% of our collection professionals hold DMLT or BMLT medical laboratory technology certifications with background verification. They follow hospital-grade sterilization protocols including fresh gloves, alcohol swabs, and sealed single-use vacutainers opened right in front of you.'
    },
    {
      q: 'Can I cancel or reschedule my appointment?',
      a: 'You can reschedule or cancel free of charge up until the phlebotomist departs for your address. Cancellations can be performed easily through your customer dashboard with instant full refund initiation.'
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-teal-50/60 via-white to-white">
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -z-10 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>NABL Partner Lab Quality &bull; At Your Doorstep</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12]">
                Healthcare That <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                  Comes To You.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
                Book blood tests from the comfort of your home. Certified phlebotomists arrive on time, 
                collect samples with painless butterfly needles, and transport them in 
                temperature-controlled cold chains to accredited reference labs.
              </p>

              {/* Live Test Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-xl flex gap-2 p-1.5 bg-white rounded-2xl shadow-elevated border border-teal-100">
                <div className="relative flex-1 flex items-center pl-3">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search CBC, Lipid, HbA1c, Thyroid, Vitamin D..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition shrink-0"
                >
                  Search Tests
                </button>
              </form>

              {/* Serviceable PIN Code Checker */}
              <div className="max-w-xl p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-teal-900">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Check Home Collection Availability in Your Area
                </div>
                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code (e.g. 560034)"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="flex-1 px-3 py-2 bg-white text-xs border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={checkingPincode}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    {checkingPincode ? 'Checking...' : 'Check'}
                  </button>
                </form>

                {pincodeResult && (
                  <div className={`mt-2 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    pincodeResult.serviceable ? 'bg-emerald-100/80 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{pincodeResult.message}</span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/tests"
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-teal-600/25 flex items-center gap-2 transition"
                >
                  Book a Blood Test <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/tests#packages"
                  className="px-7 py-3.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-200 shadow-sm transition"
                >
                  View Health Packages
                </Link>
              </div>
            </div>

            {/* Right Hero Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-white rounded-3xl p-6 shadow-elevated border border-teal-100 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Apex Reference Laboratory</h3>
                      <p className="text-xs text-gray-500">NABL Accredited &bull; ISO 15189:2012</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    VERIFIED
                  </span>
                </div>

                {/* Sample Live Phlebotomist Card */}
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm">
                    RV
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-900">Rahul Verma</h4>
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" /> 4.98
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">Certified Phlebotomist (BMLT, 6+ Yrs Exp)</p>
                    <p className="text-[10px] text-teal-800 font-semibold mt-0.5 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Cold Chain Transit &bull; 4°C Maintained
                    </p>
                  </div>
                </div>

                {/* Sample Features List */}
                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span><b>Zero Pain Protocol:</b> Sterile 23G/25G micro butterfly needles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span><b>Barcoded Integrity:</b> Sealed vials labeled directly in front of you</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span><b>Fast Turnaround:</b> NABL digital reports in 8-18 hours</span>
                  </div>
                </div>

                {/* Direct Booking Pill */}
                <div className="pt-2">
                  <Link
                    href="/book"
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition"
                  >
                    Book Home Collection Now (From ₹120) <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Floating Testimonial Pill */}
              <div className="absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl shadow-elevated border border-gray-100 flex items-center gap-3 hidden sm:flex">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                  AS
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">&ldquo;Zero waiting, reports by 4 PM!&rdquo;</p>
                  <p className="text-[10px] text-gray-400">Ananya Sharma &bull; Bengaluru</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STATS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-teal-100/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-black text-teal-800">150,000+</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Samples Collected at Home</p>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-700">100%</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Cold-Chain Monitored (2-8°C)</p>
          </div>
          <div>
            <p className="text-3xl font-black text-teal-800">4.95 / 5</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Patient Satisfaction Rating</p>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-700">8 - 18 Hrs</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Average Digital Report Time</p>
          </div>
        </div>
      </section>

      {/* 3. HEALTH CHECKUP PACKAGES */}
      <section id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full">
            Preventive Healthcare
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Comprehensive Health Checkup Packages
          </h2>
          <p className="text-sm text-gray-500">
            Preventive wellness profiles tailored for families, working professionals, and elderly parents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <PackageCard key={pkg.id} pkg={pkg} featured={idx === 0} />
          ))}
        </div>
      </section>

      {/* 4. POPULAR BLOOD TESTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full">
              Diagnostic Catalogue
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
              Popular Blood Tests
            </h2>
            <p className="text-sm text-gray-500">
              Approved by certified reference pathologists with verified reference intervals.
            </p>
          </div>

          <Link
            href="/tests"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group"
          >
            Explore all 50+ blood tests <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.slice(0, 6).map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-sm border border-teal-200 transition"
          >
            Browse Full Diagnostic Catalogue (50+ Tests) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="bg-gradient-to-b from-gray-50 to-teal-50/40 py-20 border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-100/70 px-3 py-1 rounded-full">
              Seamless 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              How Home Blood Collection Works
            </h2>
            <p className="text-sm text-gray-500">
              Safe, painless, and completely transparent from booking to digital report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Book Online',
                desc: 'Select your prescribed tests or health packages, choose a convenient morning slot, and enter your address.',
                icon: Calendar,
              },
              {
                step: '02',
                title: 'Phlebotomist Visits',
                desc: 'A verified medical technician arrives on time with fresh single-use vacutainers and painless butterfly needles.',
                icon: Truck,
              },
              {
                step: '03',
                title: 'Cold-Chain Transport',
                desc: 'Samples are barcoded, sealed, and carried in temperature-controlled boxes (2-8°C) directly to our NABL lab.',
                icon: Microscope,
              },
              {
                step: '04',
                title: 'Digital PDF Report',
                desc: 'Access and download verified laboratory reports digitally signed by senior MD Pathologists in 8-18 hours.',
                icon: FileText,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-3xl p-6 border border-teal-100/80 shadow-soft relative flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-black text-teal-200 block mb-2">{item.step}</span>
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section id="why-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full">
            Clinical Rigor
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Why Patients Trust CareAtHome
          </h2>
          <p className="text-sm text-gray-500">
            Engineered with strict quality controls matching international clinical guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Qualified Phlebotomists',
              desc: 'Every collection professional holds a certified DMLT / BMLT degree with mandatory police background verification.',
              icon: ShieldCheck,
            },
            {
              title: 'Uncompromised Cold Chain',
              desc: 'Serum and plasma samples are transported in insulated ice containers calibrated between 2°C to 8°C to prevent hemolyzation.',
              icon: Truck,
            },
            {
              title: 'NABL Accredited Partners',
              desc: 'Diagnostic testing performed exclusively by ISO 15189:2012 and NABL certified partner reference laboratories.',
              icon: Microscope,
            },
            {
              title: 'Zero Pain Butterfly Needles',
              desc: 'Specialized 23G/25G ultra-fine needles ensure a safe, gentle draw especially suited for elderly parents and children.',
              icon: Heart,
            },
            {
              title: 'Transparent Pricing in INR',
              desc: 'No hidden surge pricing. Free home sample collection on all orders above ₹999 with up to 60% savings.',
              icon: Sparkles,
            },
            {
              title: 'Secure Cloud Records',
              desc: 'End-to-end encrypted storage for blood reports. Access and download your full diagnostic medical history anytime.',
              icon: FileText,
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="p-6 rounded-3xl bg-white border border-gray-100 shadow-soft space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">{feat.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="bg-teal-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider bg-teal-800/80 px-3 py-1 rounded-full">
              Patient Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Trusted by 150,000+ Families Across India
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ananya Sharma',
                loc: 'Koramangala, Bengaluru',
                text: 'The phlebotomist Rahul reached sharp at 7:15 AM. The blood draw was completely painless, and I had my full body lipid & thyroid reports verified by 4 PM on the same day. Saved 2 hours of clinic traffic!',
                rating: 5,
              },
              {
                name: 'Dr. Arvind Pillai',
                loc: 'Powai, Mumbai',
                text: 'As a medical professional, I was especially watchful of the cold-chain handling. CareAtHome phlebotomist carried calibrated ice boxes and barcoded vacutainers right at our doorstep. Outstanding clinical discipline.',
                rating: 5,
              },
              {
                name: 'Sunita Saxena',
                loc: 'Greater Kailash, New Delhi',
                text: 'Booked the Senior Citizen Wellness package for my 72-year-old mother. The technician was so patient and used gentle butterfly needles. Her report was ready the next morning. Highly recommend!',
                rating: 5,
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-3xl bg-teal-800/50 border border-teal-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(item.rating)].map((_, r) => (
                      <Star key={r} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-teal-100 leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-teal-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-teal-950 font-bold flex items-center justify-center text-xs">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[10px] text-teal-300">{item.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section id="faqs" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-2xl bg-white overflow-hidden transition"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm text-gray-900 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    activeFaq === idx ? 'rotate-90 text-teal-600' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. PRE-FOOTER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black">
              Ready to Book Your Home Blood Collection?
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Appointments available for tomorrow morning starting from 6:00 AM. Free collection above ₹999.
            </p>
          </div>

          <Link
            href="/tests"
            className="px-8 py-4 rounded-2xl bg-white hover:bg-teal-50 text-teal-900 font-extrabold text-sm shadow-md transition whitespace-nowrap shrink-0"
          >
            Book a Blood Test Now &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}

