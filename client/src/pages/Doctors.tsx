import { useState, useEffect, useMemo } from 'react';
import { FaTrash, FaSearch, FaFilter, FaUserPlus, FaUserMd, FaStar, FaPhoneAlt, FaEnvelope, FaCalendarAlt, FaStethoscope, FaExclamationTriangle, FaTimes, FaCheckCircle, FaAward, FaAmbulance, FaHeartbeat } from 'react-icons/fa';

// Helper to mock data deterministically based on DB ID
const getMockExperience = (id: number) => (id * 7 % 25) + 3;
const getMockRating = (id: number) => (4.2 + (id % 8) / 10).toFixed(1);

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<number | null>(null);
  
  // View Profile Modal
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', specialization: '', phone: '', email: '', available_days: '' });
  
  // Toast
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDoctors = () => {
    setIsLoading(true);
    fetch('http://localhost:3000/api/doctors', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setDoctors(data);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
      showToast('Failed to load doctors', 'error');
    });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', specialization: '', phone: '', email: '', available_days: '' });
        fetchDoctors();
        showToast('Doctor added successfully!', 'success');
      } else {
        showToast('Failed to add doctor.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (doctorToDelete === null) return;
    try {
      const res = await fetch(`http://localhost:3000/api/doctors/${doctorToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchDoctors();
        showToast('Doctor removed successfully!', 'success');
        setSelectedDoctor(null);
      } else {
        showToast('Failed to remove doctor.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error.', 'error');
    } finally {
      setShowDeleteModal(false);
      setDoctorToDelete(null);
    }
  };

  // Derived State
  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === '' || d.specialization === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [doctors, searchTerm, deptFilter]);

  const uniqueDepartments = Array.from(new Set(doctors.map(d => d.specialization))).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${toast.type === 'success' ? 'bg-teal-50 text-teal-800 border-l-4 border-teal-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
          {toast.type === 'success' ? <FaCheckCircle className="mr-3 text-teal-500 text-xl" /> : <FaExclamationTriangle className="mr-3 text-red-500 text-xl" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header & Quick Stats */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Doctor Management</h2>
            <p className="text-gray-500 text-sm mt-1">Manage hospital medical staff, schedules, and profiles.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="mt-4 md:mt-0 flex items-center bg-teal-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-teal-500/30 hover:bg-teal-700 hover:shadow-teal-500/50 transition-all transform hover:-translate-y-0.5 font-semibold">
            <FaUserPlus className="mr-2" /> Add Doctor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-teal-50 rounded-xl text-teal-600"><FaUserMd className="text-2xl" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Total Specialists</p><h3 className="text-2xl font-bold text-gray-800">{doctors.length}</h3></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><FaStethoscope className="text-2xl" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Departments</p><h3 className="text-2xl font-bold text-gray-800">{uniqueDepartments.length}</h3></div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search doctors by name..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full sm:w-auto space-x-4">
          <div className="relative w-full sm:w-64">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none text-gray-600"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserMd className="text-5xl text-gray-300" />
          </div>
          <h4 className="text-xl font-bold text-gray-700">No doctors found</h4>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">Try adjusting your filters or search term, or click "Add Doctor" to expand the directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map(d => {
            const exp = getMockExperience(d.id);
            const rating = getMockRating(d.id);
            return (
              <div 
                key={d.id} 
                onClick={() => setSelectedDoctor(d)}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-teal-200 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                <div className="p-6 relative">
                  
                  <div className="flex items-center space-x-4 mb-5">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-teal-500/30">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-teal-600 transition-colors">{d.name}</h3>
                      <p className="text-teal-600 text-sm font-medium">{d.specialization}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-y border-gray-50 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Experience</p>
                      <p className="font-bold text-gray-700">{exp} <span className="text-xs font-normal">Yrs</span></p>
                    </div>
                    <div className="w-px h-8 bg-gray-100"></div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Rating</p>
                      <p className="font-bold text-gray-700 flex items-center justify-center"><FaStar className="text-yellow-400 mr-1 text-sm"/> {rating}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="flex items-center text-gray-600"><FaCalendarAlt className="w-4 text-gray-400 mr-2" /> <span className="truncate">{d.available_days}</span></p>
                    <p className="flex items-center text-gray-600"><FaPhoneAlt className="w-4 text-gray-400 mr-2" /> {d.phone}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" onClick={() => setSelectedDoctor(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-100" onClick={e => e.stopPropagation()}>
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 h-32 relative">
              <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full backdrop-blur-md transition-all">
                <FaTimes />
              </button>
            </div>
            
            {/* Profile Content */}
            <div className="px-8 pb-8 relative">
              <div className="flex justify-between items-end mb-6">
                <div className="h-24 w-24 rounded-2xl bg-white p-1 absolute -top-12 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 text-white flex items-center justify-center text-4xl font-bold">
                    {selectedDoctor.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-auto mt-4 space-x-2">
                  <button 
                    onClick={() => { setDoctorToDelete(selectedDoctor.id); setShowDeleteModal(true); }}
                    className="text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center inline-flex"
                  >
                    <FaTrash className="mr-2" /> Remove Doctor
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800">{selectedDoctor.name}</h2>
              <p className="text-teal-600 font-medium text-lg mb-6 flex items-center"><FaStethoscope className="mr-2"/> {selectedDoctor.specialization}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Experience</p>
                  <p className="text-xl font-bold text-gray-800 flex items-center"><FaAward className="text-teal-500 mr-2"/> {getMockExperience(selectedDoctor.id)} Years</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Patient Rating</p>
                  <p className="text-xl font-bold text-gray-800 flex items-center"><FaStar className="text-yellow-400 mr-2"/> {getMockRating(selectedDoctor.id)} / 5.0</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="bg-white p-2 rounded-lg text-blue-500 shadow-sm mr-4"><FaCalendarAlt /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Schedule</p>
                    <p className="font-medium text-gray-800">{selectedDoctor.available_days}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="bg-white p-2 rounded-lg text-gray-400 shadow-sm mr-4"><FaPhoneAlt /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Phone Number</p>
                    <p className="font-medium text-gray-800">{selectedDoctor.phone}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="bg-white p-2 rounded-lg text-gray-400 shadow-sm mr-4"><FaEnvelope /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Email Address</p>
                    <p className="font-medium text-gray-800">{selectedDoctor.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform scale-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">Register New Doctor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Doctor Name</label>
                <input placeholder="Dr. John Doe" className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Specialization / Department</label>
                <select className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none" required value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})}>
                  <option value="">Select Specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Practice">General Practice</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone Number</label>
                  <input placeholder="+1 234 567 89" type="tel" className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Available Days</label>
                  <input placeholder="Mon-Fri" className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" required value={formData.available_days} onChange={e => setFormData({...formData, available_days: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Address</label>
                <input placeholder="doctor@hospital.com" type="email" className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors w-1/3">Cancel</button>
                <button type="submit" className="bg-teal-600 text-white px-5 py-3 font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-all w-2/3">Save Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm transform scale-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-3xl text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Remove Doctor?</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to permanently remove this doctor from the hospital directory? This action cannot be undone.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-3 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors w-full">Cancel</button>
              <button onClick={confirmDelete} className="bg-red-500 text-white px-5 py-3 font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all w-full">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
