import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  CalendarDays, 
  FileText, 
  LogOut, 
  Menu,
  X,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isMobileOpen, setIsMobileOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname, setIsMobileOpen]);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { name: 'Patients', icon: Users, path: '/patients', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { name: 'Doctors', icon: UserRound, path: '/doctors', roles: ['ADMIN', 'RECEPTIONIST'] },
    { name: 'Appointments', icon: CalendarDays, path: '/appointments', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { name: 'Billing', icon: FileText, path: '/billing', roles: ['ADMIN', 'RECEPTIONIST'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sidebarVariants = {
    open: { x: 0, width: 280 },
    closed: { x: '-100%' },
    desktop: { x: 0, width: isCollapsed ? 80 : 280 }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-text-main/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isMobileOpen ? 'open' : (window.innerWidth >= 1024 ? 'desktop' : 'closed')}
        variants={sidebarVariants}
        className={`
          fixed left-0 top-0 h-screen bg-white border-r border-border z-50 flex flex-col transition-all
          ${isMobileOpen ? 'shadow-2xl' : ''}
        `}
      >
        {/* Brand */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Stethoscope size={24} />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-bold text-xl text-primary font-outfit">MedFlow</span>
            )}
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-text-muted hover:bg-background rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all group
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-blue-200' 
                  : 'text-text-muted hover:bg-background hover:text-primary'}
              `}
            >
              <item.icon size={20} className={!isCollapsed || isMobileOpen ? '' : 'mx-auto'} />
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 text-text-muted hover:bg-red-50 hover:text-danger rounded-xl transition-all"
          >
            <LogOut size={20} className={!isCollapsed || isMobileOpen ? '' : 'mx-auto'} />
            {(!isCollapsed || isMobileOpen) && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
