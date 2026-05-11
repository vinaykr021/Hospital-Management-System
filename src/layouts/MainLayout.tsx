import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import type { User } from '../types';

const MainLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const userJson = localStorage.getItem('user');
  if (!userJson) return <Navigate to="/login" replace />;

  const user: User = JSON.parse(userJson);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        role={user.role} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
      
      <div className="flex-1 lg:ml-[280px] transition-all flex flex-col min-w-0">
        <Topbar 
          title="Hospital Management System" 
          userName={user.name} 
          userRole={user.role} 
          onMenuClick={() => setIsMobileOpen(true)}
        />
        <main className="p-4 md:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
