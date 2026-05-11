import { useState, useEffect } from 'react';
import { FaBed, FaProcedures, FaBroom, FaTools, FaCheckCircle, FaHospitalAlt } from 'react-icons/fa';

export default function Wards() {
  const [wards, setWards] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [wardsRes, admissionsRes] = await Promise.all([
        fetch('http://localhost:3000/api/wards', { headers }),
        fetch('http://localhost:3000/api/admissions', { headers })
      ]);
      
      const wardsData = await wardsRes.json();
      const admissionsData = await admissionsRes.json();
      
      setWards(wardsData);
      setAdmissions(admissionsData);
    } catch (err) {
      console.error('Failed to fetch ward data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    total: wards.reduce((acc, w) => acc + w.total_beds, 0),
    occupied: wards.reduce((acc, w) => acc + w.occupied_beds, 0),
    available: wards.reduce((acc, w) => acc + (w.total_beds - w.occupied_beds), 0),
  };

  const filteredWards = filter === 'All' ? wards : wards.filter(w => w.name === filter);
  const wardsList = ['All', ...wards.map(w => w.name)];

  const getStatusStyle = (isOccupied: boolean) => {
    return isOccupied 
      ? 'bg-red-100 text-red-700 border-red-300' 
      : 'bg-green-100 text-green-700 border-green-300';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center">
          <FaHospitalAlt className="mr-3 text-indigo-600" /> Bed Management
        </h2>
        <p className="text-gray-500 text-sm mt-1">Live overview of hospital wards and bed availability.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 text-sm font-bold uppercase mb-1">Total Beds</p>
          <h3 className="text-3xl font-black text-gray-800">{stats.total}</h3>
        </div>
        <div className="bg-green-50 p-5 rounded-2xl shadow-sm border border-green-100 flex flex-col items-center justify-center text-center">
          <p className="text-green-600 text-sm font-bold uppercase mb-1">Available</p>
          <h3 className="text-3xl font-black text-green-700">{stats.available}</h3>
        </div>
        <div className="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center justify-center text-center">
          <p className="text-red-600 text-sm font-bold uppercase mb-1">Occupied</p>
          <h3 className="text-3xl font-black text-red-700">{stats.occupied}</h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {wardsList.map(w => (
          <button
            key={w}
            onClick={() => setFilter(w)}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${filter === w ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >
            {w === 'All' ? 'All Wards' : `${w} Ward`}
          </button>
        ))}
      </div>

      {/* Wards Display */}
      <div className="space-y-8">
        {filteredWards.map(ward => {
          const wardAdmissions = admissions.filter(a => a.ward_id === ward.id);
          const beds = [];
          for (let i = 1; i <= ward.total_beds; i++) {
            const admission = wardAdmissions.find(a => a.bed_no === i);
            beds.push({
              number: `${ward.name.charAt(0)}-${i.toString().padStart(2, '0')}`,
              bed_no: i,
              isOccupied: !!admission,
              patientName: admission ? admission.patient_name : null
            });
          }

          return (
            <div key={ward.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{ward.name} Ward</h3>
                  <p className="text-sm text-gray-500">{ward.floor} • {ward.occupied_beds}/{ward.total_beds} Beds Occupied</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-xs font-bold text-gray-400 uppercase">Live Status</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {beds.map((bed, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 ${getStatusStyle(bed.isOccupied)}`}>
                    <div className="text-2xl mb-2 bg-white/50 p-2 rounded-full backdrop-blur-sm">
                      {bed.isOccupied ? <FaProcedures className="text-red-500" /> : <FaBed className="text-green-500" />}
                    </div>
                    <h4 className="font-bold text-sm">{bed.number}</h4>
                    <p className="text-xs mt-2 font-medium bg-white/40 px-2 py-1 rounded-md w-full truncate">
                      {bed.patientName || 'Available'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

