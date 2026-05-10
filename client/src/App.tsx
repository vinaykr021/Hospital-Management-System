import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Import our newly created Layout and Page components
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';

// A simple login component
function Login({ setToken }: { setToken: (t: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Hospital Staff Login</h2>
        {error && <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input className="w-full px-3 py-2 border rounded" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input type="password" className="w-full px-3 py-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600" type="submit">
            Login
          </button>
        </form>
        <p className="mt-4 text-xs text-gray-500 text-center">Use admin / admin123</p>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <Router>
      <Routes>
        {/* Parent Route for Layout */}
        <Route path="/" element={<DashboardLayout />}>
          {/* Nested Routes - These will be rendered inside the <Outlet /> in DashboardLayout */}
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<Appointments />} />
          
          {/* Catch all unmatched routes and redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}
