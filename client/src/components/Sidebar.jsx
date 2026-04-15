import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, PieChart, Target, Users, Settings, Moon, Sun, Search, LogOut, LayoutDashboard, Wallet, TrendingUp, UserCircle, X, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout, updateProfile, language, setLanguage } = useAuth();
  const location = useLocation();

  const labels = {
    en: {
      overview: 'Overview',
      transactions: 'Transactions',
      budgets: 'Budgets',
      goals: 'Savings',
      udhari: 'Lending',
      reports: 'Reports',
      settings: 'Settings'
    },
    mr: {
      overview: 'माहिती (Overview)',
      transactions: 'व्यवहार (Transactions)',
      budgets: 'नियोजन (Budgets)',
      goals: 'बचत (Goals)',
      udhari: 'उधारी (Len-Den)',
      reports: 'अहवाल (Reports)',
      settings: 'सेटिंग्ज'
    }
  };

  const t = labels[language] || labels.en;

  const navItems = [
    { path: '/', label: t.overview, icon: Home },
    { path: '/transactions', label: t.transactions, icon: List },
    { path: '/budgets', label: t.budgets, icon: PieChart },
    { path: '/goals', label: t.goals, icon: Target },
    { path: '/udhari', label: t.udhari, icon: Users },
    { path: '/reports', label: t.reports, icon: Activity },
    { path: '/settings', label: t.settings, icon: Settings },
  ];

  const toggleTheme = () => {
    const newTheme = user.theme === 'dark' ? 'light' : 'dark';
    updateProfile({ theme: newTheme });
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }

  return (
    <>
      {/* Sidebar - Desktop (static) & Mobile (drawer) */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isOpen || window.innerWidth >= 1024 ? 0 : -320,
          opacity: 1
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-40 h-screen w-72 flex flex-col bg-white dark:bg-[#0d0d0d] border-r border-slate-200 dark:border-white/5 overflow-hidden transition-colors duration-300 ${isOpen ? 'flex' : 'hidden lg:flex'}`}
      >
        {/* Logo Section */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-10 h-10 rounded-xl shadow-lg dark:shadow-[0_0_20px_rgba(245,158,11,0.2)] overflow-hidden border border-amber-500/20"
            >
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </motion.div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Money<span className="gold-text">Mind</span></h1>
              <p className="text-[9px] text-amber-600 dark:text-amber-500/50 font-black tracking-[0.2em] uppercase">Private Vault</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Language Selection Toggle */}
        <div className="px-6 mb-4">
           <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-xl flex items-center border border-slate-200 dark:border-white/5">
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${language === 'en' ? 'bg-white dark:bg-amber-500 text-slate-900 dark:text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('mr')}
                className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${language === 'mr' ? 'bg-white dark:bg-amber-500 text-slate-900 dark:text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                मराठी
              </button>
           </div>
        </div>

        {/* Navigation - Scrollable area */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto mt-4 hide-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className="relative block"
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-amber-500/10 dark:bg-gradient-to-r dark:from-amber-500/10 dark:to-transparent border-l-4 border-amber-500 z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 flex items-center gap-4 px-5 py-3 transition-all duration-300 ${
                  isActive 
                    ? 'text-amber-600 dark:text-white font-bold' 
                    : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white group'
                }`}>
                  <Icon size={18} className={`${isActive ? 'text-amber-600 dark:text-amber-500' : 'group-hover:text-amber-600 dark:group-hover:text-amber-400 opacity-60'}`} />
                  <span className="text-[13px] tracking-wide font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Account / Footer - Pinned to bottom */}
        <div className="p-4 mt-auto border-t border-slate-100 dark:border-white/5">
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl p-4 backdrop-blur-3xl overflow-hidden relative">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500/5 blur-2xl rounded-full" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-amber-600 dark:text-amber-500 shadow-sm">
                {user?.name?.charAt(0) || <UserCircle size={18} />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</span>
                <span className="text-[9px] text-slate-500 font-bold tracking-tight uppercase">Premium User</span>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={toggleTheme}
                 className="flex-1 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-white transition-colors flex items-center justify-center shadow-sm"
              >
                {user?.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="flex-1 py-1.5 rounded-lg bg-amber-600/10 dark:bg-amber-500/10 border border-amber-600/20 dark:border-amber-500/20 text-amber-600 dark:text-amber-500 hover:bg-amber-600 dark:hover:bg-amber-500 hover:text-white dark:hover:text-[#0a0a0a] transition-all flex items-center justify-center"
              >
                <LogOut size={14} />
              </motion.button>
            </div>
          </div>
          
          <div className="mt-3 text-center">
             <p className="text-[8px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-600 uppercase opacity-70">Protocol v2.5</p>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white dark:bg-[#0d0d0d]/80 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-2xl pb-safe z-50 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 h-14">
          {[
            { path: '/', icon: Home, label: 'Home' },
            { path: '/transactions', icon: List, label: 'Ledger' },
            { path: '/add', isFab: true },
            { path: '/goals', icon: Target, label: 'Growth' },
            { path: '/settings', icon: Settings, label: 'Menu', isMenu: true },
          ].map((item, idx) => {
            if (item.isFab) return <div key="fab-placeholder" className="w-10" />; 
            
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            if (item.isMenu) {
              return (
                <button 
                  key="menu-trigger"
                  onClick={() => setIsOpen(true)}
                  className={`relative flex flex-col items-center justify-center w-10 h-full text-slate-400 dark:text-slate-500`}
                >
                  <Icon size={18} strokeWidth={2} />
                  <span className="text-[7px] font-black uppercase tracking-tighter mt-1">{item.label}</span>
                </button>
              );
            }

            return (
              <Link key={item.path} to={item.path} className={`relative flex flex-col items-center justify-center w-10 h-full ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
                {isActive && (
                  <motion.div layoutId="mobile-nav" className="absolute -bottom-1 w-5 h-1 rounded-full bg-amber-500" />
                )}
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[7px] font-black uppercase tracking-tighter mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}


