import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, ChevronRight, Fingerprint } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const triggerSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const success = await googleLogin(credentialResponse.credential);
    setLoading(false);
    if (success) {
      triggerSuccess();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      triggerSuccess();
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -45, filter: 'blur(20px)' }}
              animate={{ scale: 1, rotate: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-amber-500 shadow-[0_0_80px_rgba(245,158,11,0.5)]">
                <img src="/logo.jpg" alt="Success" className="w-full h-full object-cover" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-[2.5rem] border-4 border-amber-400 blur-xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 text-center"
            >
              <h1 className="text-4xl font-black text-white tracking-tight underline decoration-amber-500 decoration-4 underline-offset-8">ACCESS GRANTED</h1>
              <p className="mt-4 text-slate-500 font-black tracking-[0.5em] uppercase text-xs">Initializing Secure Environment...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 tech-grid opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500 rounded-full blur-[120px]"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[100px]"
      />

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 px-4 md:px-8 relative z-10 h-full max-h-[900px]">
        
        {/* Left Side: Branding - Visible on LG */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col space-y-6 flex-1"
        >
          <div className="relative inline-block">
             <motion.div
                animate={{ 
                  rotate: [0, 3, -3, 0],
                  scale: [1, 1.02, 0.98, 1]
                }}
                transition={{ duration: 6, repeat: Infinity }}
                className="w-24 h-24 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.2)] border border-amber-500/20"
             >
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
             </motion.div>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl 2xl:text-6xl font-black text-white leading-tight">
              Master Your <br />
              <span className="gold-text">Financial Mind.</span>
            </h1>
            <p className="text-base text-slate-400 max-w-md leading-relaxed">
              Experience the future of personal finance with AI-driven insights and premium wealth management.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4">
               <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-slate-800 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full opacity-70" />
                    </div>
                  ))}
               </div>
               <p className="text-xs text-slate-500 font-bold tracking-wider uppercase underline decoration-amber-500/30 underline-offset-4">100k+ Elite Users Globally</p>
            </div>

            {/* Redesigned Signature Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 w-fit"
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

        {/* Right Side: Login Form */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
           className="w-full max-w-md flex-shrink-0"
        >
          {/* Mobile Logo: Only visible when branding is hidden */}
          <div className="lg:hidden flex flex-col items-center mb-4">
             <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-16 h-16 rounded-xl overflow-hidden border border-amber-500/30 mb-2"
             >
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
             </motion.div>
             <h2 className="text-xl font-bold gold-text">MoneyMind AI</h2>
          </div>

          <div className="premium-card p-6 md:p-8 relative overflow-visible">
            <div className="absolute top-0 right-0 p-6 hidden md:block opacity-20">
              <Fingerprint className="text-amber-500" size={40} />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-xs text-slate-500 font-medium">Secure access to your vault protocol.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Email Protocol</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11 py-3 bg-white/5 border-white/5 text-sm"
                    placeholder="Enter email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Access</label>
                   <a href="#" className="text-[10px] font-bold text-amber-500 uppercase hover:underline">Forgot?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-11 py-3 bg-white/5 border-white/5 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-premium py-3 mt-2"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-xs font-black uppercase tracking-widest">Execute Login</span>
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
                <span className="relative px-3 text-[10px] font-black text-slate-700 bg-[#121212]/0 uppercase tracking-widest">Global Connect</span>
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
              No account?{' '}
              <Link to="/register" className="text-amber-500 font-black hover:underline underline-offset-4">
                Initialize New
              </Link>
            </p>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}

