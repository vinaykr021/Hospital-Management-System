import { useState, useEffect, useMemo } from 'react';
import { FaTrash, FaSearch, FaFilter, FaCalendarPlus, FaCalendarCheck, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaTimes, FaCalendarDay, FaUserMd, FaUser, FaBell, FaCalendarAlt } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [apptToDelete, setApptToDelete] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({ patient_id: '', doctor_id: '', date: '', time: '', status: 'Scheduled', reason: '' });
  
  // Toast
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    
    try {
      const [apptsRes, patsRes, docsRes] = await Promise.all([
        fetch('http://localhost:3000/api/appointments', { headers }),
        fetch('http://localhost:3000/api/patients', { headers }),
        fetch('http://localhost:3000/api/doctors', { headers })
      ]);
      
      const appts = await apptsRes.json();
      const pats = await patsRes.json();
      const docs = await docsRes.json();
      
      if (!appts.error) setAppointments(appts);
      if (!pats.error) setPatients(pats);
      if (!docs.error) setDoctors(docs);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      showToast('Failed to load data', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ patient_id: '', doctor_id: '', date: '', time: '', status: 'Scheduled', reason: '' });
        fetchData();
        showToast('Appointment scheduled successfully!', 'success');
      } else {
        showToast('Failed to schedule appointment', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error', 'error');
    }
  };

  const confirmDelete = async () => {
    if (apptToDelete === null) return;
    try {
      const res = await fetch(`http://localhost:3000/api/appointments/${apptToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchData();
        showToast('Appointment deleted', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete', 'error');
    } finally {
      setShowDeleteModal(false);
      setApptToDelete(null);
    }
  };

  // Derived State
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const searchMatch = (a.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.doctor_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === '' || a.status === statusFilter;
      
      // Check if selected calendar date matches
      const apptDateStr = new Date(a.date).toDateString();
      const selectedDateStr = selectedDate.toDateString();
      const dateMatch = apptDateStr === selectedDateStr;

      return searchMatch && statusMatch && dateMatch;
    });
  }, [appointments, searchTerm, statusFilter, selectedDate]);

  // Stats
  const scheduledCount = appointments.filter(a => a.status === 'Scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

  // Chart Data
  const chartData = [
    { name: 'Scheduled', value: scheduledCount, color: '#3b82f6' }, // Blue
    { name: 'Completed', value: completedCount, color: '#10b981' }, // Green
    { name: 'Cancelled', value: cancelledCount, color: '#ef4444' }  // Red
  ].filter(d => d.value > 0);

  // Status Color Helper
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 pb-12 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-2xl transition-all duration-300 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
          {toast.type === 'success' ? <FaCheckCircle className="mr-3 text-green-500 text-xl" /> : <FaExclamationTriangle className="mr-3 text-red-500 text-xl" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Appointments Center</h2>
          <p className="text-gray-500 text-sm mt-1">Manage hospital bookings, schedules, and patient visits.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="mt-4 md:mt-0 flex items-center bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5 font-semibold">
          <FaCalendarPlus className="mr-2" /> Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Main Content */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
              <div><p className="text-sm text-gray-500 font-medium">Scheduled</p><h3 className="text-2xl font-bold text-gray-800">{scheduledCount}</h3></div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-500 group-hover:scale-110 transition-transform"><FaClock className="text-2xl" /></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-colors">
              <div><p className="text-sm text-gray-500 font-medium">Completed</p><h3 className="text-2xl font-bold text-gray-800">{completedCount}</h3></div>
              <div className="p-3 bg-green-50 rounded-xl text-green-500 group-hover:scale-110 transition-transform"><FaCheckCircle className="text-2xl" /></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-red-200 transition-colors">
              <div><p className="text-sm text-gray-500 font-medium">Cancelled</p><h3 className="text-2xl font-bold text-gray-800">{cancelledCount}</h3></div>
              <div className="p-3 bg-red-50 rounded-xl text-red-500 group-hover:scale-110 transition-transform"><FaTimesCircle className="text-2xl" /></div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search patient or doctor..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full sm:w-48">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none text-gray-600"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Appointments List / Cards */}
          <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 min-h-[500px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-4">
              <FaCalendarDay className="text-indigo-500 mr-2" /> 
              Appointments on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>

            {isLoading ? (
               <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                 ))}
               </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <FaCalendarCheck className="text-4xl text-indigo-300" />
                </div>
                <h4 className="text-xl font-bold text-gray-700">No appointments for this day</h4>
                <p className="text-gray-500 mt-2">Select another date from the calendar or book a new appointment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map(a => (
                  <div key={a.id} className="group border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all bg-white relative overflow-hidden flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    {/* Color Left Border Indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${a.status === 'Completed' ? 'bg-green-500' : a.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    
                    <div className="flex items-center space-x-4 pl-2 w-full sm:w-auto">
                      <div className="bg-indigo-50 text-indigo-600 font-bold px-3 py-2 rounded-lg text-center min-w-[80px]">
                        <p className="text-sm">{a.time}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 flex items-center"><FaUser className="text-gray-400 mr-2 text-xs" /> {a.patient_name || 'Unknown Patient'}</h4>
                        <p className="text-sm text-gray-500 flex items-center mt-1"><FaUserMd className="text-indigo-400 mr-2 text-xs" /> {a.doctor_name || 'Unknown Doctor'}</p>
                      </div>
                    </div>

                    <div className="flex-1 px-4 hidden md:block">
                      <p className="text-sm text-gray-500 italic truncate max-w-xs">"{a.reason}"</p>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto space-x-4 pl-2 sm:pl-0 border-t sm:border-0 pt-3 sm:pt-0 border-gray-100">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(a.status)}`}>
                        {a.status}
                      </span>
                      <button 
                        onClick={() => { setApptToDelete(a.id); setShowDeleteModal(true); }}
                        className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete Appointment"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sidebar Analytics & Calendar */}
        <div className="space-y-6">
          
          {/* Calendar Widget */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><FaCalendarAlt className="text-indigo-500 mr-2"/> Select Date</h3>
             {/* Styling overrides for react-calendar to make it look tailwind-native */}
             <style>{`
               .react-calendar { width: 100%; border: none; font-family: inherit; }
               .react-calendar__navigation button { border-radius: 0.5rem; font-weight: bold; }
               .react-calendar__tile { border-radius: 0.5rem; padding: 0.75rem 0.5rem; font-weight: 500; }
               .react-calendar__tile--active { background: #4f46e5 !important; color: white; border-radius: 0.5rem; }
               .react-calendar__tile--now { background: #e0e7ff; color: #4f46e5; border-radius: 0.5rem; }
               .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background: #f3f4f6; border-radius: 0.5rem; color: #111827; }
             `}</style>
             <Calendar 
               onChange={(val) => setSelectedDate(val as Date)} 
               value={selectedDate}
               className="rounded-xl"
             />
          </div>

          {/* Analytics Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Status Analytics</h3>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No data available
              </div>
            )}
          </div>

          {/* Notifications / Alerts Panel */}
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center"><FaBell className="mr-2 text-indigo-200" /> Notifications</h3>
            <div className="space-y-3">
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                <p className="text-sm font-semibold">Dr. Smith available</p>
                <p className="text-xs text-indigo-100">Cardiology slots are open for today.</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                <p className="text-sm font-semibold">System Update</p>
                <p className="text-xs text-indigo-100">Maintenance scheduled at 2 AM.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">Schedule Appointment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">Select Patient</label>
                  <select className="w-full border border-indigo-200 bg-white p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})}>
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">Select Doctor</label>
                  <select className="w-full border border-indigo-200 bg-white p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required value={formData.doctor_id} onChange={e => setFormData({...formData, doctor_id: e.target.value})}>
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Date</label>
                  <input type="date" className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Time</label>
                  <input type="time" className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Status</label>
                  <select className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Reason for Visit</label>
                  <input placeholder="e.g. Checkup, Fever..." type="text" className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center">
                  <FaCalendarCheck className="mr-2" /> Book Now
                </button>
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">Cancel Appointment?</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to permanently delete this appointment from the schedule?</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-3 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors w-full">Go Back</button>
              <button onClick={confirmDelete} className="bg-red-500 text-white px-5 py-3 font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all w-full">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
