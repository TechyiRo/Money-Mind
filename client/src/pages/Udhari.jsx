import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Users, HandCoins, ArrowRightLeft, CheckCircle2, ShieldAlert, Plus, History, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Udhari() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('gave');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/udhari');
      setRecords(res.data);
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/udhari', { personName, amount: Number(amount), type, date, note });
      toast.success('Record Authorized');
      setShowAdd(false);
      setPersonName(''); setAmount(''); setType('gave'); setNote('');
      fetchRecords();
    } catch (error) {
      toast.error('Validation failed');
    }
  };

  const handleSettle = async (id) => {
    if (!window.confirm('Authorize full settlement?')) return;
    try {
      await api.patch(`/udhari/${id}/settle`);
      toast.success('Settlement Confirmed');
      fetchRecords();
    } catch (error) {
      toast.error('Process error');
    }
  };

  const totalOwedToMe = records.filter(r => !r.isSettled && r.type === 'gave').reduce((acc, r) => acc + r.amount, 0);
  const totalIOwe = records.filter(r => !r.isSettled && r.type === 'received').reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="h-full flex flex-col space-y-8 overflow-hidden">
      {/* Header & Summaries */}
      <div className="shrink-0 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Users className="text-amber-500" size={24} />
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Credit <span className="gold-text">Registry</span></h1>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] opacity-60">P2P Liaison • Capital Flow Tracking</p>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)} 
            className="group flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-white hover:text-black transition-all"
          >
            <UserPlus size={14} className="group-hover:scale-125 transition-transform" /> New Entry
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="premium-card p-6 border-emerald-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <HandCoins size={80} className="text-emerald-500" />
            </div>
            <div className="relative z-10">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Asset Inflow (Lent)</p>
              <h3 className="text-3xl font-black text-white tabular-nums">{formatCurrency(totalOwedToMe, user?.currency)}</h3>
              <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Awaiting Collection</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="premium-card p-6 border-rose-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <ArrowRightLeft size={80} className="text-rose-500" />
            </div>
            <div className="relative z-10">
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> System Liability (Borrowed)</p>
              <h3 className="text-3xl font-black text-white tabular-nums">{formatCurrency(totalIOwe, user?.currency)}</h3>
              <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Pending Clearance</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <AnimatePresence>
          {showAdd && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="absolute inset-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-xl pt-4"
            >
              <form onSubmit={handleAdd} className="premium-card p-8 border-amber-500/10 space-y-6 max-w-2xl mx-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Initialization Protocol</h3>
                    <button type="button" onClick={() => setShowAdd(false)} className="text-[10px] font-black text-slate-600 uppercase hover:text-white">Cancel</button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Agent Name</label>
                       <input type="text" required value={personName} onChange={e => setPersonName(e.target.value)} className="input-field" placeholder="Target Identity" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Resource Value</label>
                       <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="input-field" placeholder="0.00" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Transaction Vector</label>
                       <select value={type} onChange={e => setType(e.target.value)} className="input-field appearance-none">
                         <option value="gave">Lending Capital</option>
                         <option value="received">Acquiring Liability</option>
                       </select>
                    </div>
                 </div>
                 <div className="flex justify-end pt-4">
                    <button type="submit" className="btn-premium w-full py-4 text-xs">Authorize Entry</button>
                 </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto hide-scrollbar premium-card border-white/5 flex flex-col">
           {/* Section Header */}
           <div className="px-8 py-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center shrink-0">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><History size={14}/> Recent Ledger Pulses</p>
           </div>

           <div className="flex-1 p-4 md:p-6 space-y-3">
             {loading ? (
                <div className="h-40 flex items-center justify-center opacity-20">
                   <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Registry...</p>
                </div>
             ) : records.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                   <Users size={40} className="text-slate-500 mb-4" />
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No social liabilities on record.</p>
                </div>
             ) : (
                records.map(r => (
                  <motion.div 
                    layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={r._id} 
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${r.isSettled ? 'opacity-40 grayscale bg-white/[0.01] border-white/5' : 'bg-white/[0.03] border-white/10 hover:border-amber-500/30'}`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg border ${r.type === 'gave' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                           {r.personName[0].toUpperCase()}
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-white">{r.personName}</h4>
                           <div className="flex items-center gap-3 mt-1">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(r.date).toLocaleDateString()}</span>
                             {r.note && <span className="text-[9px] italic text-slate-600 truncate border-l border-white/10 pl-3 max-w-[120px]">{r.note}</span>}
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-8">
                        <div className="text-right">
                           <p className={`text-base font-black tabular-nums ${r.type === 'gave' ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {formatCurrency(r.amount, user?.currency)}
                           </p>
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{r.isSettled ? 'Settled' : 'Active'}</p>
                        </div>
                        {!r.isSettled && (
                           <button onClick={() => handleSettle(r._id)} className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all">
                              <CheckCircle2 size={18} />
                           </button>
                        )}
                     </div>
                  </motion.div>
                ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

