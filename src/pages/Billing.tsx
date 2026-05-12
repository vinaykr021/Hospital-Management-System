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
  Wallet,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Bill, Patient, Doctor } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Billing: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    service_type: 'Consultation',
    consultation_fee: 50,
    bed_charges: 0,
    medicine_charges: 0,
    other_charges: 0,
    payment_status: 'Pending' as const,
    payment_method: 'Cash' as const
  });

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

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    try {
      const [pData, dData] = await Promise.all([
        apiService.getPatients(),
        apiService.getDoctors()
      ]);
      setPatients(pData);
      setDoctors(dData);
    } catch (err) {
      console.error('Failed to fetch required data');
    }
  };

  const handleGenerateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const total = formData.consultation_fee + formData.bed_charges + formData.medicine_charges + formData.other_charges;
      await apiService.generateBill({ ...formData, total_amount: total });
      await fetchBills();
      setIsModalOpen(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        service_type: 'Consultation',
        consultation_fee: 50,
        bed_charges: 0,
        medicine_charges: 0,
        other_charges: 0,
        payment_status: 'Pending',
        payment_method: 'Cash'
      });
    } catch (err: any) {
      alert(err.message || 'Failed to generate bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBill = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await apiService.deleteBill(id);
      setBills(bills.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete invoice');
    }
  };

  const filteredBills = bills.filter(b => 
    b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(b.id).includes(searchTerm)
  );

  const totalRevenue = bills
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);
  
  const pendingAmount = bills
    .filter(b => b.paymentStatus === 'Pending')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const currentTotal = formData.consultation_fee + formData.bed_charges + formData.medicine_charges + formData.other_charges;

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
        There are currently no billing records. Start by generating your first invoice.
      </p>
      <button onClick={handleOpenModal} className="btn btn-primary px-8 shadow-lg shadow-blue-100">
        <Plus size={18} />
        Generate First Bill
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-main font-outfit">Billing & Invoices</h2>
          <p className="text-text-muted text-xs md:text-sm font-medium">Manage payments and medical financial records</p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary shadow-xl shadow-blue-200 py-3">
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
          {/* Stats Section */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-blue-200" />
                  <p className="text-blue-100 font-medium text-xs uppercase tracking-wider">Total Revenue</p>
                </div>
                <h3 className="text-4xl font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Pending</p>
                    <p className="text-lg font-bold text-orange-300">${pendingAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Bills</p>
                    <p className="text-lg font-bold">{bills.length}</p>
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
                <h4 className="font-bold text-text-main">Payment Overview</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-background rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 size={16} /></div>
                    <span className="text-sm font-bold text-text-main">Paid</span>
                  </div>
                  <span className="text-sm font-bold">{bills.filter(b => b.paymentStatus === 'Paid').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><Clock size={16} /></div>
                    <span className="text-sm font-bold text-text-main">Pending</span>
                  </div>
                  <span className="text-sm font-bold">{bills.filter(b => b.paymentStatus === 'Pending').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="font-bold text-text-main flex items-center gap-2">
                  <Receipt size={20} className="text-primary" />
                  Invoices
                </h3>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by name or ID..." 
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-background">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Invoice</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Patient</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-primary-light/10 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-text-main">#INV-{String(bill.id).padStart(4, '0')}</p>
                          <p className="text-[10px] text-text-muted font-bold">{new Date(bill.billingDate).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-text-main">{bill.patientName}</p>
                          <p className="text-[10px] text-primary font-bold uppercase">{bill.serviceType}</p>
                        </td>
                        <td className="px-6 py-4 font-black text-sm text-text-main">${bill.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 
                            bill.paymentStatus === 'Partial' ? 'bg-blue-100 text-blue-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1">
                          <button className="p-2 text-text-muted hover:text-primary hover:bg-background rounded-lg transition-all">
                            <Download size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBill(bill.id)}
                            className="p-2 text-text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-text-main/20 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: '100%', opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: '100%', opacity: 0 }} 
              className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 max-h-[92vh] flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-white sticky top-0 z-20">
                <div>
                  <h3 className="text-xl font-bold text-text-main">Generate New Invoice</h3>
                  <p className="text-xs text-text-muted font-medium">Create a new billing record for patient services</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleGenerateBill} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Patient</label>
                      <select 
                        className="input-field"
                        required
                        value={formData.patient_id}
                        onChange={e => setFormData({...formData, patient_id: e.target.value})}
                      >
                        <option value="">Select Patient</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.fullName} (ID: {p.id})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Attending Doctor</label>
                      <select 
                        className="input-field"
                        value={formData.doctor_id}
                        onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.fullName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase ml-1">Service Type</label>
                      <select 
                        className="input-field"
                        value={formData.service_type}
                        onChange={e => setFormData({...formData, service_type: e.target.value})}
                      >
                        <option value="Consultation">Consultation</option>
                        <option value="Inpatient Stay">Inpatient Stay</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Diagnostic Tests">Diagnostic Tests</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase ml-1">Payment Status</label>
                        <select 
                          className="input-field"
                          value={formData.payment_status}
                          onChange={e => setFormData({...formData, payment_status: e.target.value as any})}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Partial">Partial</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase ml-1">Payment Method</label>
                        <select 
                          className="input-field"
                          value={formData.payment_method}
                          onChange={e => setFormData({...formData, payment_method: e.target.value as any})}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="Insurance">Insurance</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Charges */}
                  <div className="space-y-4 bg-background/50 p-6 rounded-[2rem] border border-border/50">
                    <h4 className="text-sm font-bold text-text-main flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-primary" />
                      Breakdown of Charges
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-text-muted">Consultation Fee</label>
                        <input 
                          type="number" 
                          className="w-24 text-right bg-transparent font-bold text-sm outline-none border-b border-border focus:border-primary"
                          value={formData.consultation_fee}
                          onChange={e => setFormData({...formData, consultation_fee: Number(e.target.value)})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-text-muted">Bed Charges</label>
                        <input 
                          type="number" 
                          className="w-24 text-right bg-transparent font-bold text-sm outline-none border-b border-border focus:border-primary"
                          value={formData.bed_charges}
                          onChange={e => setFormData({...formData, bed_charges: Number(e.target.value)})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-text-muted">Medicines</label>
                        <input 
                          type="number" 
                          className="w-24 text-right bg-transparent font-bold text-sm outline-none border-b border-border focus:border-primary"
                          value={formData.medicine_charges}
                          onChange={e => setFormData({...formData, medicine_charges: Number(e.target.value)})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-text-muted">Other Charges</label>
                        <input 
                          type="number" 
                          className="w-24 text-right bg-transparent font-bold text-sm outline-none border-b border-border focus:border-primary"
                          value={formData.other_charges}
                          onChange={e => setFormData({...formData, other_charges: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
                      <span className="text-lg font-black text-text-main uppercase tracking-tighter">Total Amount</span>
                      <span className="text-2xl font-black text-primary">${currentTotal.toLocaleString()}</span>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting || !formData.patient_id}
                      className="btn btn-primary w-full py-4 mt-4 shadow-lg shadow-blue-100 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Generating...' : 'Confirm & Generate Invoice'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Billing;

