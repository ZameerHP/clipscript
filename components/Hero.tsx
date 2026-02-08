
import React from 'react';

interface Props {
  onStartClick: () => void;
}

const Hero: React.FC<Props> = ({ onStartClick }) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-24">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-indigo-500/10 blur-[180px] -z-10 rounded-full animate-pulse"></div>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-[10px] font-black uppercase tracking-[0.2em] mb-8 ring-1 ring-indigo-500/20">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
        ClipScript Engine 1.0
      </div>

      <h1 className="text-5xl md:text-7xl lg:text-9xl font-extrabold font-outfit mb-8 leading-[0.9] tracking-tighter">
        Cinematic <span className="gradient-text">Flow</span> <br/> Mastery
      </h1>

      <p className={`text-base md:text-xl max-w-2xl mb-12 leading-relaxed font-medium transition-colors dark:text-slate-400 text-slate-600`}>
        Professional AI toolkit for cinematic screenplays, viral video hooks, and high-fidelity storytelling for the modern screen.
      </p>

      <div className="flex flex-col sm:flex-row gap-5">
        <button 
          onClick={onStartClick}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl active:scale-95"
        >
          Draft Your Scene
        </button>
        <button className="glass-card px-10 py-5 rounded-full font-bold text-lg hover:bg-indigo-500/5 transition-all border border-black/10 dark:border-white/10">
          Public Gallery
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={onStartClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 13 5 5 5-5" /><path d="m7 6 5 5 5-5" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
