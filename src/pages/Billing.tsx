import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  CreditCard, 
  Search, 
  Plus,
  ExternalLink,
  Receipt,
  AlertCircle,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Bill } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Billing: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getBills();
      setBills(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch billing records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredBills = bills.filter(b => 
    b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.includes(searchTerm)
  );

  // Dynamic Statistics Calculation
  const totalRevenue = bills
    .filter(b => b.status === 'PAID')
    .reduce((sum, b) => sum + b.amount, 0);
  
  const pendingCount = bills.filter(b => b.status === 'PENDING').length;
  const pendingAmount = bills
    .filter(b => b.status === 'PENDING')
    .reduce((sum, b) => sum + b.amount, 0);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="h-48 bg-white rounded-3xl animate-pulse border border-border" />
        <div className="h-40 bg-white rounded-3xl animate-pulse border border-border" />
      </div>
      <div className="lg:col-span-2 h-[500px] bg-white rounded-3xl animate-pulse border border-border" />
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-[2.5rem] border border-border shadow-sm">
      <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-primary mb-6">
        <Receipt size={40} />
      </div>
      <h3 className="text-xl font-bold text-text-main mb-2">No Invoices Found</h3>
      <p className="text-text-muted text-sm max-w-xs mb-8">
        There are currently no billing records or generated invoices in the system.
      </p>
      <button className="btn btn-primary px-8">
        <Plus size={18} />
        Generate New Bill
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-main font-outfit">Billing & Invoices</h2>
          <p className="text-text-muted text-xs md:text-sm font-medium">Manage payments and medical financial records</p>
        </div>
        <button className="btn btn-primary shadow-xl shadow-blue-200 py-3">
          <Plus size={18} />
          Generate New Bill
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-red-800">Connection Failed</h3>
          <p className="text-red-600 text-sm max-w-sm mx-auto">{error}</p>
          <button onClick={fetchBills} className="btn bg-red-600 text-white hover:bg-red-700 px-6">Retry Connection</button>
        </div>
      ) : bills.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Billing Stats Card */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-blue-200" />
                  <p className="text-blue-100 font-medium text-xs uppercase tracking-wider">Total Revenue</p>
                </div>
                <h3 className="text-4xl font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                
                <div className="mt-8 flex items-center justify-between bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Pending</p>
                    <p className="text-lg font-bold">{pendingCount} Invoices</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Amount</p>
                    <p className="text-lg font-bold text-orange-300">${pendingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 opacity-10">
                <CreditCard size={180} />
              </div>
            </motion.div>

            <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-primary rounded-xl"><Wallet size={20} /></div>
                <h4 className="font-bold text-text-main">Payment Summary</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-text-muted">Collection Rate</span>
                    <span className="text-primary">{bills.length > 0 ? Math.round((bills.filter(b => b.status === 'PAID').length / bills.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${bills.length > 0 ? (bills.filter(b => b.status === 'PAID').length / bills.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-background rounded-2xl border border-border/50">
                    <p className="text-[10px] font-bold text-text-muted uppercase">Avg. Bill</p>
                    <p className="text-sm font-bold text-text-main mt-1">${bills.length > 0 ? Math.round(totalRevenue / bills.length).toLocaleString() : 0}</p>
                  </div>
                  <div className="p-3 bg-background rounded-2xl border border-border/50">
                    <p className="text-[10px] font-bold text-text-muted uppercase">Today</p>
                    <p className="text-sm font-bold text-success mt-1">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Invoices Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-background/30">
                <h3 className="font-bold text-text-main flex items-center gap-2">
                  <Receipt size={20} className="text-primary" />
                  Recent Invoices
                </h3>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search invoice or patient..." 
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-background">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Invoice</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Services</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-primary-light/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-light rounded-xl text-primary flex items-center justify-center font-bold text-xs">INV</div>
                            <div>
                              <p className="font-bold text-sm text-text-main">#{String(bill.id).padStart(4, '0')}</p>
                              <p className="text-[10px] text-text-muted font-bold uppercase">{bill.patientName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-text-muted truncate max-w-[150px]">
                            {bill.services.join(', ')}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-black text-sm text-text-main">${bill.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`badge ${bill.status === 'PAID' ? 'badge-success' : 'badge-warning'} text-[10px] font-black`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-text-muted hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm">
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-border bg-background/50 text-center">
                <button className="text-xs font-bold text-primary flex items-center justify-center gap-2 mx-auto hover:underline uppercase tracking-widest">
                  View Full Transaction History <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
