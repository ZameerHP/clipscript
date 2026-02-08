
import React from 'react';

const STEPS = [
  { 
    num: "01", 
    title: "Define Concept", 
    desc: "Briefly describe your idea or character in natural language." 
  },
  { 
    num: "02", 
    title: "Select Engine", 
    desc: "Choose from 8+ specialized models for scripts, stories, or viral hooks." 
  },
  { 
    num: "03", 
    title: "Produce & Refine", 
    desc: "Generate high-fidelity content and iterate with precise AI adjustments." 
  }
];

interface Props {
  theme: 'dark' | 'light';
}

const HowItWorks: React.FC<Props> = ({ theme }) => {
  return (
    <section className="py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <h2 className="text-5xl md:text-6xl font-black font-outfit tracking-tighter">How it <span className="text-purple-600">Works</span></h2>
          <p className={`max-w-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>The intersection of professional writing expertise and powerful AI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {STEPS.map((step, i) => (
            <div key={i} className="relative group">
              <span className={`text-[12rem] font-black font-outfit absolute -top-24 -left-8 pointer-events-none opacity-[0.03] transition-opacity group-hover:opacity-10 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                {step.num}
              </span>
              <div className="relative z-10">
                <div className="w-12 h-1 bg-purple-600 mb-8 rounded-full group-hover:w-20 transition-all duration-500"></div>
                <h3 className={`text-2xl font-black mb-6 font-outfit ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                <p className={`leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
