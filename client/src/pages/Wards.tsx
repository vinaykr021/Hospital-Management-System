import { useState } from 'react';
import { FaBed, FaProcedures, FaBroom, FaTools, FaCheckCircle, FaHospitalAlt, FaTint } from 'react-icons/fa';

// Mock Data for Beds
const generateBeds = () => {
  const wards = ['ICU', 'General', 'Pediatrics', 'Maternity'];
  const beds = [];
  let id = 1;
  for (const ward of wards) {
    const numBeds = ward === 'ICU' ? 8 : 12;
    for (let i = 1; i <= numBeds; i++) {
      let status = 'Available';
      const rand = Math.random();
      if (rand > 0.7) status = 'Occupied';
      else if (rand > 0.9) status = 'Cleaning';
      else if (rand > 0.95) status = 'Maintenance';

      beds.push({
        id: id++,
        number: `${ward.charAt(0)}-${i.toString().padStart(2, '0')}`,
        ward,
        status,
        patientName: status === 'Occupied' ? `Patient #${Math.floor(Math.random() * 1000)}` : null
      });
    }
  }
  return beds;
};

export default function Wards() {
  const [beds, setBeds] = useState(generateBeds());
  const [filter, setFilter] = useState('All');

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'Available').length,
    occupied: beds.filter(b => b.status === 'Occupied').length,
    cleaning: beds.filter(b => b.status === 'Cleaning' || b.status === 'Maintenance').length
  };

  const filteredBeds = filter === 'All' ? beds : beds.filter(b => b.ward === filter);
  const wardsList = ['All', ...Array.from(new Set(beds.map(b => b.ward)))];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Available': return 'bg-green-100 text-green-700 border-green-300';
      case 'Occupied': return 'bg-red-100 text-red-700 border-red-300';
      case 'Cleaning': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Maintenance': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Available': return <FaCheckCircle className="text-green-500" />;
      case 'Occupied': return <FaProcedures className="text-red-500" />;
      case 'Cleaning': return <FaBroom className="text-blue-500" />;
      case 'Maintenance': return <FaTools className="text-orange-500" />;
      default: return <FaBed />;
    }
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="bg-blue-50 p-5 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center justify-center text-center">
          <p className="text-blue-600 text-sm font-bold uppercase mb-1">In Prep / Maint</p>
          <h3 className="text-3xl font-black text-blue-700">{stats.cleaning}</h3>
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

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBeds.map(bed => (
          <div key={bed.id} className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 cursor-pointer ${getStatusStyle(bed.status)}`}>
            <div className="text-3xl mb-2 bg-white/50 p-3 rounded-full backdrop-blur-sm">
              {getStatusIcon(bed.status)}
            </div>
            <h4 className="font-bold text-lg">{bed.number}</h4>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{bed.ward}</p>
            <p className="text-xs mt-2 font-medium bg-white/40 px-2 py-1 rounded-md w-full truncate">
              {bed.patientName || bed.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
