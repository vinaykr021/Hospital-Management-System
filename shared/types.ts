export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  blood_group: string;
  created_at: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  available_days: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
}

export interface Ward {
  id: number;
  name: string;
  total_beds: number;
  occupied_beds: number;
  floor: string;
}

export interface Admission {
  id: number;
  patient_id: number;
  ward_id: number;
  bed_no: number;
  admitted_at: string;
  discharged_at: string | null;
}

export interface Bill {
  id: number;
  patient_id: number;
  amount: number;
  items_json: string;
  paid: boolean;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: 'admin' | 'staff';
}
