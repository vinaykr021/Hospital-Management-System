import React from 'react';
import { Bell, Search, UserCircle, Menu } from 'lucide-react';

interface TopbarProps {
  title: string;
  userName: string;
  userRole: string;
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ title, userName, userRole, onMenuClick }) => {
  return (
    <header className="h-16 md:h-20 bg-white border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-text-muted hover:bg-background rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-text-main line-clamp-1">{title}</h1>
          <p className="text-xs md:text-sm text-text-muted hidden sm:block">Welcome back, {userName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        {/* Search - Hidden on mobile, shown as icon or compact on tablet */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-primary w-40 lg:w-64 text-sm transition-all"
          />
        </div>

        {/* Search Icon for Mobile */}
        <button className="md:hidden p-2 text-text-muted hover:bg-background rounded-lg">
          <Search size={20} />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 text-text-muted hover:bg-background rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-border">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-text-main line-clamp-1">{userName}</p>
              <p className="text-xs text-primary font-medium">{userRole}</p>
            </div>
            <div className="bg-primary-light p-1 rounded-full text-primary flex-shrink-0">
              <UserCircle size={28} className="md:w-8 md:h-8" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
