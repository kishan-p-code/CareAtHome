'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Truck, 
  TestTube2, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  ExternalLink,
  ThermometerSnowflake,
  Star,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../lib/api';
import { Booking } from '../../types';

export default function StaffDashboardPage() {
  const { user, isAuthenticated, quickDemoLogin } = useAuth();

  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBookingForCollect, setSelectedBookingForCollect] = useState<Booking | null>(null);
  const [selectedBookingForIssue, setSelectedBookingForIssue] = useState<Booking | null>(null);

  // Collection modal state
  const [sampleBarcode, setSampleBarcode] = useState('');
  const [vialsCount, setVialsCount] = useState(2);
  const [tubeTypes, setTubeTypes] = useState('1x EDTA (Purple) + 1x SST Gel (Yellow)');
  const [tempChecked, setTempChecked] = useState(true);
  const [phleboNotes, setPhleboNotes] = useState('Painless venipuncture left arm. Cold box temperature 4°C.');
  const [isUpdating, setIsUpdating] = useState(false);

  // Issue modal state
  const [issueReason, setIssueReason] = useState('Patient door locked / phone unreachable');

  const fetchStaffAppointments = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.get<Booking[]>('/staff/appointments');
      setAppointments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStaffAppointments();
    }
  }, [isAuthenticated, user]);

  const handleUpdateStatus = async (bookingId: number, statusStr: string, extraPayload: any = {}) => {
    setIsUpdating(true);
    try {
      await ApiClient.post(`/staff/appointments/${bookingId}/status`, {
        status: statusStr,
        ...extraPayload,
      });
      alert(`Status updated to ${statusStr.replace(/_/g, ' ')}!`);
      setSelectedBookingForCollect(null);
      setSelectedBookingForIssue(null);
      fetchStaffAppointments();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenCollectionModal = (b: Booking) => {
    const generated = `SMPL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setSampleBarcode(generated);
    setSelectedBookingForCollect(b);
  };

  if (!isAuthenticated || (user?.role !== 'staff' && user?.role !== 'admin')) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl shadow-card border border-teal-100 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Phlebotomist Access Required</h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          This portal is reserved for registered collection professionals. Click below to sign in with the verified staff demo credentials.
        </p>
        <button
          onClick={() => quickDemoLogin('staff')}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Sign In as Phlebotomist (Rahul Verma)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Staff Profile Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black text-2xl">
            <Stethoscope className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user?.full_name}</h1>
              <span className="text-[10px] bg-emerald-400 text-teal-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                CERTIFIED PHLEBOTOMIST
              </span>
            </div>
            <p className="text-xs text-teal-200 mt-0.5">
              License: KMC-PHL-2022-814 &bull; BMLT Certified &bull; Bengaluru South Hub
            </p>
          </div>
        </div>

        {/* Phlebotomist Metrics */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-6 text-center">
          <div>
            <span className="text-2xl font-black text-white">248</span>
            <p className="text-[11px] text-teal-200">Collections Done</p>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div>
            <span className="text-2xl font-black text-amber-300 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-300" /> 4.98
            </span>
            <p className="text-[11px] text-teal-200">Patient Rating</p>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div>
            <span className="text-2xl font-black text-emerald-300">
              {appointments.filter((a) => a.status === 'STAFF_ASSIGNED' || a.status === 'COLLECTION_IN_PROGRESS').length}
            </span>
            <p className="text-[11px] text-teal-200">Visits Remaining</p>
          </div>
        </div>
      </div>

      {/* Assigned Visits List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assigned Home Blood Collections</h2>
            <p className="text-xs text-gray-500">
              {appointments.length} assigned patient home visit(s) in your service territory.
            </p>
          </div>

          <button
            onClick={fetchStaffAppointments}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Refresh Visits
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading assigned appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-gray-900">All home visits completed!</h3>
            <p className="text-xs text-gray-500">No pending collections for this shift.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {appointments.map((booking) => {
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${booking.address.house_flat}, ${booking.address.street}, ${booking.address.area}, ${booking.address.city} ${booking.address.pincode}`
              )}`;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl p-6 shadow-card border border-teal-100 space-y-5"
                >
                  {/* Top Row: Patient Info, Time Slot, Google Maps */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-gray-900">
                          {booking.booking_code}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          booking.status === 'SAMPLE_COLLECTED'
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'COLLECTION_IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {booking.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mt-1">
                        Patient: {booking.patient_name} ({booking.patient_age} Y, {booking.patient_gender})
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={`tel:${booking.patient_phone}`}
                        className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-teal-600" /> Call Patient
                      </a>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600" /> Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Visit Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Schedule & Notes */}
                    <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
                      <p className="font-bold text-gray-700">Scheduled Time</p>
                      <p className="text-sm font-extrabold text-teal-800">
                        {booking.appointment_date} &bull; {booking.appointment_time_slot}
                      </p>
                      {booking.patient_notes && (
                        <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                          <b>Note:</b> {booking.patient_notes}
                        </p>
                      )}
                    </div>

                    {/* Address Details */}
                    <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                      <p className="font-bold text-gray-700">Collection Address</p>
                      <p className="text-gray-900 font-semibold">{booking.address.house_flat}, {booking.address.street}</p>
                      <p className="text-gray-600">{booking.address.area}, {booking.address.city} - {booking.address.pincode}</p>
                      {booking.address.landmark && (
                        <p className="text-[11px] text-gray-500">Landmark: {booking.address.landmark}</p>
                      )}
                    </div>

                    {/* Tests Checklist */}
                    <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
                      <p className="font-bold text-gray-700">Required Specimen Tubes</p>
                      {booking.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-gray-800">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium">{item.item_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Status Action Bar */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {booking.assignment?.sample_barcode && (
                        <div className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-xs font-mono text-teal-900">
                          Barcode: <b>{booking.assignment.sample_barcode}</b> ({booking.assignment.vials_collected} Vials)
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.status === 'STAFF_ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'EN_ROUTE')}
                          className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                        >
                          <Truck className="w-3.5 h-3.5" /> Start Journey (En Route)
                        </button>
                      )}

                      {booking.status === 'COLLECTION_IN_PROGRESS' && (
                        <button
                          onClick={() => handleOpenCollectionModal(booking)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                        >
                          <TestTube2 className="w-3.5 h-3.5" /> Record Sample Collection
                        </button>
                      )}

                      {booking.status === 'SAMPLE_COLLECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'DELIVERED_TO_LAB')}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Transfer Sample to Lab
                        </button>
                      )}

                      {['STAFF_ASSIGNED', 'COLLECTION_IN_PROGRESS'].includes(booking.status) && (
                        <button
                          onClick={() => setSelectedBookingForIssue(booking)}
                          className="px-3.5 py-2 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-bold transition flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Report Issue
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Collection Modal */}
      {selectedBookingForCollect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <TestTube2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Record Sample Collection</h3>
                  <p className="text-xs text-gray-500">{selectedBookingForCollect.patient_name} &bull; {selectedBookingForCollect.booking_code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingForCollect(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Scanned Sample Barcode *</label>
                <input
                  type="text"
                  value={sampleBarcode}
                  onChange={(e) => setSampleBarcode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold text-teal-800 bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Vials Collected</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={vialsCount}
                    onChange={(e) => setVialsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Cold Chain Checked (2-8°C)</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="tempCheck"
                      checked={tempChecked}
                      onChange={(e) => setTempChecked(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="tempCheck" className="font-semibold text-emerald-800">
                      Ice pack verified at 4°C
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Vacutainer Tube Types</label>
                <input
                  type="text"
                  value={tubeTypes}
                  onChange={(e) => setTubeTypes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Phlebotomist Clinical Notes</label>
                <textarea
                  rows={2}
                  value={phleboNotes}
                  onChange={(e) => setPhleboNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedBookingForCollect(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                disabled={isUpdating}
                onClick={() =>
                  handleUpdateStatus(selectedBookingForCollect.id, 'SAMPLE_COLLECTED', {
                    sample_barcode: sampleBarcode,
                    vials_collected: vialsCount,
                    tube_types: tubeTypes,
                    phlebotomist_notes: phleboNotes,
                  })
                }
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                {isUpdating ? 'Sealing...' : 'Confirm Sealed & Collected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {selectedBookingForIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Report Collection Issue</h3>
              <button
                onClick={() => setSelectedBookingForIssue(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-gray-700 block">Select Issue Reason</label>
              {[
                'Patient door locked / phone unreachable',
                'Patient did not complete required 10-12 hr fasting',
                'Patient requested reschedule to a later date',
                'Patient feeling unwell / unable to proceed with draw',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setIssueReason(reason)}
                  className={`w-full p-3 rounded-xl border text-left font-medium transition ${
                    issueReason === reason
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBookingForIssue(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(selectedBookingForIssue.id, 'FAILED', {
                    failure_reason: issueReason,
                  })
                }
                className="px-5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

