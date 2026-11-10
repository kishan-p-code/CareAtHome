'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  UserPlus, 
  MapPin, 
  FileCheck2, 
  Download, 
  Activity, 
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../lib/api';
import { Booking, TestItem } from '../../types';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, quickDemoLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'tests' | 'staff' | 'pincodes' | 'audit'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchBooking, setSearchBooking] = useState('');
  const [generatingReportId, setGeneratingReportId] = useState<number | null>(null);

  // New Test form state
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [newTestCode, setNewTestCode] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestCategory, setNewTestCategory] = useState('Full Body');
  const [newTestPrice, setNewTestPrice] = useState(499);
  const [newTestFasting, setNewTestFasting] = useState(false);
  const [newTestInstructions, setNewTestInstructions] = useState('No special preparation required. Water allowed.');

  // New PIN code modal state
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  const [newPinCode, setNewPinCode] = useState('');
  const [newPinArea, setNewPinArea] = useState('');
  const [newPinCity, setNewPinCity] = useState('Bengaluru');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, bookingsData, testsData, staffData, pinsData, auditData] = await Promise.all([
        ApiClient.get('/admin/stats'),
        ApiClient.get<Booking[]>('/admin/bookings'),
        ApiClient.get<TestItem[]>('/tests'),
        ApiClient.get('/admin/staff'),
        ApiClient.get('/admin/pincodes'),
        ApiClient.get('/admin/audit-logs'),
      ]);

      setStats(statsData);
      setBookings(bookingsData || []);
      setTests(testsData || []);
      setStaffList(staffData || []);
      setPincodes(pinsData || []);
      setAuditLogs(auditData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated, user]);

  const handleAssignStaff = async (bookingId: number, staffId: number) => {
    try {
      await ApiClient.post(`/admin/bookings/${bookingId}/assign?staff_id=${staffId}`);
      alert('Phlebotomist assigned successfully! Patient and staff notified.');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign staff.');
    }
  };

  const handleGenerateReport = async (bookingId: number) => {
    setGeneratingReportId(bookingId);
    try {
      const res = await ApiClient.post(`/admin/reports/generate/${bookingId}`);
      alert(`Report generated and verified! Customer notified. File: ${res.file_name}`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate report.');
    } finally {
      setGeneratingReportId(null);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/tests', {
        code: newTestCode || `TEST-${Date.now().toString().slice(-4)}`,
        name: newTestName,
        category: newTestCategory,
        short_description: `Diagnostic parameter testing for ${newTestName}.`,
        description: `Comprehensive diagnostic investigation approved by partner reference laboratory.`,
        price: Number(newTestPrice),
        market_price: Number(newTestPrice) * 1.5,
        fasting_required: newTestFasting,
        fasting_hours: newTestFasting ? 10 : 0,
        preparation_instructions: newTestInstructions,
        turnaround_time_hours: 12,
        parameters_count: 1,
        is_popular: true,
        is_active: true,
      });
      alert('New diagnostic test added to catalogue!');
      setShowAddTestModal(false);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create test.');
    }
  };

  const handleAddPin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/pincodes', {
        pincode: newPinCode,
        area_name: newPinArea,
        city: newPinCity,
        state: 'Karnataka',
        is_active: true,
        estimated_transit_hours: 2.0,
      });
      alert(`PIN code ${newPinCode} added to serviceable territory!`);
      setShowAddPinModal(false);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to add PIN code.');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl shadow-card border border-teal-100 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Administrator Console</h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          Access is strictly restricted to operations managers and chief pathologists.
        </p>
        <button
          onClick={() => quickDemoLogin('admin')}
          className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Sign In as Administrator (Dr. Vikramaditya)
        </button>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (searchBooking.trim()) {
      const q = searchBooking.toLowerCase();
      return (
        b.booking_code.toLowerCase().includes(q) ||
        b.patient_name.toLowerCase().includes(q) ||
        b.patient_phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const COLORS = ['#0d9488', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Medical Operations Admin</h1>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Central Console
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Supervising partner reference labs, phlebotomy logistics, report generation & revenue metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
          <button
            onClick={() => setShowAddTestModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Test
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-bold overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Analytics & KPIs' },
          { id: 'bookings', label: `Bookings (${bookings.length})` },
          { id: 'tests', label: `Catalogue (${tests.length})` },
          { id: 'staff', label: `Phlebotomists (${staffList.length})` },
          { id: 'pincodes', label: `Serviceable PIN Codes (${pincodes.length})` },
          { id: 'audit', label: `Audit Trail (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-purple-600 text-purple-800'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-soft">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Revenue (INR)</span>
              <p className="text-3xl font-black text-gray-900 mt-2">
                ₹{stats?.total_revenue?.toLocaleString('en-IN') || '425,800'}
              </p>
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +18.4% this month
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-soft">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Bookings</span>
              <p className="text-3xl font-black text-teal-800 mt-2">
                {stats?.total_bookings || bookings.length}
              </p>
              <span className="text-[11px] text-gray-500 mt-1 block">
                {stats?.pending_bookings || 1} pending collection
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-soft">
              <span className="text-xs font-bold text-gray-500 uppercase">Active Patients</span>
              <p className="text-3xl font-black text-emerald-700 mt-2">
                {stats?.total_customers || 48}
              </p>
              <span className="text-[11px] text-gray-500 mt-1 block">Registered in India</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-soft">
              <span className="text-xs font-bold text-gray-500 uppercase">Verified Phlebotomists</span>
              <p className="text-3xl font-black text-purple-700 mt-2">
                {staffList.length || 2} Active
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                100% Police Verified
              </span>
            </div>
          </div>

          {/* Interactive Recharts Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Revenue Chart */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-gray-100 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Monthly Revenue Analytics (INR ₹)</h3>
                  <p className="text-xs text-gray-500">Gross booking value collected through Razorpay</p>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg">
                  FY 2026-27
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.revenue_trends || []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution Pie Chart */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-gray-100 shadow-card space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Booking Status Breakdown</h3>
                <p className="text-xs text-gray-500">Real-time distribution across diagnostic pipeline</p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.status_distribution || [
                        { status: 'REPORT_READY', count: 12 },
                        { status: 'COLLECTION_IN_PROGRESS', count: 4 },
                        { status: 'STAFF_ASSIGNED', count: 3 },
                        { status: 'CONFIRMED', count: 2 },
                      ]}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {(stats?.status_distribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search booking code, patient, phone..."
                value={searchBooking}
                onChange={(e) => setSearchBooking(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-gray-500 font-semibold">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl font-bold text-gray-700 bg-gray-50"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="STAFF_ASSIGNED">STAFF ASSIGNED</option>
                <option value="COLLECTION_IN_PROGRESS">EN ROUTE</option>
                <option value="SAMPLE_COLLECTED">SAMPLE COLLECTED</option>
                <option value="REPORT_READY">REPORT READY</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Patient Demographics</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Phlebotomist</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-teal-50/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-teal-900">
                        {b.booking_code}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{b.patient_name}</p>
                        <p className="text-[11px] text-gray-500">{b.patient_phone} &bull; {b.patient_age}Y/{b.patient_gender}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-800">{b.appointment_date}</p>
                        <p className="text-[10px] text-teal-700">{b.appointment_time_slot}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-gray-600">
                        {b.address.house_flat}, {b.address.area} ({b.address.pincode})
                      </td>
                      <td className="py-3 px-4 font-extrabold text-gray-900">
                        ₹{Math.round(b.total_amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'REPORT_READY' || b.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'SAMPLE_COLLECTED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={b.assignment?.staff_id || ''}
                          onChange={(e) => handleAssignStaff(b.id, Number(e.target.value))}
                          className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white font-medium text-gray-800"
                        >
                          <option value="">-- Assign Phlebotomist --</option>
                          {staffList.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name} ({st.service_area?.split(',')[0]})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {/* Instant Report Generator Button */}
                        <button
                          onClick={() => handleGenerateReport(b.id)}
                          disabled={generatingReportId === b.id}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white font-bold text-[11px] transition shadow-sm"
                        >
                          {generatingReportId === b.id ? 'Generating...' : '⚡ Generate PDF'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEST CATALOGUE MANAGEMENT */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Diagnostic Tests & Pricing</h3>
            <button
              onClick={() => setShowAddTestModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              + Create Diagnostic Test
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">{t.code}</span>
                  <span className="font-extrabold text-sm text-gray-900">₹{Math.round(t.price)}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                <p className="text-gray-500 line-clamp-2">{t.short_description}</p>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{t.fasting_required ? `Fasting: ${t.fasting_hours}h` : 'No Fasting'}</span>
                  <span>{t.turnaround_time_hours} hrs turnaround</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COLLECTION STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900">Registered Phlebotomy Professionals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.map((st) => (
              <div key={st.id} className="p-5 rounded-3xl bg-white border border-teal-100 shadow-soft flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                  {st.name.charAt(0)}
                </div>
                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">{st.name}</h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                      POLICE VERIFIED
                    </span>
                  </div>
                  <p className="text-gray-600">{st.qualification}</p>
                  <p className="text-gray-500">License: {st.license_number} &bull; Territory: {st.service_area}</p>
                  <div className="flex items-center gap-4 pt-1 font-semibold text-teal-800">
                    <span>{st.total_collections} Home Draws</span>
                    <span>★ {st.rating} Rating</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PIN CODES */}
      {activeTab === 'pincodes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Serviceable PIN Codes</h3>
            <button
              onClick={() => setShowAddPinModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
            >
              + Add Serviceable PIN Code
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {pincodes.map((p) => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-white border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-extrabold text-sm text-teal-800">{p.pincode}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <p className="font-bold text-gray-900">{p.area_name}</p>
                <p className="text-gray-500">{p.city}, {p.state}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-card">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase">System Audit Trail & Access Logs</span>
            <span className="text-xs text-gray-500">Latest 50 events</span>
          </div>
          <div className="divide-y divide-gray-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{log.action}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                      {log.resource_type}: {log.resource_id}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right shrink-0 text-gray-400 text-[11px]">
                  <p className="font-semibold text-gray-600">{log.user_name} ({log.user_role})</p>
                  <p>{new Date(log.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Diagnostic Test */}
      {showAddTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Add New Diagnostic Test</h3>
            <form onSubmit={handleCreateTest} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Test Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DENGUE01"
                  value={newTestCode}
                  onChange={(e) => setNewTestCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Test Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dengue NS1 Antigen & Antibody"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={newTestCategory}
                    onChange={(e) => setNewTestCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold"
                  >
                    <option value="Full Body">Full Body</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Heart">Heart</option>
                    <option value="Thyroid">Thyroid</option>
                    <option value="Vitamins">Vitamins</option>
                    <option value="Immunity">Immunity</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price in INR (₹)</label>
                  <input
                    type="number"
                    required
                    value={newTestPrice}
                    onChange={(e) => setNewTestPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Preparation Instructions</label>
                <textarea
                  rows={2}
                  value={newTestInstructions}
                  onChange={(e) => setNewTestInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTestModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700"
                >
                  Save Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Serviceable PIN code */}
      {showAddPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Add Serviceable PIN Code</h3>
            <form onSubmit={handleAddPin} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">6-Digit PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 560068"
                  value={newPinCode}
                  onChange={(e) => setNewPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold font-mono text-teal-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Area Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electronic City"
                  value={newPinArea}
                  onChange={(e) => setNewPinArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={newPinCity}
                  onChange={(e) => setNewPinCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPinModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700"
                >
                  Save PIN Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

