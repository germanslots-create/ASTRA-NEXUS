import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_EMAILS = [
  'high.betting.seo@gmail.com',
  'production@designs-nf.com'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email && !ALLOWED_EMAILS.includes(user.email)) {
        await signOut(auth);
        setUser(null);
        toast.error('Kein Zugriff: Dieses Konto ist nicht für Astra Nexus autorisiert.');
      } else {
        setUser(user);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    if (!auth) {
      toast.error("Firebase ist noch nicht konfiguriert.");
      return;
    }
    
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to avoid auto-login issues
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login Fehler:", error);
      
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('Domain nicht autorisiert: Bitte fügen Sie "' + window.location.hostname + '" in der Firebase Console unter Authentifizierung -> Einstellungen hinzu.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blockiert: Bitte erlauben Sie Popups für diese Seite.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Just ignore if they closed it
      } else {
        toast.error('Login fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
      }
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
