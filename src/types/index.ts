export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Patient {
  id: string | number;
  patientId: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  address?: string;
  medicalHistory?: string;
  lastVisit: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  department: string;
  phone: string;
  availability: string;
  experienceYears: number;
  profileImage?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  reason: string;
}

export interface Bill {
  id: string | number;
  patientId: string | number;
  patientName: string;
  doctorId?: string | number;
  doctorName?: string;
  appointmentId?: string | number;
  serviceType: string;
  consultationFee: number;
  bedCharges: number;
  medicineCharges: number;
  otherCharges: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Other';
  billingDate: string;
}

export interface Bed {
  id: string | number;
  bedNumber: string;
  roomNumber: string;
  wardType: 'General' | 'ICU' | 'Surgical' | 'Maternity' | 'Pediatric';
  bedType: 'Manual' | 'Semi-Electric' | 'Full-Electric';
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';
  assignedPatientId?: string | number | null;
  assignedPatientName?: string;
}

export interface Department {
  id: string | number;
  name: string;
  description?: string;
}

export interface Specialization {
  id: string | number;
  name: string;
  description?: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  appointmentsToday: number;
  revenueSummary: number;
}
