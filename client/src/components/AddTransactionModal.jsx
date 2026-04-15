import { useState, useEffect } from 'react';
import { X, ArrowRight, Tag, Zap, Sparkles } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { parseSMS } from '../utils/txParser';

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: '🍔', gradient: 'from-orange-400 to-rose-400' },
  { name: 'Transport', icon: '🚗', gradient: 'from-blue-400 to-indigo-500' },
  { name: 'Shopping', icon: '🛍️', gradient: 'from-pink-400 to-purple-500' },
  { name: 'Entertainment', icon: '🎬', gradient: 'from-purple-500 to-indigo-500' },
  { name: 'Health', icon: '⚕️', gradient: 'from-emerald-400 to-teal-500' },
  { name: 'Bills', icon: '📄', gradient: 'from-red-400 to-rose-500' },
  { name: 'Home Rent', icon: '🏠', gradient: 'from-amber-500 to-orange-500' },
  { name: 'Petrol', icon: '⛽', gradient: 'from-slate-600 to-slate-800' },
  { name: 'EMI', icon: '🏦', gradient: 'from-indigo-500 to-purple-600' },
  { name: 'Mutual Funds', icon: '📈', gradient: 'from-emerald-400 to-green-600' },
  { name: 'Salary', icon: '💰', gradient: 'from-emerald-400 to-teal-600', incomeOnly: true },
  { name: 'Other', icon: '📦', gradient: 'from-slate-400 to-slate-500' }
];

