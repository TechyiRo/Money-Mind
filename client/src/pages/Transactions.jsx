import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, extractCategoryDetails } from '../utils/helpers';
import { Search, Filter, Download, Trash2, TrendingUp, TrendingDown, Calendar, ArrowRight, Layers, CreditCard, FileText, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import StatementImportModal from '../components/StatementImportModal';
import EditTransactionModal from '../components/EditTransactionModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
};

export default function Transactions() {
  const { user, updateProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ income: 0, expense: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingTx, setEditingTx] = useState(null);
  
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month, custom
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, type, category, sort, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions', {
        params: { page, limit: 12, search, type, category, sort, startDate, endDate }
      });
      setTransactions(res.data.transactions);
      setTotalPages(res.data.pages);
      setStats(res.data.stats || { income: 0, expense: 0 });
      setSelectedIds(new Set());
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const setFilterMode = (mode) => {
    setTimeFilter(mode);
    const now = new Date();
    if (mode === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (mode === 'month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(first);
      setEndDate(last);
    } else if (mode === 'week') {
      const curr = new Date();
      const first = curr.getDate() - curr.getDay();
      const last = first + 6;
      const firstDay = new Date(curr.setDate(first)).toISOString().split('T')[0];
      const lastDay = new Date(curr.setDate(last)).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    }
    setPage(1);
  };

  const handleMonthChange = (month) => {
    const year = new Date(startDate || new Date()).getFullYear();
    const first = new Date(year, parseInt(month) - 1, 1).toISOString().split('T')[0];
    const last = new Date(year, parseInt(month), 0).toISOString().split('T')[0];
    setStartDate(first);
    setEndDate(last);
  };

  const handleYearChange = (year) => {
    const month = new Date(startDate || new Date()).getMonth();
    const first = new Date(parseInt(year), month, 1).toISOString().split('T')[0];
    const last = new Date(parseInt(year), month + 1, 0).toISOString().split('T')[0];
    setStartDate(first);
    setEndDate(last);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Erase this record from vault?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t._id !== id));
      toast.success('Record purged');
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Purge ${selectedIds.size} records?`)) return;
    try {
      await api.delete('/transactions/bulk', { data: { ids: Array.from(selectedIds) } });
      toast.success('Bulk purge successful');
      fetchTransactions();
    } catch (error) {
      toast.error('Bulk purge failed');
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(transactions.map(t => t._id)));
    else setSelectedIds(new Set());
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      {/* Financial Pulse Console (Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden p-6 rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 backdrop-blur-3xl"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <TrendingDown size={80} className="text-rose-500" />
             </div>
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase text-rose-500/60 tracking-[0.3em] mb-2">Outflow Magnitude</p>
                <div className="flex items-end gap-2 text-3xl font-black text-white">
                   <span className="text-rose-500 text-xl">₹</span>
                   {stats.expense.toLocaleString()}
                </div>
                <div className="mt-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Debit Assessment Active</p>
                </div>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="group relative overflow-hidden p-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 backdrop-blur-3xl"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <TrendingUp size={80} className="text-emerald-500" />
             </div>
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase text-emerald-500/60 tracking-[0.3em] mb-2">Inflow Velocity</p>
                <div className="flex items-end gap-2 text-3xl font-black text-white">
                   <span className="text-emerald-500 text-xl">₹</span>
                   {stats.income.toLocaleString()}
                </div>
                <div className="mt-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Credit Liquidity Sync</p>
                </div>
             </div>
          </motion.div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-2 lg:px-0">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <Layers className="text-amber-500" size={24} />
             <h1 className="text-2xl font-black text-white uppercase tracking-tight">Financial <span className="gold-text">Ledger</span></h1>
           </div>
           
           <div className="flex items-center gap-1.5 mt-2 overflow-x-auto hide-scrollbar pb-1">
              {[
                { id: 'all', label: 'All Stats' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'Month View' },
                { id: 'custom', label: 'Custom Audit' }
              ].map(mode => (
                <button 
                  key={mode.id}
                  onClick={() => setFilterMode(mode.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${timeFilter === mode.id ? 'bg-amber-500 text-[#0a0a0a] shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-500 hover:text-white border border-white/5'}`}
                >
                  {mode.label}
                </button>
              ))}
           </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           {timeFilter === 'month' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-2 py-1">
                <select 
                  value={startDate ? new Date(startDate).getMonth() + 1 : ''}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase text-amber-500 outline-none px-2 cursor-pointer"
                >
                   {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                     <option key={m} value={i + 1} className="bg-slate-900">{m}</option>
                   ))}
                </select>
                <div className="w-[1px] h-3 bg-white/10" />
                <select 
                  value={startDate ? new Date(startDate).getFullYear() : ''}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase text-amber-500 outline-none px-2 cursor-pointer"
                >
                   {[2024, 2025, 2026].map(y => (
                     <option key={y} value={y} className="bg-slate-900">{y}</option>
                   ))}
                </select>
             </motion.div>
           )}

           {timeFilter === 'custom' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-1.5">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none text-[10px] font-black text-amber-500 outline-none w-28 uppercase color-scheme-dark" />
                <ArrowRight size={12} className="text-slate-600" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none text-[10px] font-black text-amber-500 outline-none w-28 uppercase color-scheme-dark" />
             </motion.div>
           )}

           {selectedIds.size > 0 && (
             <motion.button 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               onClick={handleBulkDelete}
               className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase px-4 py-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 shrink-0"
             >
               <Trash2 size={14} /> Purge Block ({selectedIds.size})
             </motion.button>
           )}
           <div className="relative flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
             <input 
               type="text" placeholder="Filter memory..." 
               value={search} onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-white/5 border border-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-700"
             />
           </div>
           <button 
             onClick={() => setIsImportModalOpen(true)}
             className="group relative h-10 px-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2 overflow-hidden shadow-lg shadow-amber-500/10 shrink-0"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
             <FileText size={16} strokeWidth={2.5} />
             <span className="hidden sm:inline">Statement Intel</span>
           </button>
           <button 
             onClick={() => setShowFilters(!showFilters)}
             className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-amber-500 border-amber-500 text-black' : 'bg-white/5 border-white/5 text-slate-400'}`}
           >
             <Filter size={18} />
           </button>
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden shrink-0"
          >
             <div className="premium-card p-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-amber-500/10">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-600 uppercase ml-2 mb-1 tracking-widest">Filter by Type</p>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-500/50">
                      <option value="">All Transactions</option>
                      <option value="income">Income (कमाई)</option>
                      <option value="expense">Expense (खर्च)</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-600 uppercase ml-2 mb-1 tracking-widest">Category (वर्ग)</p>
                    <select value={category} onChange={(e) => {setCategory(e.target.value); setPage(1);}} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-500/50">
                      <option value="">Full Audit Spectrum</option>
                      {[
                        'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Salary', 'Investment', 'Other',
                        ...(user.customCategories || [])
                      ].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-600 uppercase ml-2 mb-1 tracking-widest">Sequence Order</p>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-500/50">
                      <option value="date_desc">CHRONO: NEWEST</option>
                      <option value="date_asc">CHRONO: OLDEST</option>
                      <option value="amount_desc">MAGNITUDE: HIGH</option>
                      <option value="amount_asc">MAGNITUDE: LOW</option>
                    </select>
                 </div>
                 <div className="space-y-1 flex flex-col justify-end">
                    <button 
                      onClick={() => {
                        const newCat = prompt('Build New Segment Memory:');
                        if (newCat && newCat.trim()) {
                          const final = newCat.trim();
                          if (!(user.customCategories || []).includes(final)) {
                            updateProfile({ customCategories: [...(user.customCategories || []), final] });
                          }
                        }
                      }}
                      className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase py-2.5 rounded-xl hover:bg-amber-500 hover:text-black transition-all"
                    >
                      + Create New Category
                    </button>
                 </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Content - Scrollable */}
      <div className="flex-1 overflow-hidden premium-card flex flex-col border-white/5">
         {/* Custom Table Header */}
         <div className="hidden md:flex items-center px-8 py-4 bg-white/[0.02] border-b border-white/5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] shrink-0">
            <div className="w-10 flex justify-center"><input type="checkbox" onChange={toggleSelectAll} checked={transactions.length > 0 && selectedIds.size === transactions.length} className="w-4 h-4 rounded border-white/10 bg-black/20 text-amber-500 focus:ring-amber-500/50" /></div>
            <div className="flex-1 pl-4">Description (माहिती)</div>
            <div className="w-48">Category (वर्गवारी)</div>
            <div className="w-48 text-right pr-12">Amount (रक्कम)</div>
            <div className="w-16"></div>
         </div>

         <div className="flex-1 overflow-y-auto hide-scrollbar px-2 md:px-4 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-20">
                 <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent animate-spin rounded-full" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Loading details... (माहिती शोधत आहे)</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                 <Layers size={40} className="text-slate-500 mb-4" />
                 <p className="text-xs font-black uppercase tracking-widest">No Transactions Found (व्यवहार शिल्लक नाहीत)</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
                 {transactions.map(t => {
                   const { name, icon } = extractCategoryDetails(t.category);
                   return (
                     <motion.div 
                       variants={itemVariants} key={t._id}
                       className={`group flex flex-col md:flex-row items-center p-4 md:p-3 rounded-2xl transition-all border ${selectedIds.has(t._id) ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/[0.03] hover:bg-white/[0.05] hover:border-white/10'}`}
                     >
                        <div className="hidden md:flex w-10 justify-center"><input type="checkbox" checked={selectedIds.has(t._id)} onChange={() => toggleSelect(t._id)} className="w-4 h-4 rounded border-white/10 bg-black/20 text-amber-500 focus:ring-amber-500/50" /></div>
                        
                        <div className="flex-1 flex items-center gap-4 w-full md:pl-4 min-w-0">
                           <div className={`w-12 h-12 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xl md:text-lg border shrink-0 ${t.type === 'expense' ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
                              {icon}
                           </div>
                           <div className="flex-1 truncate min-w-0">
                              <h3 className="text-sm font-bold text-white truncate" title={t.description || name}>{t.description || name}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                 <div className="md:hidden flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold text-slate-400"> {name}</div>
                              </div>
                           </div>
                        </div>

                        <div className="hidden md:block w-48 shrink-0">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 px-3 py-1.5 rounded-[10px] border border-white/5">{name}</span>
                        </div>

                        <div className="w-full md:w-48 text-right md:pr-12 md:shrink-0 mt-4 md:mt-0 flex md:block justify-between items-center px-4 md:px-0">
                           <span className="md:hidden text-[10px] font-black text-slate-600 uppercase tracking-widest">Magnitude</span>
                           <span className={`text-base md:text-sm font-black tabular-nums ${t.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                             {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount, user?.currency)}
                           </span>
                        </div>

                        <div className="hidden md:flex w-24 items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => setEditingTx(t)} className="p-2 text-slate-600 hover:text-amber-500 transition-colors"><Edit2 size={16} /></button>
                           <button onClick={() => handleDelete(t._id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                     </motion.div>
                   )
                 })}
              </motion.div>
            )}
         </div>

         {/* Pagination Bar - Fixed to bottom of card */}
         {totalPages > 1 && (
           <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between bg-black/20 shrink-0">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Section {page} / {totalPages}</span>
              <div className="flex gap-2">
                 <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-4 py-1.5 rounded-lg border border-white/5 text-[10px] font-black uppercase text-slate-400 disabled:opacity-30 hover:bg-white/5 transition-colors">Prev</button>
                 <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-4 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-[10px] font-black uppercase text-amber-500 disabled:opacity-30 hover:bg-amber-500 hover:text-black transition-all">Next Segment</button>
              </div>
           </div>
         )}
      </div>

      <AnimatePresence>
        {editingTx && (
          <EditTransactionModal 
            transaction={editingTx} 
            onClose={() => setEditingTx(null)} 
            onSuccess={() => {
              setEditingTx(null);
              fetchTransactions();
            }}
          />
        )}
      </AnimatePresence>

      {isImportModalOpen && (
        <StatementImportModal 
          onClose={() => setIsImportModalOpen(false)} 
          onSuccess={fetchTransactions} 
        />
      )}
    </div>
  );
}

