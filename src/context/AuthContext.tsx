import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
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
        // Optionale Sperre - falls gewünscht, sonst auskommentieren
        // await signOut(auth);
        // setUser(null);
        // toast.error('Kein Zugriff: Dieses Konto ist nicht für Astra Nexus autorisiert.');
        setUser(user);
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
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login Fehler:", error);
      handleAuthError(error);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) return;
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    if (!auth) return;
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      toast.success('Konto erstellt!');
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleAuthError = (error: any) => {
    if (error.code === 'auth/unauthorized-domain') {
      toast.error('Domain nicht autorisiert.');
    } else if (error.code === 'auth/popup-blocked') {
      toast.error('Popup blockiert.');
    } else if (error.code === 'auth/wrong-password') {
      toast.error('Falsches Passwort.');
    } else if (error.code === 'auth/user-not-found') {
      toast.error('Benutzer nicht gefunden.');
    } else if (error.code === 'auth/email-already-in-use') {
      toast.error('Email bereits registriert.');
    } else if (error.code === 'auth/weak-password') {
      toast.error('Passwort zu schwach (min. 6 Zeichen).');
    } else if (error.code === 'auth/invalid-email') {
      toast.error('Ungültige Email.');
    } else {
      toast.error('Auth Fehler: ' + (error.message || 'Unbekannter Fehler'));
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithEmail, signUpWithEmail, logout }}>
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
