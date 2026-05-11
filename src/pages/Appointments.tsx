import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  User,
  Stethoscope
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Appointment } from '../types';
import { motion } from 'framer-motion';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApts = async () => {
      try {
        const data = await apiService.getAppointments();
        setAppointments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchApts();
  }, []);

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
        <button className="btn btn-primary">
          <Plus size={18} />
          Book Appointment
        </button>
      </div>

      {/* Appointment Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="h-40 bg-white rounded-3xl animate-pulse"></div>
        ) : (
          appointments.map((apt) => (
            <motion.div 
              key={apt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
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
                  <button className="flex-1 sm:flex-none btn btn-outline py-2 text-xs">Reschedule</button>
                  <button className="flex-1 sm:flex-none btn btn-primary py-2 px-6 text-xs">Confirm</button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Appointments;
