import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserRound, 
  CalendarCheck, 
  TrendingUp, 
  Clock, 
  Stethoscope
} from 'lucide-react';
import { apiService } from '../services/api';
import type { DashboardStats, Appointment } from '../types';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-4 md:p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4 md:gap-6"
  >
    <div className={`p-3 md:p-4 rounded-2xl ${color} bg-opacity-10 text-current`}>
      <Icon className="w-6 h-6 md:w-7 md:h-7" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs md:text-sm font-medium text-text-muted truncate">{title}</p>
      <h3 className="text-xl md:text-2xl font-bold text-text-main mt-1 truncate">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, appointmentsData] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getAppointments()
        ]);
        setStats(statsData);
        setRecentAppointments(appointmentsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 md:y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Patients" 
          value={stats?.totalPatients?.toLocaleString() ?? '0'} 
          icon={Users} 
          color="bg-blue-500 text-blue-600" 
        />
        <StatCard 
          title="Total Doctors" 
          value={stats?.totalDoctors?.toLocaleString() ?? '0'} 
          icon={UserRound} 
          color="bg-purple-500 text-purple-600" 
        />
        <StatCard 
          title="Today's Appointments" 
          value={stats?.appointmentsToday?.toLocaleString() ?? '0'} 
          icon={CalendarCheck} 
          color="bg-orange-500 text-orange-600" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats?.revenueSummary?.toLocaleString() ?? '0'}`} 
          icon={TrendingUp} 
          color="bg-green-500 text-green-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-text-main">Recent Appointments</h2>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          
          <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-text-muted">Patient</th>
                    <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-text-muted">Doctor</th>
                    <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-text-muted">Time</th>
                    <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-background transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xs">
                            {apt.patientName.charAt(0)}
                          </div>
                          <span className="font-medium text-text-main text-sm md:text-base truncate max-w-[120px] md:max-w-none">
                            {apt.patientName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-text-muted text-xs md:text-sm">{apt.doctorName}</td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2 text-text-muted">
                          <Clock size={14} className="md:w-4 md:h-4" />
                          <span className="text-xs md:text-sm">{apt.time}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`badge ${
                          apt.status === 'CONFIRMED' ? 'badge-primary' : 
                          apt.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'
                        } text-[10px] md:text-xs`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          <h2 className="text-lg md:text-xl font-bold text-text-main">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
            <button className="p-4 bg-white border border-border rounded-2xl flex items-center gap-4 hover:border-primary hover:shadow-md transition-all group text-left">
              <div className="p-3 bg-blue-50 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                <Users size={20} />
              </div>
              <div>
                <p className="font-bold text-text-main text-sm">Add Patient</p>
                <p className="text-[10px] md:text-xs text-text-muted">New registration</p>
              </div>
            </button>
            <button className="p-4 bg-white border border-border rounded-2xl flex items-center gap-4 hover:border-primary hover:shadow-md transition-all group text-left">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <CalendarCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-text-main text-sm">Book Appointment</p>
                <p className="text-[10px] md:text-xs text-text-muted">Schedule visit</p>
              </div>
            </button>
          </div>

          <div className="bg-primary p-6 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Health Tip</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Stay hydrated and maintain regular checkups to prevent chronic conditions.
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 text-white opacity-10">
              <Stethoscope size={100} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
