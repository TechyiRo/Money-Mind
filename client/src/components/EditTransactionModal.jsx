import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, Hash, Tag, Type } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function EditTransactionModal({ transaction, onClose, onSuccess }) {
  const { user, language } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
    type: ''
  });
  const [loading, setLoading] = useState(false);

  const labels = {
    en: {
      title: 'Edit Transaction',
      save: 'Save Changes',
      desc: 'Description',
      amount: 'Amount',
      cat: 'Category',
      date: 'Date',
      type: 'Transaction Type',
      income: 'Income',
      expense: 'Expense'
    },
    mr: {
      title: 'व्यवहार सुधारा (Edit)',
      save: 'बदल सेव्ह करा',
      desc: 'माहिती (Description)',
      amount: 'रक्कम (Amount)',
      cat: 'वर्गवारी (Category)',
      date: 'तारीख (Date)',
      type: 'व्यवहार प्रकार',
      income: 'कमाई (Income)',
      expense: 'खर्च (Expense)'
    }
  };

  const t = labels[language] || labels.en;

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || '',
        amount: transaction.amount || '',
        category: transaction.category || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
        type: transaction.type || 'expense'
      });
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/transactions/${transaction._id}`, formData);
      toast.success(language === 'mr' ? 'यशस्वीरित्या अपडेट झाले!' : 'Update Successful!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="premium-card w-full max-w-lg overflow-hidden border-white/10"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
                <Save size={20} />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">{t.title}</h2>
           </div>
           <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-6">
              {/* Type Toggle */}
              <div className="col-span-2 flex bg-black/40 p-1 rounded-xl border border-white/5">
                 <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500'}`}
                 >
                   {t.expense}
                 </button>
                 <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}
                 >
                   {t.income}
                 </button>
              </div>

              {/* Description */}
              <div className="col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Type size={12} /> {t.desc}
                 </label>
                 <input 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all"
                  placeholder="Enter details..."
                 />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={12} /> {t.amount}
                 </label>
                 <input 
                  required
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-amber-500/50 outline-none transition-all"
                  placeholder="0.00"
                 />
              </div>

              {/* Date */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> {t.date}
                 </label>
                 <input 
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all color-scheme-dark"
                 />
              </div>

              {/* Category */}
              <div className="col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={12} /> {t.cat}
                 </label>
                 <select 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all"
                 >
                    {['Food & Drinks', 'Shopping', 'Housing', 'Transportation', 'Vehicle', 'Life & Entertainment', 'Salary', 'Investment', 'Other'].map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                    {(user?.customCategories || []).map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                 </select>
              </div>
           </div>

           <button 
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/10 flex items-center justify-center gap-3 mt-4"
           >
              {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black animate-spin rounded-full" /> : <Save size={18} />}
              {t.save}
           </button>
        </form>
      </motion.div>
    </div>
  );
}
