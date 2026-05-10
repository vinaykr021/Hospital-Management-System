import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '', gender: '', phone: '', address: '', blood_group: '' });

  const fetchPatients = () => {
    fetch('http://localhost:3000/api/patients', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setPatients(data))
    .catch(console.error);
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
        setShowModal(false);
        setFormData({ name: '', age: '', gender: '', phone: '', address: '', blood_group: '' });
        fetchPatients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/patients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchPatients();
      }
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Patients</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">+ Add Patient</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New Patient</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Name" className="w-full border p-2 rounded" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input placeholder="Age" type="number" className="w-full border p-2 rounded" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              <select className="w-full border p-2 rounded" required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input placeholder="Phone" className="w-full border p-2 rounded" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input placeholder="Address" className="w-full border p-2 rounded" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <input placeholder="Blood Group (e.g. O+)" className="w-full border p-2 rounded" required value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} />
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded overflow-hidden overflow-x-auto w-full">
        <table className="w-full text-left min-w-[600px] whitespace-nowrap">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">ID</th>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Age / Gender</th>
              <th className="p-4 font-semibold text-gray-600">Phone</th>
              <th className="p-4 font-semibold text-gray-600">Blood Group</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No patients found.</td></tr>
            ) : (
              patients.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{p.id}</td>
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4">{p.age} / {p.gender}</td>
                  <td className="p-4">{p.phone}</td>
                  <td className="p-4">{p.blood_group}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
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
    </div>
  );
}
