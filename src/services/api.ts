import type { Patient, Doctor, Appointment, Bill, DashboardStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Simple fetch helper without authentication
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
      console.error(`[API Error] ${endpoint}: ${response.status}`);
      let errorMsg = 'API request failed';
      try {
        const error = await response.json();
        if (error.error && Array.isArray(error.error)) {
          errorMsg = error.error.map((e: any) => `${e.path?.join('.')}: ${e.message}`).join(', ');
        } else {
          errorMsg = error.message || errorMsg;
        }
      } catch (e) {}
      throw new Error(errorMsg);
    }

    return response.json();
  } catch (error: any) {
    console.error(`[Network Error] ${endpoint}:`, error.message);
    throw error;
  }
};

export const apiService = {
  // Auth
  login: async (credentials: any): Promise<any> => {
    const response = await fetchWithAuth('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  },

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
      id: p.id,
      patientId: p.patient_id || `PAT-${String(p.id).padStart(4, '0')}`,
      fullName: p.full_name,
      age: p.age,
      gender: p.gender,
      bloodGroup: p.blood_group,
      phone: p.phone,
      lastVisit: p.last_visit || p.created_at || new Date().toISOString()
    }));
  },

  createPatient: async (data: Partial<Patient>): Promise<Patient> => {
    // Convert camelCase to snake_case for backend
    const payload = {
      full_name: data.fullName,
      age: data.age,
      gender: data.gender,
      blood_group: data.bloodGroup,
      phone: data.phone,
      address: data.address,
      medical_history: data.medicalHistory || ''
    };
    const response = await fetchWithAuth('/patients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    // Map response from snake_case to camelCase for frontend
    const p = response.data;
    return {
      id: p.id,
      patientId: `PAT-${String(p.id).padStart(4, '0')}`,
      fullName: p.full_name,
      age: p.age,
      gender: p.gender,
      bloodGroup: p.blood_group,
      phone: p.phone,
      address: p.address || '',
      lastVisit: new Date().toISOString()
    };
  },

  updatePatient: async (id: string | number, data: Partial<Patient>): Promise<Patient> => {
    // Convert camelCase to snake_case for backend
    const payload = {
      full_name: data.fullName,
      age: data.age,
      gender: data.gender,
      blood_group: data.bloodGroup,
      phone: data.phone,
      address: data.address,
      medical_history: data.medicalHistory || ''
    };
    const response = await fetchWithAuth(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    // Map response from snake_case to camelCase for frontend
    return {
      id: id,
      patientId: `PAT-${String(id).padStart(4, '0')}`,
      fullName: data.fullName || '',
      age: data.age || 0,
      gender: data.gender || 'Male',
      bloodGroup: data.bloodGroup || '',
      phone: data.phone || '',
      address: data.address || '',
      lastVisit: new Date().toISOString()
    };
  },

  deletePatient: async (id: string | number): Promise<void> => {
    await fetchWithAuth(`/patients/${id}`, {
      method: 'DELETE',
    });
  },

  // Doctors
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await fetchWithAuth('/doctors');
    // Map snake_case from DB to camelCase for Frontend
    return response.data.map((d: any) => ({
      id: d.id,
      fullName: d.name || d.full_name,
      specialization: d.specialization,
      department: d.department_name || d.department || 'General',
      phone: d.phone,
      availability: d.availability,
      experienceYears: d.experience_years || d.experience || 0,
      profileImage: d.profile_image || null
    }));
  },

  createDoctor: async (data: any): Promise<Doctor> => {
    const response = await fetchWithAuth('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updateDoctor: async (id: string | number, data: any): Promise<void> => {
    await fetchWithAuth(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDoctor: async (id: string | number): Promise<void> => {
    await fetchWithAuth(`/doctors/${id}`, {
      method: 'DELETE',
    });
  },

  getDepartments: async (): Promise<any[]> => {
    const response = await fetchWithAuth('/departments');
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

  bookAppointment: async (data: any): Promise<void> => {
    await fetchWithAuth('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAppointmentStatus: async (id: string | number, status: string): Promise<void> => {
    await fetchWithAuth(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deleteAppointment: async (id: string | number): Promise<void> => {
    await fetchWithAuth(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },

  // Beds
  getBeds: async (): Promise<Bed[]> => {
    const response = await fetchWithAuth('/beds');
    return response.data.map((b: any) => ({
      id: b.id,
      bedNumber: b.bed_number,
      roomNumber: b.room_number,
      wardType: b.ward_type,
      bedType: b.bed_type,
      status: b.status,
      assignedPatientId: b.assigned_patient_id,
      assignedPatientName: b.assigned_patient_name
    }));
  },

  createBed: async (data: any): Promise<void> => {
    await fetchWithAuth('/beds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBed: async (id: string | number, data: any): Promise<void> => {
    await fetchWithAuth(`/beds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBed: async (id: string | number): Promise<void> => {
    await fetchWithAuth(`/beds/${id}`, {
      method: 'DELETE',
    });
  },

  assignPatientToBed: async (bedId: string | number, patientId: string | number): Promise<void> => {
    await fetchWithAuth(`/beds/${bedId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId }),
    });
  },

  releaseBed: async (id: string | number): Promise<void> => {
    await fetchWithAuth(`/beds/${id}/release`, {
      method: 'POST',
    });
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const response = await fetchWithAuth('/departments');
    return response.data;
  },

  createDepartment: async (data: any): Promise<Department> => {
    const response = await fetchWithAuth('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Specializations
  getSpecializations: async (): Promise<Specialization[]> => {
    const response = await fetchWithAuth('/specializations');
    return response.data;
  },

  createSpecialization: async (data: any): Promise<Specialization> => {
    const response = await fetchWithAuth('/specializations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Billing
  getBills: async (): Promise<Bill[]> => {
    const response = await fetchWithAuth('/bills');
    return response.data.map((b: any) => ({
      id: b.id,
      patientId: b.patient_id,
      patientName: b.patient_name,
      doctorId: b.doctor_id,
      doctorName: b.doctor_name,
      appointmentId: b.appointment_id,
      serviceType: b.service_type,
      consultationFee: b.consultation_fee,
      bedCharges: b.bed_charges,
      medicineCharges: b.medicine_charges,
      other_charges: b.other_charges,
      totalAmount: b.total_amount,
      paymentStatus: b.payment_status,
      paymentMethod: b.payment_method,
      billingDate: b.billing_date
    }));
  },

  generateBill: async (data: any): Promise<void> => {
    await fetchWithAuth('/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePaymentStatus: async (id: string | number, status: string): Promise<void> => {
    await fetchWithAuth(`/bills/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status: status }),
    });
  },

  deleteBill: async (id: string | number): Promise<void> => {
    await fetchWithAuth(`/bills/${id}`, {
      method: 'DELETE',
    });
  },
};
