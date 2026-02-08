
import React from 'react';

interface Props {
  theme: 'dark' | 'light';
}

const Footer: React.FC<Props> = ({ theme }) => {
  return (
    <footer className={`border-t py-16 px-6 transition-colors duration-500 ${theme === 'dark' ? 'border-white/5 bg-slate-950/50' : 'border-black/5 bg-slate-100'}`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M7 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M10 8V16L16 12L10 8Z" fill="currentColor"/>
                <path d="M11 4C11 4 17 4.5 17 10C17 15.5 11 16 11 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={`text-2xl font-black font-outfit tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Clip<span className="text-indigo-600">Script</span></span>
          </div>
          <p className={`text-sm max-w-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            Powering the cinematic revolution with high-performance generative script tools for creators.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-10 text-xs font-black uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Contact</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">API docs</a>
        </div>

        <div className="flex gap-4">
          {['Twitter', 'Instagram', 'Discord'].map((s) => (
            <a key={s} href="#" className={`w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:bg-indigo-500/10 transition-all text-sm font-black border ${theme === 'dark' ? 'border-white/5 text-slate-400' : 'border-black/5 text-slate-600'}`}>
              {s[0]}
            </a>
          ))}
        </div>
      </div>
      <div className={`mt-16 text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-900'}`}>
        &copy; {new Date().getFullYear()} CLIPSCRIPT STUDIO CREATIVE ENGINE
      </div>
    </footer>
  );
};

export default Footer;
