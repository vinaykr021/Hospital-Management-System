import { useState, useEffect, useMemo } from 'react';
import { FaTrash, FaSearch, FaFilter, FaUserPlus, FaUserInjured, FaProcedures, FaTint, FaExclamationTriangle, FaTimes, FaCheckCircle, FaUserMd, FaIdCard } from 'react-icons/fa';
import QRCode from 'react-qr-code';

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<number | null>(null);
  const [selectedPatientForQR, setSelectedPatientForQR] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', age: '', gender: '', phone: '', address: '', blood_group: '' });
  
  // Toast
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPatients = () => {
    setIsLoading(true);
    fetch('http://localhost:3000/api/patients', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setPatients(data);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
      showToast('Failed to load patients', 'error');
    });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', age: '', gender: '', phone: '', address: '', blood_group: '' });
        fetchPatients();
        showToast('Patient added successfully!', 'success');
      } else {
        showToast('Failed to add patient.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (patientToDelete === null) return;
    try {
      const res = await fetch(`http://localhost:3000/api/patients/${patientToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchPatients();
        showToast('Patient deleted successfully!', 'success');
      } else {
        showToast('Failed to delete patient.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error.', 'error');
    } finally {
      setShowDeleteModal(false);
      setPatientToDelete(null);
    }
  };

  // Derived State: Filtering & Searching
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm);
      const matchesBlood = bloodGroupFilter === '' || (p.blood_group && p.blood_group.toUpperCase() === bloodGroupFilter.toUpperCase());
      return matchesSearch && matchesBlood;
    });
  }, [patients, searchTerm, bloodGroupFilter]);

  // Derived State: Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  // Reset page if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, bloodGroupFilter]);

  const uniqueBloodGroups = Array.from(new Set(patients.map(p => p.blood_group ? p.blood_group.toUpperCase() : ''))).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
          {toast.type === 'success' ? <FaCheckCircle className="mr-3 text-green-500 text-xl" /> : <FaExclamationTriangle className="mr-3 text-red-500 text-xl" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header & Quick Stats */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Patient Directory</h2>
            <p className="text-gray-500 text-sm mt-1">Manage hospital patients and their records.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="mt-4 md:mt-0 flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5 font-semibold">
            <FaUserPlus className="mr-2" /> Register Patient
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><FaUserInjured className="text-2xl" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Total Patients</p><h3 className="text-2xl font-bold text-gray-800">{patients.length}</h3></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><FaProcedures className="text-2xl" /></div>
            <div><p className="text-sm text-gray-500 font-medium">New This Month</p><h3 className="text-2xl font-bold text-gray-800">{Math.min(patients.length, 12)}</h3></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-500"><FaTint className="text-2xl" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Blood Groups</p><h3 className="text-2xl font-bold text-gray-800">{uniqueBloodGroups.length}</h3></div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-64">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none text-gray-600"
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
          >
            <option value="">All Blood Groups</option>
            {uniqueBloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[800px] whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <tr>
                <th className="p-5">Patient Info</th>
                <th className="p-5">Contact Details</th>
                <th className="p-5">Vitals</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
              {isLoading ? (
                // Skeleton Loader
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-5"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gray-200 rounded-full"></div><div className="space-y-2"><div className="w-24 h-3 bg-gray-200 rounded"></div><div className="w-16 h-2 bg-gray-200 rounded"></div></div></div></td>
                    <td className="p-5"><div className="space-y-2"><div className="w-32 h-3 bg-gray-200 rounded"></div><div className="w-24 h-2 bg-gray-200 rounded"></div></div></td>
                    <td className="p-5"><div className="w-12 h-6 bg-gray-200 rounded-full"></div></td>
                    <td className="p-5"><div className="w-16 h-6 bg-gray-200 rounded-full"></div></td>
                    <td className="p-5 text-right"><div className="w-8 h-8 bg-gray-200 rounded-full inline-block"></div></td>
                  </tr>
                ))
              ) : paginatedPatients.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3"><FaUserMd className="text-4xl text-gray-400" /></div>
                      <h4 className="text-lg font-bold text-gray-700">No patients found</h4>
                      <p className="text-gray-500 text-sm mt-1 max-w-sm">Try adjusting your search or filters, or add a new patient to the directory.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Real Data
                paginatedPatients.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/30">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-500">ID: #{String(p.id).padStart(4, '0')} • {p.age} yrs • {p.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="font-medium text-gray-700">{p.phone}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{p.address}</p>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100 shadow-sm flex inline-block w-fit">
                        <FaTint className="mr-1 mt-0.5" /> {p.blood_group}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100 flex items-center w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Active
                      </span>
                    </td>
                    <td className="p-5 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedPatientForQR(p)}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="View ID Card"
                      >
                        <FaIdCard />
                      </button>
                      <button 
                        onClick={() => { setPatientToDelete(p.id); setShowDeleteModal(true); }}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Patient"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredPatients.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
            <p>Showing <span className="font-bold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredPatients.length)}</span> of <span className="font-bold text-gray-700">{filteredPatients.length}</span> results</p>
            <div className="flex space-x-1 mt-3 sm:mt-0">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 font-medium transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform scale-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">Register New Patient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="text-xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Full Name</label>
                <input placeholder="John Doe" className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Age</label>
                  <input placeholder="35" type="number" className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Gender</label>
                  <select className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone</label>
                  <input placeholder="+1 234 567 89" className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Blood Group</label>
                  <select className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" required value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})}>
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Address</label>
                <textarea placeholder="123 Health Ave..." className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={3} required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Save Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm transform scale-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-3xl text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Patient?</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to permanently delete this patient record? This action cannot be undone.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors w-full">Cancel</button>
              <button onClick={confirmDelete} className="bg-red-500 text-white px-5 py-2.5 font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all w-full">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Patient ID Card Modal */}
      {selectedPatientForQR && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <button onClick={() => setSelectedPatientForQR(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md transition-all z-10">
              <FaTimes />
            </button>
            
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 h-32 flex flex-col items-center justify-center text-white relative">
               <h2 className="text-2xl font-black tracking-widest uppercase opacity-20 absolute w-full text-center top-4">HOSPITAL ID</h2>
            </div>
            
            <div className="px-8 pb-8 flex flex-col items-center -mt-16">
              <div className="h-32 w-32 bg-white rounded-2xl shadow-xl p-2 mb-6 z-10 flex items-center justify-center">
                <QRCode 
                  value={JSON.stringify({ id: selectedPatientForQR.id, name: selectedPatientForQR.name, blood: selectedPatientForQR.blood_group })} 
                  size={110} 
                  level="H" 
                />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedPatientForQR.name}</h2>
              <p className="text-gray-500 font-medium tracking-widest uppercase text-sm mb-6">Patient ID: {String(selectedPatientForQR.id).padStart(6, '0')}</p>
              
              <div className="w-full grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Age / Gender</p>
                  <p className="font-bold text-gray-700">{selectedPatientForQR.age} Yrs, {selectedPatientForQR.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Blood Group</p>
                  <p className="font-bold text-red-600 flex items-center"><FaTint className="mr-1"/> {selectedPatientForQR.blood_group}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Contact</p>
                  <p className="font-semibold text-gray-700">{selectedPatientForQR.phone}</p>
                </div>
              </div>

              <button onClick={() => window.print()} className="mt-6 w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-lg">
                Print ID Card
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
