import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Phone, 
  MapPin, 
  Clock, 
  Stethoscope, 
  MoreHorizontal,
  GraduationCap
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Doctor } from '../types';
import { motion } from 'framer-motion';

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await apiService.getDoctors();
        setDoctors(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main font-outfit">Medical Staff</h2>
          <p className="text-text-muted text-sm font-medium">View and manage hospital doctors and specialists</p>
        </div>
        <button className="btn btn-primary shadow-xl shadow-blue-200">
          <Plus size={18} />
          Add New Doctor
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-border"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <motion.div 
              key={doctor.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
                    <Stethoscope size={32} />
                  </div>
                  <button className="p-2 text-text-muted hover:bg-background rounded-xl transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">{doctor.name}</h3>
                  <div className="flex items-center gap-1.5 text-primary text-sm font-bold bg-blue-50 w-fit px-2 py-0.5 rounded-lg">
                    <GraduationCap size={14} />
                    {doctor.specialization}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <div className="p-1.5 bg-background rounded-lg"><Clock size={14} /></div>
                    <span>{doctor.availability}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <div className="p-1.5 bg-background rounded-lg"><Phone size={14} /></div>
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <div className="p-1.5 bg-background rounded-lg"><MapPin size={14} /></div>
                    <span>Dept: {doctor.department}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-background border-t border-border flex items-center justify-between">
                <div className="text-xs font-bold text-text-muted">
                  EXPERIENCE: <span className="text-text-main">{doctor.experience} YRS</span>
                </div>
                <button className="text-sm font-bold text-primary hover:underline">View Schedule</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
