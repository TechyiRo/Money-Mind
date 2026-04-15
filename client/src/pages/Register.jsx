import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Banknote, Sparkles, ChevronRight, Fingerprint, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    monthlyIncome: '',
  });
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const success = await googleLogin(credentialResponse.credential);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(formData);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Background elements synced with login */}
      <div className="absolute inset-0 tech-grid opacity-20" />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500 rounded-full blur-[150px]"
      />

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 px-4 md:px-8 relative z-10 h-full max-h-[900px]">
        
        {/* Left Side: Register specific branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col space-y-6 flex-1"
        >
          <div className="relative inline-block">
             <motion.div
                animate={{ rotate: -5, scale: 1.05 }}
                className="w-20 h-20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.1)] border border-amber-500/20"
             >
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
             </motion.div>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Secure Your <br />
              <span className="gold-text">Wealth Journey.</span>
            </h1>
            <p className="text-base text-slate-400 max-w-sm leading-relaxed">
              Experience elite financial management in under 60 seconds.
            </p>
          </div>

          <div className="space-y-6">
             {[
               { icon: <ShieldCheck size={18} />, text: 'Bank-grade Encryption' },
               { icon: <Sparkles size={18} />, text: 'AI Budgeting Assistant' }
             ].map((item, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.5 + i*0.2 }}
                 className="flex items-center gap-3 text-slate-400"
               >
                 <div className="text-amber-500">{item.icon}</div>
                 <span className="text-[13px] font-bold uppercase tracking-wider">{item.text}</span>
               </motion.div>
             ))}

             {/* Redesigned Signature Badge */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 1, duration: 1 }}
               className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 w-fit mt-4"
             >
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0a0a0a] font-black text-xs shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                 RS
               </div>
               <div>
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/60 mb-0.5">Chief Architect</p>
                 <p className="text-[13px] font-bold text-white tracking-tight">Rohidas Shinde</p>
                 <p className="text-[10px] text-slate-500 italic font-medium opacity-80">"Sculpting the Future of Financial Intelligence"</p>
               </div>
             </motion.div>
          </div>
        </motion.div>

        {/* Right Side: Register Form */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
           className="w-full max-w-md flex-shrink-0"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-4">
             <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-14 h-14 rounded-xl overflow-hidden border border-amber-500/30 mb-2"
             >
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
             </motion.div>
             <h2 className="text-lg font-bold gold-text">Initialize Identity</h2>
          </div>

          <div className="premium-card p-6 md:p-8 border-b-amber-500/30">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Create Protocol</h2>
              <p className="text-xs text-slate-500 font-medium">New terminal access initialization.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={16} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field pl-11 py-3 bg-white/5 border-white/5 text-sm"
                      placeholder="Name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Target (₹)</label>
                  <div className="relative group">
                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={16} />
                    <input
                      type="number"
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleChange}
                      className="input-field pl-11 py-3 bg-white/5 border-white/5 text-sm"
                      placeholder="Gold"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Global Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-11 py-3 bg-white/5 border-white/5 text-sm"
                    placeholder="you@domain.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Encryption Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-11 py-3 bg-white/5 border-white/5 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-premium py-3.5 mt-2"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-xs font-black uppercase tracking-widest">Initialize Access</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative mb-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative px-3 text-[10px] font-black text-slate-700 bg-transparent uppercase tracking-widest">Neural Link</span>
              </div>

              <div className="flex justify-center scale-90 md:scale-100">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Check Link')}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                />
              </div>
            </div>

            <p className="mt-6 text-center text-slate-600 text-[11px] font-medium uppercase tracking-widest">
              Member?{' '}
              <Link to="/login" className="text-amber-500 font-black hover:underline">
                Access Vault
              </Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

