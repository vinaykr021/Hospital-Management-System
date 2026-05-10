import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaUserMd, FaWheelchair, FaCalendarCheck, FaBed, FaAmbulance, FaPlus, FaFileMedical, FaVial } from 'react-icons/fa';

export default function Dashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    availableBeds: 85,
    totalBeds: 250
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    // Fetch Stats
    fetch('http://localhost:3000/api/stats', { headers })
      .then(res => res.json())
      .then(data => { if (!data.error) setStats(data); })
      .catch(console.error);

    // Fetch Chart Data
    fetch('http://localhost:3000/api/chart-data', { headers })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          const days = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = data.find((row: any) => row.date === dateStr);
            days.push({
              name: d.toLocaleDateString('en-US', { weekday: 'short' }),
              patients: found ? found.count : 0
            });
          }
          setChartData(days);
        }
      })
      .catch(console.error);

    // Fetch Recent Activity
    fetch('http://localhost:3000/api/recent-activity', { headers })
      .then(res => res.json())
      .then(data => { if (!data.error) setActivities(data); })
      .catch(console.error);

    // Fetch Upcoming Appointments (Limit to 5)
    fetch('http://localhost:3000/api/appointments', { headers })
      .then(res => res.json())
      .then(data => { if (!data.error) setUpcoming(data.slice(0, 5)); })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Emergency Alert */}
      <div className="bg-red-50 border-l-4 border-red-500 p-3 md:p-4 rounded shadow-sm flex items-start space-x-3">
        <FaAmbulance className="text-red-500 text-xl md:text-2xl mt-0.5 animate-pulse flex-shrink-0" />
        <div>
          <h3 className="text-red-800 font-bold text-sm md:text-base">Emergency Alert</h3>
          <p className="text-red-600 text-xs md:text-sm mt-1">Incoming trauma patient ETA 5 mins. ER Team 1 standby.</p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-2 md:mb-4">
            <h3 className="text-blue-100 text-xs md:text-sm font-semibold uppercase tracking-wider">Total Patients</h3>
            <FaWheelchair className="text-blue-300 text-xl md:text-2xl opacity-80" />
          </div>
          <p className="text-3xl md:text-4xl font-bold">{stats.patients}</p>
          <p className="text-blue-200 text-xs mt-2">Active in system</p>
        </div>
        
        <div className="bg-gradient-to-br from-teal-600 to-teal-400 p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-2 md:mb-4">
            <h3 className="text-teal-100 text-xs md:text-sm font-semibold uppercase tracking-wider">Available Doctors</h3>
            <FaUserMd className="text-teal-200 text-xl md:text-2xl opacity-80" />
          </div>
          <p className="text-3xl md:text-4xl font-bold">{stats.doctors}</p>
          <p className="text-teal-100 text-xs mt-2">Currently registered</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-400 p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-2 md:mb-4">
            <h3 className="text-orange-100 text-xs md:text-sm font-semibold uppercase tracking-wider">Appointments</h3>
            <FaCalendarCheck className="text-orange-200 text-xl md:text-2xl opacity-80" />
          </div>
          <p className="text-3xl md:text-4xl font-bold">{stats.appointments}</p>
          <p className="text-orange-100 text-xs mt-2">Scheduled sessions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-400 p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-2 md:mb-4">
            <h3 className="text-purple-100 text-xs md:text-sm font-semibold uppercase tracking-wider">Available Beds</h3>
            <FaBed className="text-purple-200 text-xl md:text-2xl opacity-80" />
          </div>
          <p className="text-3xl md:text-4xl font-bold">{stats.availableBeds}</p>
          <p className="text-purple-100 text-xs mt-2">Out of {stats.totalBeds} total capacity</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-3 bg-white p-3 sm:py-3 sm:px-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-500 transition-all text-gray-700">
            <FaPlus className="text-blue-500 text-xl sm:text-base" />
            <span className="font-medium text-xs sm:text-sm text-center">Register Patient</span>
          </button>
          <button className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-3 bg-white p-3 sm:py-3 sm:px-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-500 transition-all text-gray-700">
            <FaCalendarCheck className="text-blue-500 text-xl sm:text-base" />
            <span className="font-medium text-xs sm:text-sm text-center">Book Appointment</span>
          </button>
          <button className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-3 bg-white p-3 sm:py-3 sm:px-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-500 transition-all text-gray-700">
            <FaFileMedical className="text-blue-500 text-xl sm:text-base" />
            <span className="font-medium text-xs sm:text-sm text-center">EHR Search</span>
          </button>
          <button className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-3 bg-white p-3 sm:py-3 sm:px-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-500 transition-all text-gray-700">
            <FaVial className="text-blue-500 text-xl sm:text-base" />
            <span className="font-medium text-xs sm:text-sm text-center">Lab Results</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Chart Area */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 min-w-0">
          <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4">Patient Admissions (Last 7 Days)</h2>
          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="patients" stroke="#1e3a8a" strokeWidth={3} dot={{r: 4, fill: '#1e3a8a'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-bold text-gray-800">Recent Activity</h2>
            <button className="text-blue-600 text-xs md:text-sm hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No recent activity found.</p>
            ) : (
              activities.map((activity, i) => {
                const dateObj = new Date(activity.created_at);
                const timeString = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                return (
                  <div key={i} className="flex items-start space-x-3" style={{wordBreak: 'break-word'}}>
                    <div className={`p-2 rounded-full bg-blue-100 mt-0.5 flex-shrink-0`}>
                      <FaPlus className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium leading-tight">New patient registered: {activity.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{timeString}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h2 className="text-base md:text-lg font-bold text-gray-800">Upcoming Appointments</h2>
          <button className="text-blue-600 text-xs md:text-sm font-medium hover:underline">See Full Schedule</button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[700px] whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 text-xs md:text-sm uppercase">
              <tr>
                <th className="py-3 px-4 md:px-6 font-semibold">Patient Name</th>
                <th className="py-3 px-4 md:px-6 font-semibold">Doctor</th>
                <th className="py-3 px-4 md:px-6 font-semibold">Department</th>
                <th className="py-3 px-4 md:px-6 font-semibold">Time</th>
                <th className="py-3 px-4 md:px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {upcoming.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No upcoming appointments.</td></tr>
              ) : (
                upcoming.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 md:px-6 font-medium">{row.patient_name || 'Unknown Patient'}</td>
                    <td className="py-3 px-4 md:px-6">{row.doctor_name || 'Unknown Doctor'}</td>
                    <td className="py-3 px-4 md:px-6">{row.reason || '-'}</td>
                    <td className="py-3 px-4 md:px-6">{row.date} at {row.time}</td>
                    <td className="py-3 px-4 md:px-6">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                        row.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        row.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
