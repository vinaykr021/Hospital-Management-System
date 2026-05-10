import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ patient_id: '', doctor_id: '', date: '', time: '', status: 'Scheduled', reason: '' });

  const fetchData = async () => {
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
    } catch (err) {
      console.error(err);
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
        <button onClick={() => setShowModal(true)} className="bg-orange-500 text-white px-4 py-2 rounded shadow hover:bg-orange-600 transition-colors">
          + New Appointment
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Schedule Appointment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Select Patient</label>
                <select className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})}>
                  <option value="">-- Select a Patient --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Select Doctor</label>
                <select className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required value={formData.doctor_id} onChange={e => setFormData({...formData, doctor_id: e.target.value})}>
                  <option value="">-- Select a Doctor --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Date</label>
                  <input type="date" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Time</label>
                  <input type="time" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
                <select className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Reason</label>
                <textarea placeholder="Reason for visit..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-orange-500 text-white px-5 py-2 font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm">Save Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden overflow-x-auto w-full">
        <table className="w-full text-left min-w-[700px] whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="p-4 font-semibold">Date & Time</th>
              <th className="p-4 font-semibold">Patient Name</th>
              <th className="p-4 font-semibold">Doctor</th>
              <th className="p-4 font-semibold">Reason</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {appointments.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No appointments scheduled yet.</td></tr>
            ) : (
              appointments.map(a => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">
                    <div className="flex flex-col">
                      <span>{a.date}</span>
                      <span className="text-xs text-gray-500">{a.time}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{a.patient_name || 'Unknown Patient'}</td>
                  <td className="p-4 font-medium text-gray-600">{a.doctor_name || 'Unknown Doctor'}</td>
                  <td className="p-4 text-gray-500">{a.reason}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      a.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                      a.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(a.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                      title="Delete Appointment"
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
    </div>
  );
}
