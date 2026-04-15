import { useState } from 'react';
import { Plus, X, ListPlus, FileUp, Users, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatementImportModal from './StatementImportModal';
import AddTransactionModal from './AddTransactionModal';

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: ListPlus, label: 'Add Entry (खर्च भरा)', color: 'bg-emerald-500', action: () => setIsAddOpen(true) },
    { icon: FileUp, label: 'Import File (फाइल टाका)', color: 'bg-amber-500', action: () => setIsImportOpen(true) },
    { icon: Users, label: 'Len-Den (उधारी)', color: 'bg-indigo-500', action: () => navigate('/udhari') },
  ];

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[99999]">
        <AnimatePresence>
          {isOpen && (
            <div className="flex flex-col gap-3 mb-4 items-end">
              {actions.map((act, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    act.action();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 group"
                >
                  <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    {act.label}
                  </span>
                  <div className={`${act.color} p-4 rounded-2xl shadow-xl shadow-black/40 text-black hover:scale-110 active:scale-95 transition-all`}>
                    <act.icon size={20} />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`p-5 rounded-[2rem] shadow-2xl transition-all duration-300 ${isOpen ? 'bg-rose-500 rotate-90' : 'bg-amber-500 shadow-amber-500/20'} text-black`}
        >
          {isOpen ? <X size={28} /> : <Plus size={28} />}
        </motion.button>
      </div>

      {isImportOpen && (
        <StatementImportModal 
          onClose={() => setIsImportOpen(false)} 
          onSuccess={() => {
            setIsImportOpen(false);
            window.location.reload(); 
          }} 
        />
      )}

      {isAddOpen && (
        <AddTransactionModal 
          onClose={() => setIsAddOpen(false)} 
          onSuccess={() => {
            setIsAddOpen(false);
            window.location.reload();
          }} 
        />
      )}
    </>
  );
}
