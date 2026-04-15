import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Plus, Target, Trash2 } from 'lucide-react';

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [emoji, setEmoji] = useState('🎯');

  // Add Funds State
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', { name, targetAmount: Number(targetAmount), targetDate, emoji });
      toast.success('Goal created');
      setShowAdd(false);
      setName(''); setTargetAmount(''); setTargetDate(''); setEmoji('🎯');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const handleAddFunds = async (e, id) => {
    e.preventDefault();
    try {
      const res = await api.post(`/goals/${id}/add-funds`, { amount: Number(fundAmount) });
      toast.success('Funds added');
      setFundAmount('');
      setActiveGoalId(null);
      fetchGoals();
      
      if (res.data.isCompleted) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`Congratulations! You reached your goal: ${res.data.name} 🎉`);
      }
    } catch (error) {
      toast.error('Failed to add funds');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      toast.success('Goal removed');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Goal
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddGoal} className="card-surface grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end animate-in fade-in">
          <div>
            <label className="block text-sm font-medium mb-1">Emoji</label>
            <input type="text" maxLength={2} value={emoji} onChange={e => setEmoji(e.target.value)} className="input-field text-center" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Goal Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="e.g. New Car" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Amount</label>
            <input type="number" required value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="input-field" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Date</label>
            <input type="date" required value={targetDate} onChange={e => setTargetDate(e.target.value)} className="input-field" />
          </div>
          <div className="sm:col-span-2 md:col-span-5 flex justify-end">
             <button type="submit" className="btn-primary">Save Goal</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map(goal => {
          const percentage = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
          
          return (
            <div key={goal._id} className="card-surface relative group flex flex-col">
              <button onClick={() => handleDelete(goal._id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                <Trash2 size={16} />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl">
                  {goal.emoji}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{goal.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    By {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {formatCurrency(goal.savedAmount, user?.currency)}
                  </span>
                  <span className="text-xs text-slate-500">
                    of {formatCurrency(goal.targetAmount, user?.currency)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2">
                  <div className={`h-3 rounded-full transition-all duration-1000 ${goal.isCompleted ? 'bg-green-500' : 'bg-accent'}`} style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="text-right text-xs font-bold text-accent">{Math.round(percentage)}%</p>
              </div>

              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                {activeGoalId === goal._id ? (
                  <form onSubmit={(e) => handleAddFunds(e, goal._id)} className="flex gap-2">
                    <input 
                      type="number" 
                      required 
                      value={fundAmount} 
                      onChange={e => setFundAmount(e.target.value)} 
                      className="input-field text-sm py-1.5 px-3" 
                      placeholder="Amount" 
                      autoFocus
                    />
                    <button type="submit" className="btn-primary text-sm py-1.5 px-3">Add</button>
                    <button type="button" onClick={() => setActiveGoalId(null)} className="btn-accent bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 text-sm py-1.5 px-3">Cancel</button>
                  </form>
                ) : (
                  <button 
                    onClick={() => setActiveGoalId(goal._id)} 
                    disabled={goal.isCompleted}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition ${goal.isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'}`}
                  >
                    {goal.isCompleted ? 'Goal Achieved 🎉' : 'Add Funds'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
