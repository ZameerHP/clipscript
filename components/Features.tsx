
import React from 'react';
import { StoryType } from '../types';

interface FeatureItem {
  title: string;
  icon: string;
  desc: string;
  type: StoryType;
  accent?: string;
}

const FEATURE_LIST: FeatureItem[] = [
  { title: "Viral Strategist", icon: "🚀", desc: "Hooks, titles, and hashtags for explosive growth.", type: 'Viral Strategist', accent: 'border-pink-500/30' },
  { title: "Story Engine", icon: "✨", desc: "Craft classic narratives in any literature genre.", type: 'Short story' },
  { title: "Movie Script", icon: "🎬", desc: "Industry-standard formatting and dialogue pacing.", type: 'Movie scene' },
  { title: "Short Form", icon: "📱", desc: "Punchy, fast-paced scripts for TikTok and Reels.", type: 'TikTok/Reels' },
  { title: "Kids Corner", icon: "🎈", desc: "Educational and whimsical tales for children.", type: 'Kids Story' },
  { title: "Horror Mode", icon: "👻", desc: "Suspenseful atmosphere and visceral thrills.", type: 'Horror Story' },
  { title: "Audio Lab", icon: "🗣️", desc: "Turn any text into high-fidelity AI narration.", type: 'Dialogue' },
  { title: "Romance", icon: "❤️", desc: "Deeply emotional and character-driven love stories.", type: 'Love Story' },
];

interface Props {
  onSelectType: (type: StoryType) => void;
  theme: 'dark' | 'light';
}

const Features: React.FC<Props> = ({ onSelectType, theme }) => {
  return (
    <section className={`py-32 px-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900/30' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black font-outfit mb-6 tracking-tighter">Tools for <span className="gradient-text">Modern Creators</span></h2>
          <p className={`max-w-xl mx-auto font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Select a specialized model to begin your creative journey with optimized AI instructions.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_LIST.map((f, i) => (
            <div 
              key={i} 
              onClick={() => onSelectType(f.type)}
              className={`glass-card p-10 rounded-[2.5rem] hover:-translate-y-2 transition-all group cursor-pointer border ${f.accent || (theme === 'dark' ? 'hover:border-purple-500/40 border-white/5' : 'hover:border-purple-500/20 border-black/5')}`}
            >
              <div className={`text-3xl mb-8 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform ${theme === 'dark' ? 'bg-white/5 group-hover:bg-purple-500/20' : 'bg-black/5 group-hover:bg-purple-500/10'}`}>{f.icon}</div>
              <h3 className={`text-xl font-black mb-4 group-hover:text-purple-500 transition-colors font-outfit ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
              <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
