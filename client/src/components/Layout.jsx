import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, Hexagon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddTransactionModal from './AddTransactionModal';
import FloatingActions from './FloatingActions';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Route map for better titles
  const routeTitles = {
    '/': 'Overview (मुख्य माहिती)',
    '/transactions': 'All Transactions (व्यवहार)',
    '/budgets': 'My Budgets (नियोजन)',
    '/goals': 'Savings Goals (बचत)',
    '/udhari': 'Len-Den (उधारी)',
    '/reports': 'Full Reports (अहवाल)',
    '/settings': 'Settings (सेटिंग)'
  };

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex bg-[#0a0a0a] h-screen overflow-hidden text-slate-200">
      {/* Premium Background Depth */}
      <div className="fixed top-[-10%] left-[20%] w-[40rem] h-[40rem] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed inset-0 tech-grid opacity-[0.03] pointer-events-none" />

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Universal Top Header */}
        <header className="px-6 md:px-10 py-5 flex items-center justify-between z-30 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-amber-500 transition-all"
                >
                  <Menu size={20} />
                </button>
               <div className="hidden lg:block w-10 h-10 rounded-xl overflow-hidden border border-amber-500/20">
                 <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
               </div>
              <div>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-40">Money Management</h2>
                <h1 className="text-lg font-black text-white">{routeTitles[location.pathname] || 'MoneyMind AI'}</h1>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-amber-500 transition-all">
                <Search size={18} />
              </button>
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-amber-500 transition-all relative">
                <Bell size={18} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-[#0a0a0a]" />
              </button>
              <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block" />
              <div className="hidden md:flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                 <Hexagon size={14} className="text-amber-500 animate-pulse" />
                 <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Active Link</span>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto hide-scrollbar relative z-10 px-6 md:px-10 py-8">
          <div className="max-w-7xl mx-auto w-full pb-24 lg:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Floating Quick Action Button */}
        <FloatingActions />
      </main>

      {isAddModalOpen && (
        <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
}

