import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import api from '../utils/api';
import { formatCurrency, extractCategoryDetails } from '../utils/helpers';
import { TrendingUp, TrendingDown, Wallet, Target, Activity, Zap, ShieldCheck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const GOLD_COLORS = ['#f59e0b', '#d97706', '#b45309', '#78350f', '#fcd34d', '#fbbf24'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
};

export default function Dashboard() {
  const { user, language } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State - Default to Current Month
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;

      const [summaryRes, txRes, catRes, trendRes] = await Promise.all([
        api.get('/reports/monthly-summary', { params }),
        api.get('/transactions?limit=6'),
        api.get('/reports/category-breakdown', { params: { ...params, year: selectedYear || new Date().getFullYear() } }),
        api.get('/reports/spending-trend')
      ]);

      setSummary(summaryRes.data);
      setTransactions(txRes.data.transactions);
      setExpenses(catRes.data);
      setTrend(trendRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full"
        />
        <p className="text-amber-500 font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Syncing Vault...</p>
      </div>
    );
  }

  const labels = {
    en: {
      account: 'Account',
      overview: 'Overview',
      subtitle: 'Your financial status is listed below. View your income, expenses, and savings at a glance.',
      greeting: 'नमस्ते',
      wallet: 'Wallet Status',
      secure: 'Secure',
      system: 'System Health',
      active: 'Active',
      allTime: 'All Time',
      allYears: 'All Years',
      inflow: 'Total Income',
      outflow: 'Total Spent',
      balance: 'Total Balance',
      inflowSub: 'Inflow',
      outflowSub: 'Outflow',
      balanceSub: 'Savings'
    },
    mr: {
      account: 'खात्याची',
      overview: 'माहिती (Overview)',
      subtitle: 'तुमची आर्थिक स्थिती खाली दिली आहे. तुमची कमाई, खर्च आणि बचत एका नजरेत पहा.',
      greeting: 'नमस्ते',
      wallet: 'बॅलन्स (Wallet)',
      secure: 'सुरक्षित',
      system: 'सिस्टिम हेल्थ',
      active: 'सुरू आहे',
      allTime: 'आजवरचे (एकूण)',
      allYears: 'सर्व वर्षे',
      inflow: 'महिन्याची कमाई',
      outflow: 'एकूण खर्च',
      balance: 'शिल्लक रक्कम',
      inflowSub: 'कमाई',
      outflowSub: 'खर्च',
      balanceSub: 'बचत'
    }
  };

  const t = labels[language] || labels.en;

  const savingsPercent = summary?.totalIncome > 0 
    ? Math.round((summary.netBalance / summary.totalIncome) * 100) 
    : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 pb-12">
      {/* Top Section: Hero Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
         <motion.div variants={itemVariants} className="lg:col-span-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight shrink-0 mb-4">
              {t.account} <span className="gold-text">{t.overview}.</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">
              {t.greeting}, <span className="text-white font-bold">{user?.name ? user.name.split(' ')[0] : 'User'}</span>. {t.subtitle}
            </p>
         </motion.div>

         <div className="flex flex-col gap-4 items-end">
            {/* Status Badge - Moved Up/Top Right */}
            <motion.div variants={itemVariants} className="premium-card p-1.5 px-3 flex items-center gap-3 border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl max-w-fit">
                <div className="flex items-center gap-2 pr-3 border-r border-white/5">
                  <ShieldCheck className="text-emerald-500" size={10} />
                  <h3 className="text-[9px] font-black text-white uppercase">{t.secure}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <h3 className="text-[9px] font-black text-white uppercase">{t.active}</h3>
                </div>
            </motion.div>

            {/* Filters - Moved to Right Side Position */}
            <motion.div variants={itemVariants} className="bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase text-slate-300 px-3 py-1.5 focus:outline-none cursor-pointer"
                >
                    <option value="" className="bg-black text-white">{t.allTime}</option>
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map((m, i) => (
                      <option key={m} value={m} className="bg-black text-white">
                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                      </option>
                    ))}
                </select>
                <div className="w-[1px] h-4 bg-white/10 inline-block align-middle mx-1" />
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase text-slate-300 px-3 py-1.5 focus:outline-none cursor-pointer"
                >
                    <option value="" className="bg-black text-white">{t.allYears}</option>
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y} className="bg-black text-white">{y}</option>
                    ))}
                </select>
            </motion.div>
         </div>
      </div>

      {/* Main Stats - Simple English + Marathi Hints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="premium-card p-8 bg-gradient-to-br from-emerald-500/20 to-transparent border-emerald-500/10">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500"><TrendingUp size={24}/></div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t.inflowSub}</span>
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.inflow}</p>
           <h2 className="text-3xl font-black text-white tabular-nums">{formatCurrency(summary?.totalIncome, user?.currency)}</h2>
        </motion.div>

        <motion.div variants={itemVariants} className="premium-card p-8 bg-gradient-to-br from-rose-500/20 to-transparent border-rose-500/10">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-500"><TrendingDown size={24}/></div>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{t.outflowSub}</span>
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.outflow}</p>
           <h2 className="text-3xl font-black text-white tabular-nums">{formatCurrency(summary?.totalExpense, user?.currency)}</h2>
        </motion.div>

        <motion.div variants={itemVariants} className="premium-card p-8 bg-gradient-to-br from-amber-500/20 to-transparent border-amber-500/10 font-bold">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500"><Wallet size={24}/></div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{t.balanceSub}</span>
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.balance}</p>
           <h2 className="text-3xl font-black text-white tabular-nums">{formatCurrency(summary?.netBalance, user?.currency)}</h2>
        </motion.div>

        {/* Budget Sync Card */}
        <motion.div variants={itemVariants} className="premium-card p-8 bg-black/40 border-amber-500/20 flex flex-col justify-between">
           <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Budget Limit</p>
              <div className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[9px] font-black text-amber-500 border border-amber-500/20 uppercase">Budget Sync Active</div>
           </div>
           <div>
              <h2 className="text-2xl font-black text-white">{formatCurrency(summary?.totalBudget || 0, user?.currency)}</h2>
              <div className="mt-4 space-y-2">
                 <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Remaining</span>
                    <span className={summary?.remainingBudget < 0 ? 'text-rose-500' : 'text-emerald-500'}>
                      {formatCurrency(summary?.remainingBudget || 0, user?.currency)}
                    </span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (summary?.totalExpense / summary?.totalBudget) * 100) || 0}%` }}
                      className={`h-full ${summary?.totalExpense > summary?.totalBudget ? 'bg-rose-500' : 'bg-amber-500'}`}
                    />
                 </div>
              </div>
           </div>
        </motion.div>
      </div>

      {/* Analytics & Transactions Visuals */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Growth Analytics Card */}
        <motion.div variants={itemVariants} className="xl:col-span-3 premium-card p-10 min-h-[450px] relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={120} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-lg font-black text-white tracking-widest uppercase mb-1">Intelligence Layer</h3>
                  <p className="text-xs text-slate-500">Resource usage over periodic system checks</p>
               </div>
               <div className="flex gap-2">
                  <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-400">30 DAYS</div>
               </div>
            </div>

            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="_id.month" 
                    hide
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', background: '#121212', color: '#fff' }} 
                  />
                  <Area type="monotone" dataKey="totalAmount" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#goldArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Pulse & Allocation Bento */}
        <div className="xl:col-span-2 grid grid-cols-1 gap-8">
           <motion.div variants={itemVariants} className="premium-card p-8 flex-1 border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Allocation Blueprint</h3>
              <div className="space-y-5">
                {expenses.slice(0, 4).map((exp, idx) => {
                  const { name, icon } = extractCategoryDetails(exp._id);
                  const percent = Math.round((exp.totalAmount / summary?.totalExpense) * 100);
                  return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-bold flex items-center gap-2 text-slate-400">
                          <span className="text-lg">{icon}</span> {name}
                       </span>
                       <span className="text-white font-black">{percent}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1.5, delay: 1 }}
                        className="h-full bg-amber-500/50" 
                       />
                    </div>
                  </div>
                )})}
              </div>
           </motion.div>

           <motion.div variants={itemVariants} className="premium-card p-8 flex-1 border-white/5 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Pulses</h3>
                <button className="text-[10px] font-black gold-text uppercase hover:scale-105 transition">View History</button>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 3).map((t, i) => {
                  const { name, icon } = extractCategoryDetails(t.category);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center grayscale hover:grayscale-0 transition cursor-default">
                             {icon}
                          </div>
                          <div>
                             <p className="text-xs font-bold text-white truncate w-24">{t.description || name}</p>
                             <p className="text-[9px] text-slate-500 font-bold uppercase">{name}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-xs font-black ${t.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                             {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount, user?.currency)}
                          </p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase">Authorized</p>
                       </div>
                    </div>
                  )
                })}
              </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

