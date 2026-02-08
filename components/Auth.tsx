
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { dbService } from '../services/dbService';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  theme: 'dark' | 'light';
  initialMode?: 'login' | 'signup';
}

const Auth: React.FC<Props> = ({ isOpen, onClose, onLogin, theme, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // Domain whitelist error handling
  const [isDomainError, setIsDomainError] = useState(false);
  const [currentHostname, setCurrentHostname] = useState('');

  useEffect(() => {
    setCurrentHostname(window.location.hostname);
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setStatusMsg(null);
    }
  }, [isOpen, initialMode]);

  const simulateGoogleLogin = async () => {
    setIsLoading(true);
    setStatusMsg("Bypassing domain check for demo...");
    
    // Create a mock Google user for development/preview purposes
    const mockEmail = "demo.creator@example.com";
    try {
      let user = await dbService.findUserByEmail(mockEmail);
      if (!user) {
        user = await dbService.createUser({
          name: 'Demo Creator',
          email: mockEmail,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockEmail}`,
          profession: 'Creative Director',
          country: 'Localhost',
          authProvider: 'google',
          browserInfo: navigator.userAgent,
          deviceInfo: navigator.platform
        });
      } else {
        user = await dbService.updateUser(user.id, { lastLoginAt: Date.now() });
      }
      
      setTimeout(() => {
        onLogin(user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError("Mock login failed: " + err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsDomainError(false);
    setIsLoading(true);
    setStatusMsg("Connecting to Google...");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      if (fbUser.email) {
        setStatusMsg("Checking credentials...");
        let user = await dbService.findUserByEmail(fbUser.email);
        
        if (!user) {
          user = await dbService.createUser({
            name: fbUser.displayName || 'ClipScript Creator',
            email: fbUser.email,
            avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.email}`,
            profession: 'Story Creator',
            country: 'Global',
            authProvider: 'google',
            browserInfo: navigator.userAgent,
            deviceInfo: navigator.platform
          });
        } else {
          user = await dbService.updateUser(user.id, { 
            lastLoginAt: Date.now(),
            avatar: fbUser.photoURL || user.avatar 
          });
        }
        
        onLogin(user);
        onClose();
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setIsDomainError(true);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign in cancelled.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setIsLoading(false);
      setStatusMsg(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!name.trim()) return setError("Please enter your name.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const user = await dbService.createUser({ 
          name, email, password, authProvider: 'email',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        });
        onLogin(user);
      } else {
        const user = await dbService.authenticate(email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className={`absolute inset-0 backdrop-blur-2xl ${isDark ? 'bg-slate-950/70' : 'bg-white/40'}`} onClick={!isLoading ? onClose : undefined}></div>

      <div className={`relative w-full max-w-md glass-card rounded-[3rem] p-8 md:p-10 shadow-2xl border overflow-hidden animate-in zoom-in-95 ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/95 border-black/5'}`}>
        
        {!isLoading && (
          <button onClick={onClose} className={`absolute top-6 right-6 p-2 rounded-xl transition-all ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-black'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M7 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M10 8V16L16 12L10 8Z" fill="currentColor"/><path d="M11 4C11 4 17 4.5 17 10C17 15.5 11 16 11 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-3xl font-black font-outfit tracking-tighter">{mode === 'login' ? 'Welcome Back' : 'Join ClipScript'}</h2>
        </div>

        {isDomainError && (
          <div className="mb-6 p-5 bg-amber-500/10 border border-amber-500/30 rounded-[2rem] animate-in slide-in-from-top-2">
            <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Unauthorized Domain
            </h4>
            <p className="text-[10px] text-amber-600/80 font-bold leading-relaxed mb-4">
              Google Auth is blocked on this preview URL. To fix permanently, add <span className="underline select-all">{currentHostname}</span> to Authorized Domains in your Firebase Console.
            </p>
            <button 
              onClick={simulateGoogleLogin}
              className="w-full py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
            >
              Simulate Login for Demo
            </button>
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-center mt-3 text-[9px] font-black text-amber-600/60 uppercase underline"
            >
              Open Firebase Console
            </a>
          </div>
        )}

        {error && !isDomainError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-black uppercase tracking-wider flex items-center gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-500 animate-pulse">{statusMsg}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {!isDomainError && (
              <button 
                onClick={handleGoogleLogin}
                className={`w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-95 border ${isDark ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 text-white border-slate-900'}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            )}

            <div className="relative flex items-center py-2">
              <div className={`flex-grow border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}></div>
              <span className={`flex-shrink mx-4 text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>or email</span>
              <div className={`flex-grow border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className={`w-full rounded-2xl px-6 py-4 text-xs font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/5 text-slate-900'}`} />
              )}
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`w-full rounded-2xl px-6 py-4 text-xs font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/5 text-slate-900'}`} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={`w-full rounded-2xl px-6 py-4 text-xs font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/5 text-slate-900'}`} />
              {mode === 'signup' && (
                <input type="password" placeholder="Confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={`w-full rounded-2xl px-6 py-4 text-xs font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/5 text-slate-900'}`} />
              )}
              <button type="submit" className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                {mode === 'login' ? 'Enter Studio' : 'Create Account'}
              </button>
            </form>

            <div className="text-center">
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {mode === 'login' ? "Don't have an account? Sign Up" : "Already a creator? Log In"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