export default function AddTransactionModal({ onClose, onSuccess }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  // Smart Mode State
  const [isSmartMode, setIsSmartMode] = useState(false);
  const [smsText, setSmsText] = useState('');
  
  // State for Custom Category Engine
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('📦');

  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);

  // Fetch active budgets to populate the grid dynamically
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await api.get('/budgets');
        const today = new Date();
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        setBudgets(res.data.filter(b => b.month === monthStr));
      } catch (e) {
        console.error("Failed to fetch budgets for modal.");
      }
    };
    fetchBudgets();
  }, []);

  const handleSmsInput = (text) => {
    setSmsText(text);
    const parsed = parseSMS(text);
    if (parsed && parsed.amount) {
      setAmount(parsed.amount);
      setType(parsed.type);
      setDate(parsed.date);
      setDescription(parsed.description);
      toast.success('Data Decrypted! 🔮', { id: 'sms-parse' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalCategory = category;
    if (isCustomMode) {
      if (!customCategoryName.trim()) return toast.error('Please name your custom category.');
      if (!customEmoji.trim()) return toast.error('Drop an emoji in there!');
      finalCategory = `${customEmoji} ${customCategoryName.trim()}`;
    } else {
      if (!finalCategory) return toast.error('Please select a category');
    }

    try {
      setLoading(true);
      await api.post('/transactions', {
        type,
        amount: Number(amount),
        category: finalCategory,
        date,
        description
      });
      toast.success('Money Moved! ✨');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to log transaction');
    } finally {
      setLoading(false);
    }
  };

  // Merge default categories with User's Budget Categories so they are visually linked!
  const budgetCatNames = new Set(budgets.map(b => b.category));
  const mergedCategories = [...DEFAULT_CATEGORIES];
  
  budgets.forEach(b => {
    if (!DEFAULT_CATEGORIES.some(dc => dc.name === b.category)) {
      // If a budget has a custom category like "🍔 Food", let's extract the emoji
      const match = b.category.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/);
      let icon = '🎯';
      let name = b.category;
      if (match) {
        icon = match[0];
        name = b.category.replace(icon, '').trim();
      }
      mergedCategories.push({
         name: name,
         icon: icon,
         gradient: 'from-violet-400 to-fuchsia-500', // distinct dynamic gradient
         rawName: b.category
      });
    }
  });

  const filteredCategories = mergedCategories.filter(c => type === 'income' ? c.incomeOnly || c.name === 'Other' : !c.incomeOnly);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xl"
      >
        <motion.div 
          initial={{ y: "100%", scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-3xl w-full sm:w-[500px] sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/50 dark:border-slate-700/50"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <div>
               <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">Add Log</h2>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct to Ledger</p>
            </div>
            <button onClick={onClose} className="p-3 rounded-full bg-slate-100 hover:scale-110 active:scale-90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto p-6 pb-safe hide-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Smart Sync vs Manual Toggle */}
              <div className="flex p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl relative shadow-inner">
                <motion.div 
                  className="absolute inset-y-1.5 rounded-xl bg-white dark:bg-slate-700 shadow-md border border-slate-200/50 dark:border-slate-600/50"
                  initial={false}
                  animate={{ 
                    x: isSmartMode ? 'calc(100% - 4px)' : '4px',
                    width: 'calc(50% - 4px)'
                  }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
                
                <button
                  type="button"
                  onClick={() => setIsSmartMode(false)}
                  className={`relative z-10 flex-1 py-3.5 text-sm font-bold rounded-xl transition-colors ${!isSmartMode ? 'text-amber-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setIsSmartMode(true)}
                  className={`relative z-10 flex-1 py-3.5 text-sm font-bold rounded-xl transition-colors ${isSmartMode ? 'text-amber-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Smart Sync ⚡
                </button>
              </div>

              {isSmartMode && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">AI Logic Core</span>
                  </div>
                  <textarea 
                    value={smsText}
                    onChange={(e) => handleSmsInput(e.target.value)}
                    placeholder="Paste PhonePe / GPay / Bank SMS here..."
                    className="w-full bg-white/40 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all min-h-[80px]"
                  />
                  <p className="text-[9px] text-slate-400 mt-2 italic">Automatically extracts Amount, Merchant, and Date.</p>
                </motion.div>
              )}

              {/* Type Toggle Slider (Income/Expense) */}
              <div className="flex p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl relative shadow-inner">
                <motion.div 
                  className="absolute inset-y-1.5 rounded-xl bg-white dark:bg-slate-700 shadow-md border border-slate-200/50 dark:border-slate-600/50"
                  initial={false}
                  animate={{ 
                    x: type === 'expense' ? '4px' : 'calc(100% - 4px)',
                    width: 'calc(50% - 4px)'
                  }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
                
                <button
                  type="button"
                  onClick={() => { setType('expense'); setCategory(''); setIsCustomMode(false); }}
                  className={`relative z-10 flex-1 py-3.5 text-sm font-bold rounded-xl transition-colors ${type === 'expense' ? 'text-rose-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Expense Log 📉
                </button>
                <button
                  type="button"
                  onClick={() => { setType('income'); setCategory(''); setIsCustomMode(false); }}
                  className={`relative z-10 flex-1 py-3.5 text-sm font-bold rounded-xl transition-colors ${type === 'income' ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Income Log ✨
                </button>
              </div>

              {/* Amount input */}
              <div className="text-center bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Magnitude</label>
                <div className="flex items-center justify-center text-5xl font-black gap-2 text-slate-800 dark:text-white">
                  <span className={`opacity-40 transition-colors ${type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>₹</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full max-w-[200px] bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 caret-accent text-center focus:scale-110 transition-transform"
                    placeholder="0"
                    inputMode="numeric"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Categories Bento */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Assign Category</label>
                  <button 
                    type="button" 
                    onClick={() => setIsCustomMode(!isCustomMode)}
                    className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg hover:bg-accent/20 transition-colors"
                  >
                    {isCustomMode ? 'Use Grid' : '➕ Custom'}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {isCustomMode ? (
                    <motion.div 
                      key="custom"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-3"
                    >
                      <div className="w-16">
                        <input 
                          type="text" 
                          value={customEmoji}
                          onChange={(e) => setCustomEmoji(e.target.value)}
                          className="input-field py-4 text-2xl text-center shadow-inner"
                          maxLength="2"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                          placeholder="e.g. Freelance Client..."
                          className="input-field py-4 pl-10 text-sm font-bold shadow-inner"
                          required={isCustomMode}
                        />
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-4 gap-3">
                      {filteredCategories.map((cat, idx) => {
                        const targetName = cat.rawName || cat.name;
                        const isSelected = category === targetName;
                        return (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setCategory(targetName)}
                            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-[1.2rem] border-2 transition-all duration-300 ${
                              isSelected 
                                ? `border-transparent bg-gradient-to-br ${cat.gradient} shadow-lg text-white shadow-${cat.gradient.split('-')[1]}-500/30 scale-105`
                                : 'border-slate-200/50 dark:border-slate-700/50 bg-white/20 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-300 text-slate-600'
                            }`}
                          >
                            <span className="text-3xl mb-1.5 drop-shadow-md">{cat.icon}</span>
                            <span className="text-[10px] font-bold whitespace-nowrap truncate w-full text-center">{cat.name}</span>
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Temporal Marker</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field py-3 text-sm font-bold bg-white/60 dark:bg-slate-900/60 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Ledger Note</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field py-3 text-sm font-medium bg-white/60 dark:bg-slate-900/60 shadow-sm"
                    placeholder="Optional description..."
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-white font-black shadow-2xl transition-all flex items-center justify-center gap-2 mt-4 hover:shadow-lg ${
                  type === 'expense' ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/30 ring-4 ring-rose-500/20' : 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-emerald-500/30 ring-4 ring-emerald-500/20'
                }`}
              >
                {loading ? 'Encrypting Matrix...' : (
                   <>
                     {type === 'expense' ? 'Lock Expense Route' : 'Secure Income Influx'}
                     <ArrowRight size={20} strokeWidth={3} />
                   </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
