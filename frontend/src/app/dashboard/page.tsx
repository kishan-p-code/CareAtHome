'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Download, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  Bell, 
  X,
  Phone,
  ArrowRight,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../lib/api';
import { Booking, ReportItem } from '../../types';
import StatusTimeline from '../../components/StatusTimeline';

export default function CustomerDashboard() {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'bookings' | 'reports' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('07:00 AM - 08:00 AM');
  const [downloadingReportId, setDownloadingReportId] = useState<number | null>(null);

  // Profile fields
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bloodGroup, setBloodGroup] = useState(user?.customer_profile?.blood_group || 'B+');
  const [emergencyContact, setEmergencyContact] = useState(user?.customer_profile?.emergency_contact || '');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.get<Booking[]>('/bookings');
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone || '');
      setBloodGroup(user.customer_profile?.blood_group || 'B+');
      setEmergencyContact(user.customer_profile?.emergency_contact || '');
    }
  }, [user]);

  const handleDownloadReport = async (bookingId: number) => {
    try {
      setDownloadingReportId(bookingId);
      // Fetch report for booking
      const reports = await ApiClient.get<ReportItem[]>(`/reports/booking/${bookingId}`);
      if (reports && reports.length > 0) {
        const report = reports[0];
        await ApiClient.downloadReport(report.id, report.file_name);
      } else {
        alert('Report is currently being processed by the reference laboratory.');
      }
    } catch (err: any) {
      alert(err.message || 'Error downloading diagnostic report.');
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this home collection booking?')) return;
    try {
      await ApiClient.post(`/bookings/${bookingId}/cancel`, {
        reason: 'Cancelled by patient from dashboard',
      });
      alert('Booking cancelled. Any prepaid fee will be refunded within 3 business days.');
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Cannot cancel booking at current status.');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReschedule || !rescheduleDate) return;

    try {
      await ApiClient.post(
        `/bookings/${selectedBookingForReschedule.id}/reschedule?date=${rescheduleDate}&time_slot=${encodeURIComponent(
          rescheduleSlot
        )}`
      );
      alert('Appointment rescheduled successfully!');
      setSelectedBookingForReschedule(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to reschedule.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        blood_group: bloodGroup,
        emergency_contact: emergencyContact,
      });
      setProfileSaveSuccess(true);
      setEditProfileMode(false);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-teal-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-teal-500/20">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">{user?.full_name || 'Valued Patient'}</h1>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Patient Account
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email} &bull; {user?.phone || '+91 99887 76655'}</p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 text-center">
          <div>
            <span className="text-2xl font-black text-teal-800">{bookings.length}</span>
            <p className="text-[11px] font-semibold text-gray-500">Total Bookings</p>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div>
            <span className="text-2xl font-black text-emerald-700">
              {bookings.filter((b) => b.status === 'REPORT_READY' || b.status === 'COMPLETED').length}
            </span>
            <p className="text-[11px] font-semibold text-gray-500">Reports Ready</p>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <Link
            href="/tests"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition"
          >
            + Book New Test
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-b-2 border-teal-600 text-teal-700'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> My Appointments & Status ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-b-2 border-teal-600 text-teal-700'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" /> Verified Diagnostic Reports
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-b-2 border-teal-600 text-teal-700'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <User className="w-4 h-4" /> Health Profile
        </button>
      </div>

      {/* TAB 1: BOOKINGS & STATUS TRACKING */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Loading your appointments...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-3">
              <Calendar className="w-12 h-12 text-teal-600 mx-auto" />
              <h3 className="text-base font-bold text-gray-800">No home collection bookings yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Schedule a diagnostic blood test or preventive health checkup to get tested right from home.
              </p>
              <Link
                href="/tests"
                className="inline-block mt-2 px-6 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Explore Tests & Book Now
              </Link>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-3xl p-6 shadow-card border border-teal-100 space-y-6"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black text-gray-900">
                        {booking.booking_code}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        booking.status === 'REPORT_READY' || booking.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : booking.status === 'COLLECTION_IN_PROGRESS' || booking.status === 'SAMPLE_COLLECTED'
                          ? 'bg-blue-100 text-blue-800'
                          : booking.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Patient: <span className="font-semibold text-gray-800">{booking.patient_name}</span> ({booking.patient_age} Y, {booking.patient_gender}) &bull; Booked on {new Date(booking.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions: Download Report / Reschedule / Cancel */}
                  <div className="flex items-center gap-2">
                    {(booking.status === 'REPORT_READY' || booking.status === 'COMPLETED') && (
                      <button
                        onClick={() => handleDownloadReport(booking.id)}
                        disabled={downloadingReportId === booking.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {downloadingReportId === booking.id ? 'Downloading...' : 'Download PDF Report'}
                      </button>
                    )}

                    {['PENDING', 'CONFIRMED', 'STAFF_ASSIGNED'].includes(booking.status) && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedBookingForReschedule(booking);
                            setRescheduleDate(booking.appointment_date);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Live Diagnostic Status Tracker */}
                <StatusTimeline
                  status={booking.status}
                  sampleBarcode={booking.assignment?.sample_barcode}
                  staffName={booking.assignment?.staff_name}
                />

                {/* Details Breakdown: Items, Phlebotomist, Address */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
                  {/* Column 1: Tests */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                    <h4 className="font-bold text-gray-900 mb-2">Booked Tests & Packages</h4>
                    {booking.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span className="line-clamp-1">{item.item_name}</span>
                        <span className="font-semibold text-gray-900">₹{Math.round(item.price)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-teal-900">
                      <span>Total Paid (INR):</span>
                      <span>₹{Math.round(booking.total_amount)}</span>
                    </div>
                  </div>

                  {/* Column 2: Assigned Staff */}
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-1.5">
                    <h4 className="font-bold text-teal-900 mb-2 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-teal-600" /> Collection Professional
                    </h4>
                    {booking.assignment ? (
                      <div className="space-y-1 text-gray-700">
                        <p className="font-bold text-gray-900">{booking.assignment.staff_name}</p>
                        <p className="flex items-center gap-1 text-teal-800">
                          <Phone className="w-3 h-3" /> {booking.assignment.staff_phone || '+91 98765 43210'}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Certified Phlebotomist &bull; Cold-Chain Kit Checked
                        </p>
                        {booking.assignment.sample_barcode && (
                          <div className="mt-2 p-1.5 rounded bg-white border border-teal-200 font-mono text-[10px] text-teal-900">
                            Barcode: {booking.assignment.sample_barcode}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        Phlebotomist will be dispatched 2 hours prior to your slot.
                      </p>
                    )}
                  </div>

                  {/* Column 3: Address & Schedule */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-600" /> Visit Schedule & Address
                    </h4>
                    <p className="font-bold text-teal-800">
                      {booking.appointment_date} ({booking.appointment_time_slot})
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {booking.address.house_flat}, {booking.address.street}, {booking.address.area},{' '}
                      {booking.address.city} - {booking.address.pincode}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: REPORTS DOWNLOAD */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <span>
              All reports are electronically verified by accredited consultant pathologists under the IT Act, 2000.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings
              .filter((b) => b.status === 'REPORT_READY' || b.status === 'COMPLETED')
              .map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-5 border border-teal-100 shadow-soft flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{b.booking_code}</h4>
                      <p className="text-xs text-gray-500">
                        {b.patient_name} &bull; {b.appointment_date}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                        Apex NABL Diagnostic Lab &bull; Verified
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadReport(b.id)}
                    disabled={downloadingReportId === b.id}
                    className="p-3 rounded-2xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white transition shadow-sm"
                    title="Download Official PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
          </div>

          {bookings.filter((b) => b.status === 'REPORT_READY' || b.status === 'COMPLETED').length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No reports generated yet</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Reports will appear here automatically once lab processing is completed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HEALTH PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-teal-100 max-w-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Personal Health Demographics</h3>
              <p className="text-xs text-gray-500">Stored privately for booking diagnostic appointments.</p>
            </div>
            {!editProfileMode && (
              <button
                onClick={() => setEditProfileMode(true)}
                className="px-4 py-2 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>

          {profileSaveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  disabled={!editProfileMode}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl disabled:bg-gray-50 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  disabled={!editProfileMode}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl disabled:bg-gray-50 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Blood Group</label>
                <select
                  disabled={!editProfileMode}
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl disabled:bg-gray-50 font-semibold"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  disabled={!editProfileMode}
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+91 99887 76600"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl disabled:bg-gray-50 font-semibold"
                />
              </div>
            </div>

            {editProfileMode && (
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditProfileMode(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Reschedule Modal */}
      {selectedBookingForReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Reschedule Home Collection</h3>
              <button
                onClick={() => setSelectedBookingForReschedule(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">New Appointment Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Time Slot</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold"
                >
                  <option value="06:00 AM - 07:00 AM">06:00 AM - 07:00 AM</option>
                  <option value="07:00 AM - 08:00 AM">07:00 AM - 08:00 AM (Recommended)</option>
                  <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForReschedule(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

