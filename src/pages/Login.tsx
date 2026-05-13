import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-astro-dark px-4 overflow-hidden relative">
      <div className="star-field"></div>
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-astro-gold/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[150px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-12 relative z-10 text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full border border-astro-gold flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <span className="text-astro-gold text-3xl">◈</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-widest text-white mb-2 uppercase">
          ASTRA <span className="text-astro-gold">NEXUS</span>
        </h1>
        <p className="text-xs text-astro-muted uppercase tracking-[0.2em] mb-12 font-medium">
          Celestial Order Management
        </p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-4 bg-white text-black font-bold py-4 rounded-lg hover:bg-slate-100 transition-all active:scale-95 shadow-xl group border border-white"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
          <span className="text-sm uppercase tracking-wider">Mit Google fortfahren</span>
        </button>

        <div className="mt-12 opacity-30">
          <p className="text-[10px] text-astro-muted uppercase tracking-[0.3em]">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
