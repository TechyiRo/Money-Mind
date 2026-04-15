import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell, PieChart, Pie } from 'recharts';
import api from '../utils/api';
import { formatCurrency, extractCategoryDetails } from '../utils/helpers';
import { FileText, Download, TrendingUp, TrendingDown, Activity, Info, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'];

export default function Reports() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [loading, setLoading] = useState(true);

  // Filter State - Default to All Time
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;

      const [summaryRes, weekRes, catRes, trendRes] = await Promise.all([
        api.get('/reports/monthly-summary', { params }),
        api.get('/reports/weekly-analysis'),
        api.get('/reports/category-breakdown', { params: { ...params, year: selectedYear || new Date().getFullYear() } }),
        api.get('/reports/spending-trend')
      ]);

      setSummary(summaryRes.data);
      
      // Process weekly data for chart
      const processedWeekly = [];
      const weeks = [...new Set(weekRes.data.map(d => d._id.week))];
      weeks.forEach(w => {
        processedWeekly.push({
          week: `Week ${w}`,
          income: weekRes.data.find(d => d._id.week === w && d._id.type === 'income')?.total || 0,
          expense: weekRes.data.find(d => d._id.week === w && d._id.type === 'expense')?.total || 0,
        });
      });
      setWeeklyData(processedWeekly);
      setExpenses(catRes.data);

      // Process monthly trend (Savings vs Expense)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trendMap = {};
      
      trendRes.data.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        if (!trendMap[key]) {
          trendMap[key] = { month: `${monthNames[item._id.month-1]} ${item._id.year}`, income: 0, expense: 0 };
        }
        if (item._id.type === 'income') trendMap[key].income = item.totalAmount;
        if (item._id.type === 'expense') trendMap[key].expense = item.totalAmount;
      });

      const processedTrend = Object.values(trendMap).map(m => ({
        ...m,
        savings: m.income - m.expense,
        ratio: m.income > 0 ? Math.round(((m.income - m.expense) / m.income) * 100) : 0
      })).reverse(); // Newest first

      setMonthlyTrend(processedTrend);

    } catch (error) {
      console.error("Analytics fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(24);
    doc.text('FINANCIAL INTELLIGENCE REPORT', 20, 30);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`User Index: ${user.name}`, 20, 40);
    doc.text(`Generated At: ${new Date().toLocaleString()}`, 20, 45);
    
    doc.setDrawColor(245, 158, 11);
    doc.line(20, 50, 190, 50);

    // Summary Section
    doc.setFontSize(16);
    doc.text('MONTHLY PULSE SUMMARY', 20, 70);
    doc.setFontSize(12);
    doc.text(`Total Resource Inflow (Credit): ${formatCurrency(summary.totalIncome, user.currency)}`, 25, 85);
    doc.text(`Total System Outflow (Debit): ${formatCurrency(summary.totalExpense, user.currency)}`, 25, 95);
    doc.text(`Net Matrix Balance: ${formatCurrency(summary.netBalance, user.currency)}`, 25, 105);

    // Categories
    doc.setFontSize(16);
    doc.text('SECTOR ALLOCATION (EXPENSES)', 20, 130);
    let y = 145;
    expenses.forEach(exp => {
      doc.setFontSize(12);
      doc.text(`${exp._id}: ${formatCurrency(exp.totalAmount, user.currency)}`, 25, y);
      y += 10;
    });

    doc.save(`${user.name}_Vault_Report.pdf`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 animate-pulse">Running Pulse Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Activity className="text-amber-500" /> Financial <span className="gold-text">Intelligence</span>
            </h1>
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                   <select 
                     value={selectedMonth} 
                     onChange={(e) => setSelectedMonth(e.target.value)}
                     className="bg-transparent text-[10px] font-black uppercase text-slate-300 px-3 py-1.5 focus:outline-none cursor-pointer"
                   >
                      <option value="" className="bg-black text-white">All Time (एकूण)</option>
                      {['01','02','03','04','05','06','07','08','09','10','11','12'].map((m, i) => (
                        <option key={m} value={m} className="bg-black text-white">
                          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                        </option>
                      ))}
                   </select>
                   <div className="w-[1px] h-4 bg-white/10" />
                   <select 
                     value={selectedYear} 
                     onChange={(e) => setSelectedYear(e.target.value)}
                     className="bg-transparent text-[10px] font-black uppercase text-slate-300 px-3 py-1.5 focus:outline-none cursor-pointer"
                   >
                      <option value="" className="bg-black text-white">All Years</option>
                      {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y} className="bg-black text-white">{y}</option>
                      ))}
                   </select>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-60 italic">Intelligence Audit: Deep-Dive Analysis</p>
        </div>
        <button 
          onClick={handleExportPDF} 
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-amber-500 font-bold text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2"
        >
          <Download size={16} strokeWidth={3} /> Export Vault Records
        </button>
      </div>

      {/* Hero Metrics - Credit/Debit Focus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Inflow (Credit)', value: summary.totalIncome, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
          { label: 'Total Outflow (Debit)', value: summary.totalExpense, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/10' },
          { label: 'Net Balance', value: summary.netBalance, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
        ].map((stat, idx) => (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className={`premium-card p-6 border ${stat.border} ${stat.bg} flex items-center justify-between`}
          >
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <h3 className={`text-2xl font-black tabular-nums text-white`}>{formatCurrency(stat.value, user?.currency)}</h3>
            </div>
            <stat.icon className={stat.color} size={24} />
          </motion.div>
        ))}
      </div>

      {/* Main Analysis Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Trend */}
        <div className="premium-card p-8 min-h-[400px]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Weekly Inflow vs Outflow</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', fontSize: '10px', fontWeight: 900 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingTop: '20px' }} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Credit" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Debit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Allocation */}
        <div className="premium-card p-8 flex flex-col">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Segment Allocation</h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-8">
            <div className="h-[200px] w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenses}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="totalAmount"
                    nameKey="_id"
                  >
                    {expenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', fontSize: '10px', fontWeight: 900 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-3">
               {expenses.map((exp, idx) => {
                 const { name, icon } = extractCategoryDetails(exp._id);
                 return (
                   <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{icon}</span>
                        <span className="font-bold text-slate-400">{name}</span>
                      </div>
                      <span className="font-black text-white">{formatCurrency(exp.totalAmount, user.currency)}</span>
                   </div>
                 )
               })}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Insight Section */}
      <div className="premium-card p-6 border-amber-500/20 bg-amber-500/5">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="p-4 rounded-full bg-amber-500/10 text-amber-500">
              <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Regarding PDF Statements</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium italic">
              Bank PDFs are strictly encoded. To sync your PDF data, simply select the transaction text in your PDF reader, copy it, and paste it into the <strong>"Smart Sync⚡"</strong> tool.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Performance Matrix */}
      <div className="premium-card p-8">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
           <div className="flex items-center gap-3">
              <Activity className="text-amber-500" size={18} />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Monthly Performance Mastery</h3>
           </div>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Deep Audit: Last 12 Periods</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="py-4 px-2">Month Audit</th>
                <th className="py-4 px-2">Income Cache</th>
                <th className="py-4 px-2">System Outflow</th>
                <th className="py-4 px-2">Net Liquidity (Savings)</th>
                <th className="py-4 px-2 text-right">Efficiency Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {monthlyTrend.map((row, idx) => (
                <tr key={idx} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="py-5 px-2 text-xs font-black text-slate-300">{row.month}</td>
                  <td className="py-5 px-2 text-xs font-bold text-emerald-500 tabular-nums">+{formatCurrency(row.income, user.currency)}</td>
                  <td className="py-5 px-2 text-xs font-bold text-rose-500 tabular-nums">-{formatCurrency(row.expense, user.currency)}</td>
                  <td className={`py-5 px-2 text-xs font-black tabular-nums ${row.savings >= 0 ? 'text-amber-500' : 'text-rose-600'}`}>
                    {formatCurrency(row.savings, user.currency)}
                  </td>
                  <td className="py-5 px-2 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${row.ratio >= 20 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {row.ratio}% ALPHA
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="premium-card p-6 bg-amber-500/5 border-amber-500/10">
        <div className="flex gap-4">
          <div className="shrink-0">
            <Info className="text-amber-500" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 leading-none">Intelligence Protocol Note:</p>
            <p className="text-xs text-slate-500 mt-1 font-medium italic">
              Historical calculations are derived from verified ledger entries across your Private Vault. 
              The <strong>Efficiency Index (ALPHA)</strong> represents the total percentage of inflow protected from system outflow. 
              Aim for a consistent 20%+ rating for optimal financial growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
