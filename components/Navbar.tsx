
import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  user: User | null;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onStartClick: () => void;
  onTtsClick: () => void;
  onPricingClick: () => void;
  onBillingClick: () => void;
  onHomeClick: () => void;
}

const Navbar: React.FC<Props> = ({ 
  user, 
  theme, 
  onThemeToggle, 
  onLoginClick, 
  onLogoutClick, 
  onStartClick, 
  onTtsClick, 
  onPricingClick,
  onBillingClick,
  onHomeClick
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isDark = theme === 'dark';

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 px-6 py-3 flex items-center justify-between glass-card rounded-3xl border transition-all duration-500 ${isDark ? 'bg-slate-950/40 border-white/10' : 'bg-white/70 border-black/5 shadow-sm'}`}>
      <div className="flex items-center gap-2 cursor-pointer" onClick={onHomeClick}>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group overflow-hidden relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white z-10 transition-transform group-hover:scale-110">
            <path d="M7 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M10 8V16L16 12L10 8Z" fill="currentColor"/>
            <path d="M11 4C11 4 17 4.5 17 10C17 15.5 11 16 11 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <span className={`text-xl font-bold font-outfit tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Clip<span className="text-indigo-500">Script</span></span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
        <button onClick={onHomeClick} className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'} transition-colors`}>Home</button>
        <button onClick={onStartClick} className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'} transition-colors`}>Writer</button>
        <button onClick={onTtsClick} className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'} transition-colors`}>Audio Lab</button>
        {user && <button onClick={onBillingClick} className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'} transition-colors`}>Billing</button>}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <button 
            onClick={onPricingClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all hover:scale-105 ${isDark ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            <span className="text-xs font-black uppercase tracking-widest">{user.credits || 0}</span>
          </button>
        )}

        <button 
          onClick={onThemeToggle}
          className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-amber-400' : 'bg-black/5 hover:bg-black/10 text-purple-600'}`}
          title="Toggle Theme"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>

        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-3 p-1 pr-4 rounded-full transition-all border ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-black/5 hover:bg-black/10 border-black/5'}`}
            >
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border border-indigo-500/30"
              />
              <span className={`text-xs font-bold hidden sm:inline ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</span>
            </button>

            {showProfileMenu && (
              <div className={`absolute top-full right-0 mt-3 w-64 glass-card rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 border overflow-hidden ${isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
                <div className={`px-4 py-3 border-b mb-1 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <p className={`text-[9px] uppercase font-black mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Account Info</p>
                  <p className={`text-xs truncate font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.email}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-center">
                      <p className={`text-[8px] font-black uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Items</p>
                      <p className="text-xs font-bold text-indigo-500">{user.totalGenerations || 0}</p>
                    </div>
                    <div className={`text-center border-l pl-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className={`text-[8px] font-black uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Balance</p>
                      <p className="text-xs font-bold text-amber-500">{user.credits || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-1 space-y-1">
                  <button onClick={() => { setShowProfileMenu(false); onBillingClick(); }} className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                    Billing Dashboard
                  </button>
                  <button onClick={() => { setShowProfileMenu(false); onLogoutClick(); }} className="w-full flex items-center gap-2 px-4 py-3 text-xs text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2 rounded-full font-bold text-xs hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 text-white"
          >
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
