import React, { useEffect, useState } from 'react';
import {
  Plus,
  Phone,
  MapPin,
  Clock,
  Stethoscope,
  MoreHorizontal,
  GraduationCap,
  UserPlus,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Doctor } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [newSpec, setNewSpec] = useState({ name: '', description: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    specialization: '',
    department_id: '',
    phone: '',
    availability: '9:00 AM - 5:00 PM',
    experience_years: 0
  });

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDoctors();
      setDoctors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    try {
      const depts = await apiService.getDepartments();
      const specs = await apiService.getSpecializations();
      setDepartments(depts);
      setSpecializations(specs);
      if (depts.length > 0) {
        setFormData(prev => ({ ...prev, department_id: depts[0].id }));
      }
      if (specs.length > 0) {
        setFormData(prev => ({ ...prev, specialization: specs[0].name }));
      }
    } catch (err) {
      console.error('Failed to fetch departments/specializations');
    }
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.createDoctor(formData);
      await fetchDoctors();
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        specialization: '',
        department_id: departments[0]?.id || '',
        phone: '',
        availability: '9:00 AM - 5:00 PM',
        experience_years: 0
      });
    } catch (err: any) {
      alert(err.message || 'Failed to register doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dept = await apiService.createDepartment(newDept);
      const updatedDepts = await apiService.getDepartments();
      setDepartments(updatedDepts);
      setFormData(prev => ({ ...prev, department_id: String(dept.id) }));
      setIsDeptModalOpen(false);
      setNewDept({ name: '', description: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSpecialization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const spec = await apiService.createSpecialization(newSpec);
      const updatedSpecs = await apiService.getSpecializations();
      setSpecializations(updatedSpecs);
      setFormData(prev => ({ ...prev, specialization: spec.name }));
      setIsSpecModalOpen(false);
      setNewSpec({ name: '', description: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to create specialization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await apiService.deleteDoctor(deletingId);
      setDoctors(doctors.filter(d => String(d.id) !== String(deletingId)));
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-[2.5rem] border border-border shadow-sm">
      <div className="w-20 h-20 bg-primary-light rounded-3xl flex items-center justify-center text-primary mb-6">
        <UserPlus size={40} />
      </div>
      <h3 className="text-xl font-bold text-text-main mb-2">No Doctors Found</h3>
      <p className="text-text-muted text-sm max-w-xs mb-8">
        Your medical staff directory is currently empty. Start by adding your first doctor.
      </p>
      <button 
        onClick={handleOpenModal}
        className="btn btn-primary px-8"
      >
        <Plus size={18} />
        Add First Doctor
      </button>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-border"></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main font-outfit">Medical Staff</h2>
          <p className="text-text-muted text-sm font-medium">View and manage hospital doctors and specialists</p>
        </div>
        {!loading && (
          <button 
            onClick={handleOpenModal}
            className="btn btn-primary shadow-xl shadow-blue-200"
          >
            <Plus size={18} />
            Add New Doctor
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
          <p className="text-red-600 text-sm max-w-sm mx-auto">{error}</p>
          <button onClick={fetchDoctors} className="btn bg-red-600 text-white hover:bg-red-700 px-6">Try Again</button>
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState />
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
                  {doctor.profileImage ? (
                    <img src={doctor.profileImage} alt={doctor.fullName} className="w-16 h-16 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
                      <Stethoscope size={32} />
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setDeletingId(doctor.id)}
                      className="p-2 text-text-muted hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Doctor"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button className="p-2 text-text-muted hover:bg-background rounded-xl transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">{doctor.fullName}</h3>
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
                  EXPERIENCE: <span className="text-text-main">{doctor.experienceYears} YRS</span>
                </div>
                <button className="text-sm font-bold text-primary hover:underline">View Schedule</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
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
                <h3 className="text-xl font-bold text-text-main">Register New Specialist</h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSaveDoctor} className="space-y-5">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-text-muted uppercase ml-1">Full Name</label>
                     <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Dr. John Doe"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Email Address</label>
                      <input 
                        type="email" 
                        className="input-field" 
                        placeholder="email@hospital.com"
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-bold text-text-muted uppercase">Specialization</label>
                        <button 
                          type="button"
                          onClick={() => setIsSpecModalOpen(true)}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          + Add New
                        </button>
                      </div>
                      <select 
                        className="input-field"
                        required
                        value={formData.specialization}
                        onChange={e => setFormData({...formData, specialization: e.target.value})}
                      >
                        <option value="">Select Specialization</option>
                        {specializations.map(spec => (
                          <option key={spec.id} value={spec.name}>{spec.name}</option>
                        ))}
                      </select>
                    </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-bold text-text-muted uppercase">Department</label>
                        <button 
                          type="button"
                          onClick={() => setIsDeptModalOpen(true)}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          + Add New
                        </button>
                      </div>
                      <select 
                        className="input-field"
                        required
                        value={formData.department_id}
                        onChange={e => setFormData({...formData, department_id: e.target.value})}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Phone Number</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="555-0101"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Experience (Years)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        placeholder="Years"
                        required
                        value={formData.experience_years || ''}
                        onChange={e => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Availability</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="e.g. 9:00 AM - 5:00 PM"
                        required
                        value={formData.availability}
                        onChange={e => setFormData({...formData, availability: e.target.value})}
                      />
                    </div>
                   </div>

                   <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn btn-primary w-full py-4 mt-2 shadow-lg shadow-blue-100 disabled:opacity-70"
                   >
                    {isSubmitting ? 'Registering...' : 'Register Specialist'}
                   </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Department Modal */}
      <AnimatePresence>
        {isDeptModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsDeptModalOpen(false)} 
              className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-[2rem] p-6 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-main">New Department</h3>
                <button onClick={() => setIsDeptModalOpen(false)} className="text-text-muted hover:text-danger">
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase ml-1">Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Cardiology"
                    required
                    value={newDept.name}
                    onChange={e => setNewDept({...newDept, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase ml-1">Description</label>
                  <textarea 
                    className="input-field min-h-[80px]" 
                    placeholder="Department details..."
                    value={newDept.description}
                    onChange={e => setNewDept({...newDept, description: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary w-full py-3 shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Department'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Specialization Modal */}
      <AnimatePresence>
        {isSpecModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsSpecModalOpen(false)} 
              className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-[2rem] p-6 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-main">New Specialization</h3>
                <button onClick={() => setIsSpecModalOpen(false)} className="text-text-muted hover:text-danger">
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateSpecialization} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase ml-1">Specialization Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Neurologist"
                    required
                    value={newSpec.name}
                    onChange={e => setNewSpec({...newSpec, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase ml-1">Description</label>
                  <textarea 
                    className="input-field min-h-[80px]" 
                    placeholder="Details about the specialization..."
                    value={newSpec.description}
                    onChange={e => setNewSpec({...newSpec, description: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary w-full py-3 shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Specialization'}
                </button>
              </form>
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
              <h3 className="text-xl font-bold text-text-main mb-2">Delete Specialist?</h3>
              <p className="text-text-muted text-sm mb-8">
                Are you sure you want to remove this doctor? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 px-6 rounded-2xl font-bold text-text-muted hover:bg-background transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteDoctor}
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

export default Doctors;
