import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Bell, Shield, LogOut, Sun, Moon } from 'lucide-react';

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    monthlyIncome: user?.monthlyIncome || '',
    currency: user?.currency || 'INR',
    theme: user?.theme || 'system',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile(formData);
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', passwordData);
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const toggleTheme = () => {
    const newTheme = user.theme === 'dark' ? 'light' : 'dark';
    updateProfile({ theme: newTheme });
    setFormData({ ...formData, theme: newTheme });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="card-surface border-t-4 border-t-accent">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={20} className="text-accent"/> Profile Information</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Income</label>
                  <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select name="currency" value={formData.currency} onChange={handleChange} className="input-field">
                    <option value="INR">₹ INR (Indian Rupee)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="GBP">£ GBP (British Pound)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>

          {/* Password Reset */}
          <div className="card-surface border-t-4 border-t-slate-800 dark:border-t-slate-400">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Shield size={20}/> Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="input-field" required />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary bg-slate-800 hover:bg-slate-900 dark:bg-slate-700">Update Password</button>
              </div>
            </form>
          </div>
        </div>

        {/* Preferences & Danger Zone */}
        <div className="space-y-6">
          <div className="card-surface">
             <h2 className="text-lg font-bold mb-4">Preferences</h2>
             
             <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 mb-4">
               <div className="flex items-center gap-3">
                 {user?.theme === 'dark' ? <Moon size={18} className="text-slate-500" /> : <Sun size={18} className="text-slate-500" />}
                 <span className="font-medium text-sm">Dark Mode</span>
               </div>
               <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${user?.theme === 'dark' ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-700'}`}
               >
                 <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${user?.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </button>
             </div>
             
          </div>

          <div className="card-surface border-t-4 border-t-red-500">
             <h2 className="text-lg font-bold mb-4 text-red-500">Danger Zone</h2>
             <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold transition mb-4">
                <LogOut size={18}/> Sign Out
             </button>
             
             <button className="w-full text-xs text-slate-500 hover:text-red-500 underline transition text-center">
               Delete Account
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
