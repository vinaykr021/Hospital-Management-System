import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Phone,
  Calendar,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Patient } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPatients();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-[2.5rem] border border-border shadow-sm">
      <div className="w-20 h-20 bg-primary-light rounded-3xl flex items-center justify-center text-primary mb-6">
        <UserPlus size={40} />
      </div>
      <h3 className="text-xl font-bold text-text-main mb-2">No Patients Found</h3>
      <p className="text-text-muted text-sm max-w-xs mb-8">
        Your patient directory is currently empty. Start by registering your first patient.
      </p>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="btn btn-primary px-8"
      >
        <Plus size={18} />
        Add First Patient
      </button>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-border animate-pulse flex items-center gap-6">
          <div className="w-12 h-12 bg-background rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-background rounded w-1/4" />
            <div className="h-3 bg-background rounded w-1/6" />
          </div>
          <div className="h-8 bg-background rounded w-20 hidden md:block" />
          <div className="h-8 bg-background rounded w-20 hidden md:block" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-main">Patients Directory</h2>
          <p className="text-text-muted text-xs md:text-sm">Manage and monitor patient records</p>
        </div>
        {!loading && patients.length > 0 && (
          <div className="flex items-center gap-2 md:gap-3">
            <button className="btn btn-outline flex-1 sm:flex-none py-2.5 px-4">
              <Download size={18} />
              <span className="hidden xs:inline">Export</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary flex-1 sm:flex-none py-2.5 px-4"
            >
              <Plus size={18} />
              <span>Add Patient</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters & Search - Only show if patients exist or loading */}
      {(loading || patients.length > 0) && (
        <div className="bg-white p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center gap-4 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search name or ID..." 
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium hover:border-primary transition-all flex-1 md:flex-none">
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
          <p className="text-red-600 text-sm max-w-sm mx-auto">{error}</p>
          <button onClick={fetchPatients} className="btn bg-red-600 text-white hover:bg-red-700 px-6">Try Again</button>
        </div>
      ) : patients.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background">
                  <tr>
                    <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-text-muted uppercase tracking-wider">Patient Info</th>
                    <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-text-muted uppercase tracking-wider">Age/Gender</th>
                    <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-text-muted uppercase tracking-wider">Blood Group</th>
                    <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-text-muted uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-text-muted uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-primary-light/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-primary font-bold">
                            {(patient.fullName || 'P').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-text-main text-sm">{patient.fullName}</p>
                            <p className="text-[10px] text-text-muted uppercase">ID: PAT-{String(patient.id || '').padStart(4, '0')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-text-main font-medium">{patient.age} Yrs</p>
                        <p className="text-xs text-text-muted">{patient.gender}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-danger px-2.5 py-1 text-[10px]">{patient.bloodGroup}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-main font-medium">{patient.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 text-text-muted hover:text-primary transition-colors"><Eye size={16} /></button>
                          <button className="p-2 text-text-muted hover:text-success transition-colors"><Edit size={16} /></button>
                          <button className="p-2 text-text-muted hover:text-danger transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredPatients.map((patient) => (
              <motion.div 
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-[2rem] border border-border shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-lg font-bold">
                      {(patient.fullName || 'P').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-main">{patient.fullName}</h3>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">PAT-{String(patient.id || '').padStart(4, '0')}</p>
                    </div>
                  </div>
                  <span className="badge badge-danger text-[10px]">{patient.bloodGroup}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/50">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Calendar size={14} className="text-primary" />
                    <span>{patient.age} Yrs • {patient.gender}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Phone size={14} className="text-primary" />
                    <span>{patient.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button className="flex-1 btn btn-outline py-2.5 text-xs"><Eye size={14} /> View</button>
                  <button className="p-2.5 text-success hover:bg-green-50 rounded-xl transition-colors"><Edit size={18} /></button>
                  <button className="p-2.5 text-danger hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-4 md:px-6 py-4 bg-background border border-border rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Showing <span className="text-text-main">{filteredPatients.length}</span> Results
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white border border-border rounded-xl hover:border-primary"><ChevronLeft size={18} /></button>
              <button className="w-9 h-9 rounded-xl text-xs font-bold bg-primary text-white shadow-lg shadow-blue-100">1</button>
              <button className="p-2 bg-white border border-border rounded-xl hover:border-primary"><ChevronRight size={18} /></button>
            </div>
          </div>
        </>
      )}

      {/* Modal - Kept for consistency */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 max-h-[92vh] flex flex-col">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-xl font-bold">New Patient Entry</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-danger"><Plus className="rotate-45" size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form className="space-y-4">
                   <input type="text" className="input-field" placeholder="Full Name" />
                   <div className="grid grid-cols-2 gap-4">
                    <input type="number" className="input-field" placeholder="Age" />
                    <select className="input-field"><option>Male</option><option>Female</option></select>
                   </div>
                   <input type="text" className="input-field" placeholder="Phone" />
                   <button type="submit" className="btn btn-primary w-full py-4">Register Patient</button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Patients;
