'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Truck, 
  TestTube2, 
  Microscope, 
  FileCheck, 
  AlertCircle 
} from 'lucide-react';
import { BookingStatus } from '../types';

interface StatusTimelineProps {
  status: BookingStatus;
  sampleBarcode?: string;
  staffName?: string;
}

export default function StatusTimeline({ status, sampleBarcode, staffName }: StatusTimelineProps) {
  if (status === 'CANCELLED') {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Booking Cancelled</h4>
          <p className="text-rose-700 mt-0.5">This appointment has been cancelled according to cancellation policy.</p>
        </div>
      </div>
    );
  }

  const steps = [
    {
      key: 'CONFIRMED',
      title: 'Booking Confirmed',
      desc: 'Appointment slot reserved',
      icon: CheckCircle2,
    },
    {
      key: 'STAFF_ASSIGNED',
      title: 'Phlebotomist Assigned',
      desc: staffName ? `Assigned to ${staffName}` : 'Certified specialist matched',
      icon: UserCheck,
    },
    {
      key: 'COLLECTION_IN_PROGRESS',
      title: 'En Route',
      desc: 'Phlebotomist on the way with cold box',
      icon: Truck,
    },
    {
      key: 'SAMPLE_COLLECTED',
      title: 'Sample Collected',
      desc: sampleBarcode ? `Barcoded: ${sampleBarcode}` : 'Painless draw sealed at 2-8°C',
      icon: TestTube2,
    },
    {
      key: 'PROCESSING_AT_LAB',
      title: 'Lab Analysis',
      desc: 'Automated assays at NABL lab',
      icon: Microscope,
    },
    {
      key: 'REPORT_READY',
      title: 'Report Verified',
      desc: 'Signed by MD Pathologist',
      icon: FileCheck,
    },
  ];

  const statusOrder: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    STAFF_ASSIGNED: 2,
    COLLECTION_IN_PROGRESS: 3,
    SAMPLE_COLLECTED: 4,
    PROCESSING_AT_LAB: 5,
    REPORT_READY: 6,
    COMPLETED: 6,
  };

  const currentLevel = statusOrder[status] ?? 1;

  return (
    <div className="py-2">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isDone = stepNumber <= currentLevel;
          const isCurrent = stepNumber === currentLevel;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`p-3 rounded-2xl border transition relative ${
                isCurrent
                  ? 'bg-teal-50 border-teal-500 shadow-sm ring-1 ring-teal-500'
                  : isDone
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-gray-50 border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-teal-600 text-white animate-pulse'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Step 0{stepNumber}
                </span>
              </div>

              <h4 className={`text-xs font-bold leading-tight ${isCurrent ? 'text-teal-900' : isDone ? 'text-emerald-900' : 'text-gray-600'}`}>
                {step.title}
              </h4>
              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

