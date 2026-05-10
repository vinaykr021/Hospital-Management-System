import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', specialization: '', phone: '', email: '', available_days: '' });

  const fetchDoctors = () => {
    fetch('http://localhost:3000/api/doctors', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setDoctors(data))
    .catch(console.error);
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
        setShowModal(false);
        setFormData({ name: '', specialization: '', phone: '', email: '', available_days: '' });
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/doctors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Doctors</h2>
        <button onClick={() => setShowModal(true)} className="bg-teal-500 text-white px-4 py-2 rounded shadow hover:bg-teal-600 transition-colors">
          + Add Doctor
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Add New Doctor</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Doctor Name</label>
                <input placeholder="Dr. John Doe" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Specialization</label>
                <select className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})}>
                  <option value="">Select Specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Practice">General Practice</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone Number</label>
                <input placeholder="+1 234 567 890" type="tel" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email Address</label>
                <input placeholder="doctor@hospital.com" type="email" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Available Days</label>
                <input placeholder="Mon, Wed, Fri" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required value={formData.available_days} onChange={e => setFormData({...formData, available_days: e.target.value})} />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-teal-500 text-white px-5 py-2 font-medium rounded-lg hover:bg-teal-600 transition-colors shadow-sm">Save Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden overflow-x-auto w-full">
        <table className="w-full text-left min-w-[700px] whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Doctor Name</th>
              <th className="p-4 font-semibold">Specialization</th>
              <th className="p-4 font-semibold">Contact Info</th>
              <th className="p-4 font-semibold">Available Days</th>
              <th className="p-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {doctors.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No doctors registered yet.</td></tr>
            ) : (
              doctors.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500 font-medium">#{d.id}</td>
                  <td className="p-4 font-semibold text-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                        {d.name.charAt(0)}
                      </div>
                      <span>{d.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                      {d.specialization}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span>{d.phone}</span>
                      <span className="text-xs text-gray-400">{d.email}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-600">{d.available_days}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(d.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                      title="Delete Doctor"
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
