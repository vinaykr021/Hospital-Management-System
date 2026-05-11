import { useState, useEffect } from 'react';
import { FaBed, FaHospital, FaPlus, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface BedFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BedForm({ onSuccess, onCancel }: BedFormProps) {
  const [wards, setWards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ward_id: '',
    bed_number: '',
    status: 'available'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/wards', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setWards(data))
    .catch(() => setError('Failed to load wards'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/beds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add bed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center text-red-700 animate-in slide-in-from-top duration-300">
          <FaExclamationTriangle className="mr-3 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Target Ward</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FaHospital />
            </div>
            <select 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700 appearance-none shadow-inner"
              required
              value={formData.ward_id}
              onChange={e => setFormData({...formData, ward_id: e.target.value})}
            >
              <option value="">Select a Ward</option>
              {wards.map(w => (
                <option key={w.id} value={w.id}>{w.name} - {w.floor}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Bed Designation</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FaBed />
            </div>
            <input 
              type="text" 
              placeholder="e.g., ICU-10, B-204"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700 shadow-inner"
              required
              value={formData.bed_number}
              onChange={e => setFormData({...formData, bed_number: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Initial Status</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({...formData, status: 'available'})}
              className={`py-3 rounded-xl font-bold transition-all border-2 ${formData.status === 'available' ? 'bg-green-50 border-green-500 text-green-700 shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'}`}
            >
              Available
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, status: 'occupied'})}
              className={`py-3 rounded-xl font-bold transition-all border-2 ${formData.status === 'occupied' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'}`}
            >
              Occupied
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4 font-bold text-gray-400 hover:bg-gray-100 rounded-2xl transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <><FaPlus className="mr-2" /> Register Bed</>
          )}
        </button>
      </div>
    </form>
  );
}
