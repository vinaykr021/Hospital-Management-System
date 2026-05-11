import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBed, FaProcedures, FaHospitalAlt, FaSignOutAlt, FaFilter, FaLayerGroup, FaCheckCircle, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

export default function Wards() {
  const [beds, setBeds] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    try {
      const [bedsRes, wardsRes] = await Promise.all([
        fetch('http://localhost:3000/api/beds', { headers }),
        fetch('http://localhost:3000/api/wards', { headers })
      ]);
      const bedsData = await bedsRes.json();
      const wardsData = await wardsRes.json();
      setBeds(bedsData);
      setWards(wardsData);
    } catch (err) {
      console.error(err);
      showToast('Failed to load bed data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDischarge = async (bedId: number) => {
    if (!window.confirm('Are you sure you want to discharge this patient and free the bed?')) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/beds/discharge/${bedId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        showToast('Patient discharged successfully!', 'success');
        fetchData();
      } else {
        showToast('Failed to discharge patient', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  // Stats Calculation
  const stats = useMemo(() => {
    const total = beds.length;
    const occupied = beds.filter(b => b.status === 'occupied').length;
    const available = total - occupied;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    
    return { total, occupied, available, occupancyRate };
  }, [beds]);

  // Filtering
  const filteredBeds = useMemo(() => {
    return beds.filter(b => {
      const wardMatch = selectedWard === 'All' || b.ward_name === selectedWard;
      const searchMatch = b.bed_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (b.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return wardMatch && searchMatch;
    });
  }, [beds, selectedWard, searchTerm]);

  const wardNames = ['All', ...wards.map(w => w.name)];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 relative animate-in fade-in duration-500">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-2xl shadow-2xl transition-all transform scale-100 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
          {toast.type === 'success' ? <FaCheckCircle className="mr-3 text-green-500" /> : <FaExclamationTriangle className="mr-3 text-red-500" />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 flex items-center tracking-tight">
            <FaHospitalAlt className="mr-3 text-blue-600" /> Bed Management
          </h2>
          <p className="text-gray-500 font-medium mt-1">Live hospital occupancy and patient bed allocation.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/wards/add')}
            className="bg-white text-blue-600 border border-blue-100 px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all font-bold flex items-center"
          >
            <FaBed className="mr-2" /> Add Bed
          </button>
          <div className="bg-blue-600 px-4 py-2 rounded-2xl text-white shadow-lg shadow-blue-500/30 flex items-center h-[46px]">
             <span className="text-xs font-bold uppercase tracking-wider mr-3">Overall Occupancy</span>
             <span className="text-2xl font-black">{stats.occupancyRate}%</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-gray-50 rounded-2xl text-gray-400"><FaLayerGroup className="text-2xl" /></div>
          <div><p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Beds</p><h3 className="text-2xl font-black text-gray-800">{stats.total}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-green-50 rounded-2xl text-green-500"><FaCheckCircle className="text-2xl" /></div>
          <div><p className="text-xs font-black text-gray-400 uppercase tracking-widest">Available</p><h3 className="text-2xl font-black text-green-600">{stats.available}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-red-50 rounded-2xl text-red-500"><FaProcedures className="text-2xl" /></div>
          <div><p className="text-xs font-black text-gray-400 uppercase tracking-widest">Occupied</p><h3 className="text-2xl font-black text-red-600">{stats.occupied}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-500"><FaBed className="text-2xl" /></div>
          <div><p className="text-xs font-black text-gray-400 uppercase tracking-widest">Emergency</p><h3 className="text-2xl font-black text-blue-600">{Math.max(0, beds.filter(b => b.ward_name === 'Emergency' && b.status === 'available').length)}</h3></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search bed or patient..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {wardNames.map(w => (
            <button
              key={w}
              onClick={() => setSelectedWard(w)}
              className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all flex items-center ${selectedWard === w ? 'bg-gray-900 text-white shadow-xl' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              {w === 'All' ? 'All Units' : w.toLowerCase().includes('ward') ? w : `${w} Ward`}
            </button>
          ))}
        </div>
      </div>

      {/* Bed Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredBeds.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border border-gray-100 text-center">
          <FaBed className="text-5xl text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">No beds matching filters</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filteredBeds.map(bed => (
            <div 
              key={bed.id} 
              className={`group relative p-5 rounded-[2.5rem] border-2 transition-all duration-300 hover:scale-105 ${
                bed.status === 'occupied' 
                ? 'bg-red-50 border-red-100 text-red-900 shadow-red-100 shadow-lg' 
                : 'bg-green-50 border-green-100 text-green-900 hover:shadow-green-100 hover:shadow-lg'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-2xl ${bed.status === 'occupied' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                  {bed.status === 'occupied' ? <FaProcedures /> : <FaBed />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">{bed.ward_name}</span>
              </div>

              {/* Bed Info */}
              <h4 className="text-lg font-black tracking-tighter">{bed.bed_number}</h4>
              <p className={`text-[11px] font-bold mt-1 uppercase tracking-widest ${bed.status === 'occupied' ? 'text-red-400' : 'text-green-400'}`}>
                {bed.status === 'occupied' ? 'Occupied' : 'Ready'}
              </p>

              {/* Patient Info / Actions */}
              <div className="mt-4 pt-4 border-t border-black/5 min-h-[60px] flex flex-col justify-center">
                {bed.status === 'occupied' ? (
                  <>
                    <p className="text-xs font-bold leading-tight truncate">{bed.patient_name}</p>
                    <p className="text-[10px] opacity-60">Patient ID: #{String(bed.patient_id).padStart(4, '0')}</p>
                    <button 
                      onClick={() => handleDischarge(bed.id)}
                      className="absolute inset-0 bg-red-600 text-white rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-sm"
                    >
                      <FaSignOutAlt className="mr-2" /> Discharge
                    </button>
                  </>
                ) : (
                  <p className="text-[10px] opacity-40 font-bold italic">Sanitized &amp; Ready</p>
                )}
              </div>

              {/* Indicator */}
              <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${bed.status === 'occupied' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            </div>
          ))}
        </div>
      )}

      {/* Ward Details Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-xl font-black text-gray-800 mb-6">Ward Distribution</h3>
           <div className="space-y-4">
             {wards.map(ward => {
               const wardBeds = beds.filter(b => b.ward_id === ward.id);
               const occ = wardBeds.filter(b => b.status === 'occupied').length;
               const perc = ward.total_beds > 0 ? (occ / ward.total_beds) * 100 : 0;
               return (
                 <div key={ward.id} className="space-y-2">
                   <div className="flex justify-between text-sm font-bold">
                     <span className="text-gray-700">{ward.name}</span>
                     <span className="text-gray-400">{occ} / {ward.total_beds} Beds</span>
                   </div>
                   <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                     <div className={`h-full transition-all duration-1000 ${perc > 80 ? 'bg-red-500' : perc > 50 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${perc}%` }}></div>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="text-2xl font-black mb-2">Occupancy Alert</h3>
             <p className="text-blue-100 text-sm font-medium mb-6">Emergency ward is currently at {Math.round((beds.filter(b => b.ward_name === 'Emergency' && b.status === 'occupied').length / (beds.filter(b => b.ward_name === 'Emergency').length || 1)) * 100)}% capacity.</p>
             <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Action Recommended</p>
                <p className="text-lg font-bold mt-1">Reserve 2 beds for incoming trauma cases.</p>
             </div>
           </div>
           <FaHospitalAlt className="absolute -bottom-10 -right-10 text-[15rem] opacity-10" />
        </div>
      </div>

    </div>
  );
}
