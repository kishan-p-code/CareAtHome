export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  customer_profile?: CustomerProfile;
  staff_profile?: StaffProfile;
}

export interface CustomerProfile {
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  emergency_contact?: string;
  medical_history?: string;
}

export interface StaffProfile {
  qualification?: string;
  license_number?: string;
  service_area?: string;
  is_available: boolean;
  total_collections: number;
  rating: number;
  police_verification_status: string;
}

export interface TestItem {
  id: number;
  code: string;
  name: string;
  category: string;
  short_description: string;
  description: string;
  price: number;
  market_price?: number;
  sample_type: string;
  tube_color: string;
  fasting_required: boolean;
  fasting_hours: number;
  preparation_instructions: string;
  turnaround_time_hours: number;
  parameters_count: number;
  is_popular: boolean;
  is_active: boolean;
}

export interface TestPackage {
  id: number;
  code: string;
  name: string;
  category: string;
  tagline?: string;
  description: string;
  price: number;
  market_price: number;
  fasting_required: boolean;
  fasting_hours: number;
  preparation_instructions: string;
  turnaround_time_hours: number;
  parameters_count: number;
  sample_types: string;
  target_demographic: string;
  is_popular: boolean;
  is_active: boolean;
  tests?: TestItem[];
}

export interface Address {
  id?: number;
  address_type: string;
  house_flat: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'STAFF_ASSIGNED'
  | 'COLLECTION_IN_PROGRESS'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING_AT_LAB'
  | 'REPORT_READY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface BookingItem {
  id: number;
  item_type: 'test' | 'package';
  test_id?: number;
  package_id?: number;
  item_name: string;
  price: number;
}

export interface StaffAssignment {
  id: number;
  staff_id: number;
  staff_name?: string;
  staff_phone?: string;
  status: string;
  sample_barcode?: string;
  vials_collected: number;
  tube_types?: string;
  phlebotomist_notes?: string;
  assigned_at: string;
  completed_at?: string;
}

export interface Booking {
  id: number;
  booking_code: string;
  user_id: number;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  patient_phone: string;
  patient_email?: string;
  patient_notes?: string;
  address: Address;
  appointment_date: string;
  appointment_time_slot: string;
  status: BookingStatus;
  cancellation_reason?: string;
  subtotal: number;
  collection_fee: number;
  discount_amount: number;
  total_amount: number;
  coupon_code?: string;
  items: BookingItem[];
  assignment?: StaffAssignment;
  payment_status?: string;
  payment_id?: string;
  reports_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReportItem {
  id: number;
  booking_id: number;
  user_id: number;
  file_name: string;
  file_size_bytes: number;
  lab_name: string;
  verified_by_doctor: string;
  doctor_registration: string;
  is_verified: boolean;
  verification_notes?: string;
  created_at: string;
}

export interface ServiceablePincode {
  id: number;
  pincode: string;
  area_name: string;
  city: string;
  state: string;
  is_active: boolean;
  estimated_transit_hours: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  action_link?: string;
  created_at: string;
}

