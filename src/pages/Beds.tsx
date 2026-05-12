import React, { useEffect, useState } from 'react';
import { 
  Bed as BedIcon, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3,
  LogOut,
  Settings
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Bed, Patient } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Beds: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [formData, setFormData] = useState({
    bed_number: '',
    room_number: '',
    ward_type: 'General',
    bed_type: 'Manual',
    status: 'Available'
  });

  const [assignData, setAssignData] = useState({
    patient_id: ''
  });

  const fetchBeds = async () => {
    try {
      const data = await apiService.getBeds();
      setBeds(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await apiService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBeds();
    fetchPatients();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedBed(null);
    setFormData({
      bed_number: '',
      room_number: '',
      ward_type: 'General',
      bed_type: 'Manual',
      status: 'Available'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bed: Bed) => {
    setSelectedBed(bed);
    setFormData({
      bed_number: bed.bedNumber,
      room_number: bed.roomNumber,
      ward_type: bed.wardType,
      bed_type: bed.bedType,
      status: bed.status
    });
    setIsModalOpen(true);
  };

  const handleOpenAssignModal = (bed: Bed) => {
    setSelectedBed(bed);
    fetchPatients();
    setIsAssignModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedBed) {
        await apiService.updateBed(selectedBed.id, formData);
      } else {
        await apiService.createBed(formData);
      }
      await fetchBeds();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;
    setIsSubmitting(true);
    try {
      await apiService.assignPatientToBed(selectedBed.id, assignData.patient_id);
      await fetchBeds();
      setIsAssignModalOpen(false);
      setAssignData({ patient_id: '' });
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReleaseBed = async (id: string | number) => {
    if (!confirm('Are you sure you want to release this bed? It will be marked for cleaning.')) return;
    try {
      await apiService.releaseBed(id);
      await fetchBeds();
    } catch (err: any) {
      alert(err.message || 'Release failed');
    }
  };

  const handleDeleteBed = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this bed?')) return;
    try {
      await apiService.deleteBed(id);
      await fetchBeds();
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    }
  };

  const handleUpdateBedInline = async (bed: Bed, updates: Partial<any>) => {
    try {
      // Create a copy of the current bed data
      const payload = {
        bed_number: bed.bedNumber,
        room_number: bed.roomNumber,
        ward_type: bed.wardType,
        bed_type: bed.bedType,
        status: bed.status,
        assigned_patient_id: bed.assignedPatientId
      };

      // Case 1: User is assigning a patient
      if (updates.assigned_patient_id !== undefined) {
        payload.assigned_patient_id = updates.assigned_patient_id;
        if (payload.assigned_patient_id) {
          payload.status = 'Occupied'; // Assigning forces status to Occupied
        } else {
          payload.status = 'Available'; // Unassigning forces status to Available
        }
      } 
      // Case 2: User is changing status
      else if (updates.status !== undefined) {
        payload.status = updates.status;
        // If status becomes Maintenance or Cleaning, clear any patient
        if (payload.status === 'Maintenance' || payload.status === 'Cleaning') {
          payload.assigned_patient_id = null;
        }
      }

      await apiService.updateBed(bed.id, payload);
      await fetchBeds();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'Available').length,
    occupied: beds.filter(b => b.status === 'Occupied').length,
    maintenance: beds.filter(b => b.status === 'Maintenance' || b.status === 'Cleaning').length
  };

  const filteredBeds = beds.filter(bed => {
    const matchesSearch = 
      bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bed.assignedPatientName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || bed.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-success/10 text-success border-success/20';
      case 'Occupied': return 'bg-danger/10 text-danger border-danger/20';
      case 'Cleaning': return 'bg-warning/10 text-warning border-warning/20';
      case 'Maintenance': return 'bg-text-muted/10 text-text-muted border-text-muted/20';
      default: return 'bg-background text-text-muted border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Bed Management</h2>
          <p className="text-text-muted text-sm">Manage hospital room and bed availability</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="btn btn-primary shadow-xl shadow-blue-200"
        >
          <Plus size={18} />
          Add New Bed
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-primary-light text-primary p-3 rounded-2xl">
              <BedIcon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Beds</p>
              <p className="text-2xl font-black text-text-main">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-success/10 text-success p-3 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Available</p>
              <p className="text-2xl font-black text-text-main">{stats.available}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-danger/10 text-danger p-3 rounded-2xl">
              <LogOut className="rotate-180" size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Occupied</p>
              <p className="text-2xl font-black text-text-main">{stats.occupied}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-warning/10 text-warning p-3 rounded-2xl">
              <Settings size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Maintenance</p>
              <p className="text-2xl font-black text-text-main">{stats.maintenance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by bed, room, or patient..." 
            className="w-full pl-12 pr-4 py-3 bg-background border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-text-muted" />
          <select 
            className="bg-background border-none rounded-2xl px-4 py-3 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary/20 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Bed List */}
      <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Bed Info</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Ward/Type</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Assigned Patient</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-background rounded-full w-3/4 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredBeds.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-background p-4 rounded-full text-text-muted">
                        <BedIcon size={40} />
                      </div>
                      <p className="text-text-muted font-medium">No beds match your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBeds.map((bed) => (
                  <tr key={bed.id} className="hover:bg-background/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${getStatusColor(bed.status)}`}>
                          <BedIcon size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-text-main">Bed {bed.bedNumber}</p>
                          <p className="text-xs text-text-muted">Room {bed.roomNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-text-main">{bed.wardType}</p>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">{bed.bedType}</p>
                    </td>
                    <td className="px-6 py-4 relative z-20">
                      <select 
                        value={bed.status}
                        onChange={(e) => handleUpdateBedInline(bed, { status: e.target.value })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border cursor-pointer outline-none transition-all ${getStatusColor(bed.status)}`}
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 relative z-20">
                      <select 
                        value={bed.assignedPatientId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateBedInline(bed, { 
                            assigned_patient_id: val === '' ? null : Number(val) 
                          });
                        }}
                        className="bg-transparent text-sm font-bold text-text-main border-none focus:ring-0 cursor-pointer outline-none max-w-[150px] truncate"
                      >
                        <option value="">-- Unassigned --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.fullName}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bed.status === 'Available' ? (
                          <button 
                            onClick={() => handleOpenAssignModal(bed)}
                            className="p-2 text-primary hover:bg-primary-light rounded-xl transition-all"
                            title="Assign Patient"
                          >
                            <UserPlus size={18} />
                          </button>
                        ) : bed.status === 'Occupied' ? (
                          <button 
                            onClick={() => handleReleaseBed(bed.id)}
                            className="p-2 text-warning hover:bg-warning/10 rounded-xl transition-all"
                            title="Release Bed"
                          >
                            <LogOut size={18} />
                          </button>
                        ) : null}
                        <button 
                          onClick={() => handleOpenEditModal(bed)}
                          className="p-2 text-text-muted hover:text-primary hover:bg-background rounded-xl transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBed(bed.id)}
                          className="p-2 text-text-muted hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="group-hover:hidden text-text-muted">
                        <MoreVertical size={18} className="ml-auto" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Bed Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-main">{selectedBed ? 'Edit Bed' : 'Add New Bed'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-danger hover:bg-red-50 rounded-xl transition-all">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Bed Number</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        required 
                        placeholder="e.g. 101-A"
                        value={formData.bed_number}
                        onChange={e => setFormData({...formData, bed_number: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Room Number</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        required 
                        placeholder="e.g. 101"
                        value={formData.room_number}
                        onChange={e => setFormData({...formData, room_number: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase ml-1">Ward Type</label>
                    <select 
                      className="input-field"
                      value={formData.ward_type}
                      onChange={e => setFormData({...formData, ward_type: e.target.value})}
                    >
                      <option value="General">General Ward</option>
                      <option value="ICU">ICU</option>
                      <option value="Surgical">Surgical Ward</option>
                      <option value="Maternity">Maternity</option>
                      <option value="Pediatric">Pediatric</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase ml-1">Bed Type</label>
                    <select 
                      className="input-field"
                      value={formData.bed_type}
                      onChange={e => setFormData({...formData, bed_type: e.target.value})}
                    >
                      <option value="Manual">Manual</option>
                      <option value="Semi-Electric">Semi-Electric</option>
                      <option value="Full-Electric">Full-Electric</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase ml-1">Initial Status</label>
                    <select 
                      className="input-field"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Available">Available</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn btn-primary w-full py-4 mt-2 shadow-lg shadow-blue-100 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Saving...' : (selectedBed ? 'Update Bed' : 'Add Bed')}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Patient Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsAssignModalOpen(false)} 
              className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-text-main">Assign Patient</h3>
                  <p className="text-xs text-text-muted">Assigning to Bed {selectedBed?.bedNumber}</p>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-danger hover:bg-red-50 rounded-xl transition-all">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleAssignPatient} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase ml-1">Select Patient</label>
                    <select 
                      className="input-field"
                      required
                      value={assignData.patient_id}
                      onChange={e => setAssignData({ patient_id: e.target.value })}
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.fullName} (PID: {p.id})</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || !assignData.patient_id}
                    className="btn btn-primary w-full py-4 mt-2 shadow-lg shadow-blue-100 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Assigning...' : 'Assign to Bed'}
                  </button>
                  
                  {patients.length === 0 && (
                    <p className="text-xs text-danger text-center font-medium">No patients found. Add a patient first.</p>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Beds;
