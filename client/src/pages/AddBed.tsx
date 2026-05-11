import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBed, FaHospitalUser, FaShieldAlt } from 'react-icons/fa';
import BedForm from '../components/BedForm';

export default function AddBed() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/wards')}
        className="group flex items-center text-gray-400 hover:text-blue-600 font-bold transition-all mb-8"
      >
        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 mr-3 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
          <FaArrowLeft />
        </div>
        Back to Bed Management
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white overflow-hidden relative">
            <FaBed className="absolute -right-8 -bottom-8 text-9xl opacity-10 rotate-12" />
            <h2 className="text-2xl font-black mb-4 leading-tight">Expansion Management</h2>
            <p className="text-blue-100 text-sm font-medium leading-relaxed mb-6">
              Registering new beds increases the total capacity of your hospital units.
            </p>
            <div className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">
               <FaShieldAlt className="text-blue-300" />
               <span>Admin Verified</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
             <h4 className="text-sm font-black text-gray-800 uppercase mb-4 tracking-widest flex items-center">
               <FaHospitalUser className="mr-2 text-blue-500" /> Best Practices
             </h4>
             <ul className="space-y-3 text-xs font-bold text-gray-500">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 mr-2 shrink-0"></span>
                  Use unique identifiers for bed numbers.
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 mr-2 shrink-0"></span>
                  Assign to the correct ward for accurate stats.
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 mr-2 shrink-0"></span>
                  Ensure beds are sanitized before marking available.
                </li>
             </ul>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-100 border border-gray-100">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Register New Bed</h1>
              <p className="text-gray-400 font-medium mt-1">Fill in the details to add a new bed record to the system.</p>
            </div>

            <BedForm 
              onSuccess={() => navigate('/wards')} 
              onCancel={() => navigate('/wards')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
