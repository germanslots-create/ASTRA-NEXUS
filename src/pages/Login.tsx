import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';

export function Login() {
  const { user, login, loginWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-astro-dark px-4 overflow-hidden relative">
      <div className="star-field"></div>
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-astro-gold/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[150px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-8 md:p-12 relative z-10 text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full border border-astro-gold flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <span className="text-astro-gold text-3xl">◈</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-widest text-white mb-2 uppercase">
          ASTRA <span className="text-astro-gold">NEXUS</span>
        </h1>
        <p className="text-xs text-astro-muted uppercase tracking-[0.2em] mb-8 font-medium">
          Celestial Order Management
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-astro-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail ADRESSE"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-astro-gold/50 transition-colors uppercase tracking-wider"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-astro-muted" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORT"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-astro-gold/50 transition-colors uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-astro-gold text-black font-bold py-3 rounded-lg hover:bg-astro-gold/90 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span className="text-sm uppercase tracking-wider">
              {isSignUp ? 'Registrieren' : 'Anmelden'}
            </span>
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-astro-dark px-4 text-astro-muted">ODER</span>
          </div>
        </div>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-4 bg-white text-black font-bold py-3 rounded-lg hover:bg-slate-100 transition-all active:scale-95 shadow-xl group border border-white mb-6"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
          <span className="text-sm uppercase tracking-wider">Mit Google fortfahren</span>
        </button>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-[10px] text-astro-muted uppercase tracking-[0.2em] hover:text-white transition-colors"
        >
          {isSignUp ? 'Bereits ein Konto? Anmelden' : 'Noch kein Konto? Registrieren'}
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
