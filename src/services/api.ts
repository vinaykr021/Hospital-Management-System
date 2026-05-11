import type { Patient, Doctor, Appointment, Bill, DashboardStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper for authorized fetch
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const userJson = localStorage.getItem('user');
  const token = userJson ? JSON.parse(userJson).token : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

export const apiService = {
  // Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await fetchWithAuth('/dashboard/stats');
    return {
      ...response.data,
      revenueSummary: response.data.totalRevenue
    };
  },

  // Patients
  getPatients: async (): Promise<Patient[]> => {
    const response = await fetchWithAuth('/patients');
    // Map snake_case from DB to camelCase for Frontend
    return response.data.map((p: any) => ({
      ...p,
      fullName: p.full_name,
      bloodGroup: p.blood_group,
      medicalHistory: p.medical_history,
      createdAt: p.created_at
    }));
  },

  createPatient: async (data: Partial<Patient>): Promise<Patient> => {
    const response = await fetchWithAuth('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Doctors
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await fetchWithAuth('/doctors');
    return response.data;
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await fetchWithAuth('/appointments');
    return response.data.map((a: any) => ({
      ...a,
      patientId: a.patient_id,
      patientName: a.patient_name,
      doctorId: a.doctor_id,
      doctorName: a.doctor_name,
      date: a.appointment_date,
      time: a.appointment_time
    }));
  },

  // Billing
  getBills: async (): Promise<Bill[]> => {
    const response = await fetchWithAuth('/bills');
    return response.data;
  },
};
