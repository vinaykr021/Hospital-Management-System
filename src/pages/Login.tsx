import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Lock, Mail, ChevronRight } from 'lucide-react';
import type { UserRole } from '../types';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockUser = {
        id: 'u1',
        name: 'Admin User',
        email: email,
        role: 'ADMIN'
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] md:w-[40%] md:h-[40%] bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] md:w-[40%] md:h-[40%] bg-blue-600 opacity-20 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="p-6 md:p-10">
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="bg-primary-light p-3 md:p-4 rounded-2xl text-primary shadow-inner">
                <Stethoscope size={40} className="md:w-12 md:h-12" />
              </div>
            </div>

            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-text-main font-outfit">Welcome to MedFlow</h2>
              <p className="text-text-muted mt-2 text-sm">Manage hospital operations seamlessly</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 md:y-6">
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-bold text-text-muted uppercase block">Login as</label>
                <div className="flex justify-center">
                  <div className="w-full py-2 md:py-3 px-4 text-[10px] md:text-xs font-bold rounded-xl transition-all border bg-primary text-white border-primary shadow-lg shadow-blue-100 text-center">
                    ADMINISTRATOR
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-4 bg-background border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-50 transition-all text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-4 bg-background border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-50 transition-all text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 md:py-4.5 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-4 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-4 md:p-6 bg-background border-t border-border text-center">
            <p className="text-xs md:text-sm text-text-muted">
              Forgot password? <a href="#" className="text-primary font-bold hover:underline">Reset it</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
