import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  User,
  Stethoscope,
  Trash2
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Appointment, Patient, Doctor } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  const fetchApts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApts();
  }, []);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    try {
      const [pts, docs] = await Promise.all([
        apiService.getPatients(),
        apiService.getDoctors()
      ]);
      setPatients(pts);
      setDoctors(docs);
      if (pts.length > 0) setFormData(prev => ({ ...prev, patient_id: String(pts[0].id) }));
      if (docs.length > 0) setFormData(prev => ({ ...prev, doctor_id: String(docs[0].id) }));
    } catch (err) {
      console.error('Failed to fetch data for booking');
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.bookAppointment(formData);
      await fetchApts();
      setIsModalOpen(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
      });
    } catch (err: any) {
      alert(err.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string | number, status: string) => {
    try {
      await apiService.updateAppointmentStatus(id, status);
      await fetchApts();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteAppointment = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await apiService.deleteAppointment(deletingId);
      setAppointments(appointments.filter(a => String(a.id) !== String(deletingId)));
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle2 size={16} className="text-success" />;
      case 'PENDING': return <AlertCircle size={16} className="text-warning" />;
      case 'CANCELLED': return <XCircle size={16} className="text-danger" />;
      default: return <Clock size={16} className="text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Appointments</h2>
          <p className="text-text-muted text-sm">Schedule and manage medical consultations</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="btn btn-primary shadow-xl shadow-blue-200"
        >
          <Plus size={18} />
          Book Appointment
        </button>
      </div>

      {/* Appointment Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="h-40 bg-white rounded-3xl animate-pulse"></div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-[2.5rem] border border-border shadow-sm">
            <div className="w-20 h-20 bg-primary-light rounded-3xl flex items-center justify-center text-primary mb-6">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">No Appointments Scheduled</h3>
            <p className="text-text-muted text-sm max-w-xs mb-8">
              Everything is clear for now. Start by booking your first medical consultation.
            </p>
            <button 
              onClick={handleOpenModal}
              className="btn btn-primary px-8"
            >
              <Plus size={18} />
              Book First Appointment
            </button>
          </div>
        ) : (
          appointments.map((apt) => (
            <motion.div 
              key={apt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-6">
                <div className="bg-primary-light text-primary w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Calendar size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-text-main">{apt.patientName}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User size={14} className="text-primary" />
                      PID: {apt.patientId}
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Stethoscope size={14} className="text-primary" />
                      {apt.doctorName}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 md:gap-8">
                <div className="space-y-1 w-full sm:w-auto">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Date & Time</p>
                  <div className="flex items-center gap-2 font-bold text-text-main text-sm">
                    <Clock size={16} className="text-primary" />
                    {apt.date} at {apt.time}
                  </div>
                </div>

                <div className="space-y-1 w-full sm:w-auto">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</p>
                  <div className={`badge ${
                    apt.status === 'CONFIRMED' ? 'badge-success' : 
                    apt.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                  } flex items-center gap-1.5 text-[10px]`}>
                    {getStatusIcon(apt.status)}
                    {apt.status}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 lg:mt-0">
                  {apt.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                        className="flex-1 sm:flex-none btn btn-outline border-danger text-danger hover:bg-danger hover:text-white py-2 text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                        className="flex-1 sm:flex-none btn btn-primary py-2 px-6 text-xs shadow-lg shadow-blue-100"
                      >
                        Confirm
                      </button>
                    </>
                  )}
                  {apt.status === 'CONFIRMED' && (
                    <button 
                      onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                      className="flex-1 sm:flex-none btn btn-outline py-2 text-xs"
                    >
                      Mark Completed
                    </button>
                  )}
                  
                  {/* Delete option always available for all statuses */}
                  <button 
                    onClick={() => setDeletingId(apt.id)}
                    className="p-2 text-text-muted hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Record"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Book Appointment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: '100%', opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: '100%', opacity: 0 }} 
              className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 max-h-[92vh] flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-white sticky top-0 z-20">
                <h3 className="text-xl font-bold text-text-main">Book Appointment</h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleBookAppointment} className="space-y-5">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-text-muted uppercase ml-1">Patient</label>
                     <select 
                        className="input-field"
                        required
                        value={formData.patient_id}
                        onChange={e => setFormData({...formData, patient_id: e.target.value})}
                      >
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.fullName} (PID: {p.id})</option>
                        ))}
                      </select>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-text-muted uppercase ml-1">Assign Doctor</label>
                     <select 
                        className="input-field"
                        required
                        value={formData.doctor_id}
                        onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                      >
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.fullName} - {d.specialization}</option>
                        ))}
                      </select>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Date</label>
                      <input 
                        type="date" 
                        className="input-field" 
                        required
                        value={formData.appointment_date}
                        onChange={e => setFormData({...formData, appointment_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Time</label>
                      <input 
                        type="time" 
                        className="input-field" 
                        required
                        value={formData.appointment_time}
                        onChange={e => setFormData({...formData, appointment_time: e.target.value})}
                      />
                    </div>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-text-muted uppercase ml-1">Reason / Notes</label>
                     <textarea 
                        className="input-field min-h-[100px] py-3" 
                        placeholder="Purpose of visit..."
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                      />
                   </div>

                   <button 
                    type="submit" 
                    disabled={isSubmitting || patients.length === 0 || doctors.length === 0}
                    className="btn btn-primary w-full py-4 mt-2 shadow-lg shadow-blue-100 disabled:opacity-70"
                   >
                    {isSubmitting ? 'Booking...' : 'Book Appointment'}
                   </button>
                   
                   {(patients.length === 0 || doctors.length === 0) && (
                     <p className="text-[10px] text-danger font-bold text-center">
                       Ensure at least one patient and one doctor exist before booking.
                     </p>
                   )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setDeletingId(null)} 
              className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-[2rem] p-8 w-full max-w-sm relative z-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">Delete Appointment?</h3>
              <p className="text-text-muted text-sm mb-8">
                Are you sure you want to remove this appointment record? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 px-6 rounded-2xl font-bold text-text-muted hover:bg-background transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAppointment}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 rounded-2xl font-bold bg-danger text-white hover:bg-red-600 shadow-lg shadow-red-100 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Appointments;
