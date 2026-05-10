import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // NavLink automatically provides isActive property
  const navClasses = ({ isActive }: { isActive: boolean }) => 
    `block py-2.5 px-4 rounded transition duration-200 ${isActive ? 'bg-blue-800 text-white font-semibold' : 'hover:bg-blue-800 hover:text-white'}`;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center z-20 shadow-md">
        <div className="text-xl font-bold truncate">Hospital Admin</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:text-blue-200 focus:outline-none p-1"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl md:shadow-none`}>
        <div className="hidden md:flex p-5 text-xl font-bold border-b border-blue-800 items-center justify-between">
          <span>Hospital Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/" end className={navClasses}>Dashboard</NavLink>
          <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/patients" className={navClasses}>Patients</NavLink>
          <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/doctors" className={navClasses}>Doctors</NavLink>
          <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/appointments" className={navClasses}>Appointments</NavLink>
          <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/wards" className={navClasses}>Bed Management</NavLink>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="w-full bg-red-500 py-2.5 rounded hover:bg-red-600 transition-colors font-semibold shadow">Logout</button>
        </div>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm p-4 md:p-5 z-10 hidden md:block">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 truncate">Hospital Management System</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {/* <Outlet /> is extremely important! It tells React Router exactly WHERE to render the matched child route. */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
