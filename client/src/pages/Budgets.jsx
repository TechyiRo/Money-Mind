import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, extractCategoryDetails } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, Trash2, AlertCircle, PieChart, TrendingDown, Target, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      const [budgetsRes, expensesRes] = await Promise.all([
        api.get('/budgets'),
        api.get(`/reports/category-breakdown?year=${today.getFullYear()}&month=${String(today.getMonth() + 1).padStart(2, '0')}`)
      ]);

      const monthBudgets = budgetsRes.data.filter(b => b.month === monthStr);
      setBudgets(monthBudgets);

      // Normalize expenses mapping to clean names (ignoring emojis) to ensure sync with budgets
      const normalizedExp = {};
      expensesRes.data.forEach(e => {
        const { name } = extractCategoryDetails(e._id);
        const cleanName = name.toLowerCase().trim();
        normalizedExp[cleanName] = (normalizedExp[cleanName] || 0) + e.totalAmount;
      });
      setExpenses(normalizedExp);

    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      const today = new Date();
      const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      await api.post('/budgets', {
        category,
        monthlyLimit: Number(limit),
        month: monthStr
      });
      toast.success('Budget added ✨');
      setShowAdd(false);
      setCategory('');
      setLimit('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Budget removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-6">
       <div className="h-48 bg-slate-200/50 dark:bg-slate-800/50 rounded-[2rem] w-full"></div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="h-40 bg-slate-200/50 dark:bg-slate-800/50 rounded-[2rem] w-full"></div>
         <div className="h-40 bg-slate-200/50 dark:bg-slate-800/50 rounded-[2rem] w-full"></div>
       </div>
    </div>
  );

  const totalLimit = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((acc, b) => {
    const cleanName = extractCategoryDetails(b.category).name.toLowerCase().trim();
    return acc + (expenses[cleanName] || 0);
  }, 0);
  const overallPercentage = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;
  const remainingBudget = Math.max(totalLimit - totalSpent, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent dark:from-sky-400 dark:to-indigo-400">
            Control Center 🎯
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Master your money through tailored budgets.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd(!showAdd)} 
          className="btn-primary shadow-lg shadow-sky-500/20"
        >
          <Plus size={18} /> <span>New Reserve</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            onSubmit={handleAddBudget} 
            className="glass-panel p-6 sm:p-8 rounded-[2rem] flex flex-col sm:flex-row gap-5 items-end overflow-hidden border border-white/50 dark:border-white/10"
          >
            <div className="w-full sm:w-2/5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Assign Category</label>
              <input type="text" required value={category} onChange={e => setCategory(e.target.value)} className="input-field py-3.5 text-base" placeholder="e.g. Shopping 🛍️" autoFocus />
            </div>
            <div className="w-full sm:w-2/5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Monthly Limit (₹)</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                 <input type="number" required value={limit} onChange={e => setLimit(e.target.value)} className="input-field py-3.5 pl-8 text-base font-bold tabular-nums" placeholder="0" />
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl flex-1 sm:flex-none text-center">
              Lock Budget
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Overview Analytics Card */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 md:p-10 shadow-2xl shadow-indigo-900/20 text-white border border-white/10">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <PieChart size={200} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
           <div className="flex-1 w-full">
             <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-[0.2em] mb-2">Total Monthly Allocation</h2>
             <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl md:text-6xl font-black tabular-nums">{formatCurrency(totalSpent, user?.currency)}</span>
                <span className="text-xl text-indigo-200 font-medium">/ {formatCurrency(totalLimit, user?.currency)}</span>
             </div>
             
             {/* Master Progress Bar */}
             <div className="w-full bg-slate-950/50 rounded-full h-4 shadow-inner overflow-hidden border border-white/5 p-0.5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${overallPercentage}%` }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className={`h-full rounded-full transition-all duration-500 shadow-lg ${
                   overallPercentage >= 90 ? 'bg-gradient-to-r from-red-500 to-rose-400 shadow-rose-500/50' : 
                   overallPercentage >= 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-400 shadow-orange-500/50' : 
                   'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-emerald-500/50'
                 }`} 
               />
             </div>
             <p className="text-right mt-3 text-sm font-bold text-indigo-200">
               {Math.round(overallPercentage)}% Burn Rate
             </p>
           </div>
           
           <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto">
             <div className="flex-1 bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400"><Wallet size={24}/></div>
                <div>
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Remaining</p>
                  <p className="text-xl font-bold tabular-nums text-white">{formatCurrency(remainingBudget, user?.currency)}</p>
                </div>
             </div>
           </div>
         </div>
      </motion.div>

      {/* Individual Budgets Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {budgets.length === 0 ? (
          <div className="col-span-full card-surface text-center py-16 text-slate-500 border-dashed border-2 border-slate-200 dark:border-slate-800">
            <Target size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">No active budgets right now.</p>
            <p className="text-sm text-slate-400 mt-1">Set a budget and take control of your financial destiny.</p>
          </div>
        ) : (
          budgets.map(budget => {
            const cleanBudgetName = extractCategoryDetails(budget.category).name.toLowerCase().trim();
            const spent = expenses[cleanBudgetName] || 0;
            const percentage = Math.min((spent / budget.monthlyLimit) * 100, 100);
            const isWarning = percentage >= 80 && percentage < 100;
            const isDanger = percentage >= 100;
            
            const { name: catName, icon: catIcon } = extractCategoryDetails(budget.category);
            
            let barColor = 'from-emerald-400 to-teal-500 shadow-emerald-500/50';
            if (isWarning) barColor = 'from-amber-400 to-orange-500 shadow-amber-500/50';
            if (isDanger) barColor = 'from-rose-500 to-red-600 shadow-rose-500/50';

            return (
              <motion.div variants={itemVariants} key={budget._id} className="card-surface relative group flex flex-col justify-between h-56">
                <button onClick={() => handleDelete(budget._id)} className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-10">
                  <Trash2 size={16} />
                </button>
                
                <div className="flex items-start gap-4 mb-2">
                  <div className={`text-4xl p-3 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-inner flex items-center justify-center shrink-0`}>
                    {catIcon}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{catName}</h3>
                    <p className="text-sm font-semibold text-slate-400 mt-1">
                      {formatCurrency(spent, user?.currency)} <span className="opacity-60 font-medium">/ {formatCurrency(budget.monthlyLimit, user?.currency)}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                   <div className="flex justify-between items-center mb-3">
                     {isDanger ? (
                       <div className="flex items-center gap-1.5 text-rose-500 text-[11px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg">
                         <AlertCircle size={14} /> Exceeded
                       </div>
                     ) : (
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{Math.round(percentage)}% Consumed</span>
                     )}
                     <span className="text-xs font-bold text-slate-800 dark:text-slate-300 tabular-nums">Left: {formatCurrency(Math.max(budget.monthlyLimit - spent, 0), user?.currency)}</span>
                   </div>
                   
                  <div className="w-full bg-slate-100 dark:bg-slate-800/60 rounded-full h-3 shadow-inner overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${percentage}%` }}
                       transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                       className={`h-full rounded-full bg-gradient-to-r shadow-md ${barColor}`} 
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
