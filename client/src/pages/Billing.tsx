import { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaPlus, FaCheckCircle, FaTimes, FaSearch, FaHistory, FaDownload, FaCreditCard, FaUser } from 'react-icons/fa';

export default function Billing() {
  const [bills, setBills] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    patient_id: '',
    amount: '',
    items: [{ desc: '', price: '' }]
  });

  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    try {
      const [billsRes, patsRes] = await Promise.all([
        fetch('http://localhost:3000/api/bills', { headers }),
        fetch('http://localhost:3000/api/patients', { headers })
      ]);
      const billsData = await billsRes.json();
      const patsData = await patsRes.json();
      setBills(billsData);
      setPatients(patsData);
    } catch (err) {
      console.error(err);
      showToast('Failed to load billing data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { desc: '', price: '' }] });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    (newItems[index] as any)[field] = value;
    
    // Calculate total amount automatically
    const total = newItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
    
    setFormData({ ...formData, items: newItems, amount: total.toString() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          patient_id: formData.patient_id,
          amount: parseFloat(formData.amount),
          items_json: JSON.stringify(formData.items)
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ patient_id: '', amount: '', items: [{ desc: '', price: '' }] });
        fetchData();
        showToast('Bill generated successfully!', 'success');
      } else {
        showToast('Failed to generate bill', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const handlePay = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/bills/${id}/pay`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchData();
        showToast('Payment successful!', 'success');
      }
    } catch (err) {
      showToast('Payment failed', 'error');
    }
  };

  const filteredBills = bills.filter(b => 
    b.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(b.id).includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-2xl transition-all ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center">
            <FaFileInvoiceDollar className="mr-3 text-emerald-600" /> Billing & Invoices
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage patient billing, payments, and financial records.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="mt-4 md:mt-0 flex items-center bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all transform hover:-translate-y-0.5 font-bold">
          <FaPlus className="mr-2" /> Generate New Bill
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600"><FaHistory className="text-2xl" /></div>
          <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p><h3 className="text-2xl font-black text-gray-800">${bills.filter(b => b.paid).reduce((acc, b) => acc + b.amount, 0).toLocaleString()}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-amber-50 rounded-xl text-amber-600"><FaCreditCard className="text-2xl" /></div>
          <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending Payments</p><h3 className="text-2xl font-black text-gray-800">${bills.filter(b => !b.paid).reduce((acc, b) => acc + b.amount, 0).toLocaleString()}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 rounded-xl text-blue-600"><FaFileInvoiceDollar className="text-2xl" /></div>
          <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Bills</p><h3 className="text-2xl font-black text-gray-800">{bills.length}</h3></div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative">
        <FaSearch className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by patient name or bill ID..." 
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bills Table */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-3xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/80 text-xs uppercase tracking-widest text-gray-500 font-bold">
              <tr>
                <th className="p-6">Bill Info</th>
                <th className="p-6">Patient</th>
                <th className="p-6">Amount</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="p-10 bg-gray-50/50"></td></tr>)
              ) : filteredBills.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-medium">No billing records found.</td></tr>
              ) : (
                filteredBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-emerald-50/20 transition-colors group">
                    <td className="p-6">
                      <div className="font-bold text-gray-800">INV-#{String(bill.id).padStart(5, '0')}</div>
                      <div className="text-xs text-gray-500">{new Date(bill.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><FaUser /></div>
                        <span className="font-semibold text-gray-700">{bill.patient_name}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-black text-gray-800">${bill.amount.toLocaleString()}</div>
                    </td>
                    <td className="p-6">
                      {bill.paid ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 flex items-center w-fit">
                          <FaCheckCircle className="mr-1.5" /> Paid
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100 flex items-center w-fit">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></div> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {!bill.paid && (
                        <button 
                          onClick={() => handlePay(bill.id)}
                          className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 mr-2"
                        >
                          Mark as Paid
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-blue-600 p-2 rounded-lg bg-gray-50 hover:bg-blue-50 transition-all">
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-800">Generate Invoice</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><FaTimes /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Select Patient</label>
                <select 
                  className="w-full border border-gray-200 bg-gray-50 p-3 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                  value={formData.patient_id}
                  onChange={e => setFormData({...formData, patient_id: e.target.value})}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-black text-gray-400 uppercase">Billing Items</label>
                  <button type="button" onClick={handleAddItem} className="text-xs font-bold text-emerald-600 hover:underline">+ Add Item</button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex space-x-3">
                      <input 
                        placeholder="Description (e.g. Consultation)" 
                        className="flex-1 border border-gray-200 bg-gray-50 p-3 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                        value={item.desc}
                        onChange={e => handleItemChange(idx, 'desc', e.target.value)}
                      />
                      <input 
                        placeholder="Price" 
                        type="number"
                        className="w-32 border border-gray-200 bg-gray-50 p-3 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                        value={item.price}
                        onChange={e => handleItemChange(idx, 'price', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-600">Total Amount</span>
                <span className="text-3xl font-black text-gray-800">${parseFloat(formData.amount || '0').toLocaleString()}</span>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all">Generate & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
