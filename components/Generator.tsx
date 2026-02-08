
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { generateStory, validateTopic, GenMode, ValidationResult } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { GeneratedContent, GenerationSettings, StoryType, Mood, Language, Length, User } from '../types';

interface Props {
  onGenerated: (content: GeneratedContent) => void;
  history: GeneratedContent[];
  theme: 'dark' | 'light';
  user: User | null;
  onCreditsUpdated: (newBalance: number) => void;
  onBuyCreditsClick: () => void;
  externalTypeSelection?: StoryType | null;
  onSelectionHandled?: () => void;
  onSendToTts?: (content: string) => void;
}

const Generator: React.FC<Props> = ({ 
  onGenerated, 
  history, 
  theme, 
  user,
  onCreditsUpdated,
  onBuyCreditsClick,
  externalTypeSelection, 
  onSelectionHandled, 
  onSendToTts 
}) => {
  const [prompt, setPrompt] = useState('');
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMode, setGenMode] = useState<GenMode>('new');
  const [output, setOutput] = useState<GeneratedContent | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const [settings, setSettings] = useState<GenerationSettings>({
    type: 'Short story',
    mood: 'Happy',
    language: 'Simple English',
    length: 'Medium'
  });

  const modelMetadata = useMemo(() => ({
    'Short story': { desc: 'Prose, characters, and descriptions.', placeholder: 'E.g. A explorer discovers a hidden city...' },
    'Movie scene': { desc: 'Professional screenplay format.', placeholder: 'E.g. High-stakes heist in a futuristic vault...' },
    'TikTok/Reels': { desc: 'Fast-paced scripts with hooks.', placeholder: 'E.g. 5 simple hacks to boost productivity...' },
    'Love Story': { desc: 'Emotional chemistry and tension.', placeholder: 'E.g. Strangers meeting in a rainy bookstore...' },
    'Horror Story': { desc: 'Dread and suspenseful atmosphere.', placeholder: 'E.g. A haunted radio playing static from the future...' },
    'Kids Story': { desc: 'Simple, whimsical, and educational.', placeholder: 'E.g. Barnaby the bear learns about sharing...' },
    'Dialogue': { desc: 'Pure character interaction.', placeholder: 'E.g. Tense argument between rival scientists...' },
    'Voice-over': { desc: 'Narration with pacing and cues.', placeholder: 'E.g. Nature documentary script...' },
    'Viral Strategist': { desc: 'Growth-focused scripts.', placeholder: 'E.g. How I made $10k in one week with AI...' }
  }), []);

  const startProgress = () => {
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = window.setInterval(() => {
      setProgress(p => (p < 95 ? p + (100 - p) * 0.1 : p));
    }, 200);
  };

  const endProgress = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 1000);
  };

  const handleGenerate = async (mode: GenMode = 'new') => {
    const cp = mode === 'rewrite' ? rewriteInstruction : prompt;
    if (mode !== 'continue' && !cp.trim()) return;
    if (!user) return alert("Please sign in.");
    if (user.credits < 1) {
      onBuyCreditsClick();
      return;
    }

    setValidation(null);
    setIsGenerating(true);
    setGenMode(mode);
    if (mode !== 'continue') startProgress();

    if (mode === 'new') {
      const v = await validateTopic(cp);
      if (!v.isValid) {
        setValidation(v);
        setIsGenerating(false);
        endProgress();
        return;
      }
    }

    try {
      const res = await generateStory(cp, settings, mode, output?.content);
      
      const newCredits = await dbService.deductCredits(user.id, 1);
      onCreditsUpdated(newCredits);

      let fr = res;
      if (mode === 'continue' && output) {
        fr = { 
          ...res, 
          title: output.title, 
          content: output.content + "\n\n" + res.content,
          viralTitles: res.viralTitles || output.viralTitles,
          hashtags: res.hashtags || output.hashtags
        };
      }
      setOutput(fr);
      onGenerated(fr);
      setRewriteInstruction('');
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('story_ai_draft', JSON.stringify({ prompt, output: fr, settings, lastSaved: ts }));
      setLastSaved(ts);
    } catch (e: any) {
      alert(e.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
      endProgress();
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="w-full flex flex-col gap-10">
      <div className={`glass-card p-8 rounded-[2.5rem] grid grid-cols-2 md:grid-cols-4 gap-6 relative overflow-hidden shadow-sm`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500"></div>
        <div className="col-span-1">
          <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Engine</label>
          <select value={settings.type} onChange={e => setSettings({...settings, type: e.target.value as StoryType})} className={`w-full bg-transparent border rounded-2xl px-4 py-3 text-sm outline-none font-bold transition-colors ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-slate-900 bg-white/50'}`}>
            {Object.keys(modelMetadata).map(key => <option key={key} value={key} className={isDark ? 'bg-slate-900' : 'bg-white'}>{key}</option>)}
          </select>
        </div>
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mood</label>
          <select value={settings.mood} onChange={e => setSettings({...settings, mood: e.target.value as Mood})} className={`w-full bg-transparent border rounded-2xl px-4 py-3 text-sm outline-none font-bold transition-colors ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-slate-900 bg-white/50'}`}>
            {['Happy', 'Sad', 'Romantic', 'Horror', 'Motivational'].map(m => <option key={m} value={m} className={isDark ? 'bg-slate-900' : 'bg-white'}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lang</label>
          <select value={settings.language} onChange={e => setSettings({...settings, language: e.target.value as Language})} className={`w-full bg-transparent border rounded-2xl px-4 py-3 text-sm outline-none font-bold transition-colors ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-slate-900 bg-white/50'}`}>
            {['English', 'Simple English', 'Urdu'].map(l => <option key={l} value={l} className={isDark ? 'bg-slate-900' : 'bg-white'}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Length</label>
          <select value={settings.length} onChange={e => setSettings({...settings, length: e.target.value as Length})} className={`w-full bg-transparent border rounded-2xl px-4 py-3 text-sm outline-none font-bold transition-colors ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-slate-900 bg-white/50'}`}>
            {['Short', 'Medium', 'Long'].map(len => <option key={len} value={len} className={isDark ? 'bg-slate-900' : 'bg-white'}>{len}</option>)}
          </select>
        </div>
      </div>

      <div className="relative">
        {validation && !validation.isValid && (
          <div className="mb-6 p-6 rounded-[2rem] border border-amber-500/30 bg-amber-500/5 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p className="text-sm font-bold text-amber-600">Oops! This topic seems invalid.</p>
            </div>
            <p className={`text-xs mb-4 font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Try one of these professional suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {validation.suggestions?.map((s, i) => (
                <button key={i} onClick={() => setPrompt(s)} className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10' : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`glass-card p-3 rounded-[3rem] flex flex-col md:flex-row items-center gap-3 shadow-2xl transition-all border group overflow-hidden ${isDark ? 'hover:border-indigo-500/30 border-white/5' : 'hover:border-indigo-500/20 border-black/5'}`}>
          {progress > 0 && <div className="absolute top-0 left-0 h-full bg-indigo-500/10 transition-all duration-300 pointer-events-none" style={{ width: `${progress}%` }}></div>}
          <textarea 
            placeholder={modelMetadata[settings.type].placeholder}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className={`flex-grow bg-transparent p-6 text-xl outline-none resize-none min-h-[140px] md:min-h-0 font-medium relative z-10 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
          <button 
            onClick={() => handleGenerate('new')}
            disabled={isGenerating || !prompt.trim()}
            className="w-full md:w-auto relative bg-gradient-to-r from-indigo-600 to-blue-600 px-12 py-8 rounded-[2rem] font-black text-lg hover:scale-[1.03] transition-all shadow-xl shadow-indigo-500/20 flex flex-col items-center justify-center gap-1 disabled:opacity-50 text-white group z-10"
          >
            {isGenerating && genMode === 'new' ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mb-1"></div>
                <span className="text-[10px] uppercase tracking-tighter">{Math.round(progress)}% Complete</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:rotate-12 transition-transform"><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                <span>Generate</span>
                <span className="text-[8px] opacity-60 font-black uppercase tracking-widest mt-0.5">1 Credit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {output && (
        <div className={`glass-card p-10 rounded-[3rem] animate-in fade-in slide-in-from-bottom-6 duration-700 border transition-all ${isDark ? 'border-white/10 bg-slate-900/40' : 'border-black/5 bg-white'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b pb-8 border-slate-200 dark:border-white/5">
            <div>
              <h3 className={`text-4xl font-black font-outfit tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{output.title}</h3>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{settings.type}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{settings.mood}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => onSendToTts?.(output.content)} className={`p-4 rounded-2xl transition-all flex items-center gap-2 font-black text-xs px-6 uppercase tracking-widest border ${isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' : 'bg-cyan-50 border-cyan-100 text-cyan-600 hover:bg-cyan-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polygon points="5 3 19 12 5 21 5 3"/></svg> Audio
              </button>
              <button onClick={() => { navigator.clipboard.writeText(`${output.title}\n\n${output.content}`); alert("Copied!"); }} className={`p-4 rounded-2xl transition-all border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-slate-600'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
          </div>
          
          <div className={`prose ${isDark ? 'prose-invert' : 'prose-slate'} max-w-none leading-[1.8] whitespace-pre-wrap text-lg mb-12 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{output.content}</div>

          {(output.viralTitles?.length > 0 || output.hashtags?.length > 0) && (
            <div className={`mt-10 p-8 rounded-[2.5rem] border animate-in slide-in-from-top-4 duration-500 ${isDark ? 'bg-pink-500/5 border-pink-500/20' : 'bg-pink-50/50 border-pink-100'}`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white shadow-xl shadow-pink-500/20"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
                <h4 className={`text-xl font-black font-outfit uppercase tracking-tighter ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>Viral Toolkit</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h5 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}><span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>Viral Titles</h5>
                  <div className="space-y-3">
                    {output.viralTitles?.map((t, idx) => (
                      <button key={idx} onClick={() => { navigator.clipboard.writeText(t); alert("Title Copied!"); }} className={`w-full text-left p-4 rounded-xl border text-sm font-bold transition-all hover:translate-x-1 flex justify-between items-center group ${isDark ? 'bg-black/20 border-white/5 text-slate-200' : 'bg-white border-pink-200 text-slate-700 shadow-sm hover:border-pink-300'}`}>
                        <span className="truncate mr-4">{t}</span>
                        <svg className="opacity-0 group-hover:opacity-100" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}><span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>Hashtags</h5>
                    <button onClick={() => { navigator.clipboard.writeText(output.hashtags?.join(' ') || ''); alert("Hashtags Copied!"); }} className="text-[9px] font-black text-pink-500 uppercase underline">Copy All</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {output.hashtags?.map((h, idx) => <span key={idx} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-pink-100/50 border-pink-200 text-pink-600'}`}>#{h.replace('#', '')}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`mt-10 pt-10 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Iteration Tools</h4>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col md:flex-row gap-3">
                <input type="text" placeholder={`Refine script, titles or hashtags...`} value={rewriteInstruction} onChange={e => setRewriteInstruction(e.target.value)} className={`flex-grow bg-transparent border rounded-[1.5rem] px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900 bg-white/50 focus:border-indigo-500'}`} />
                <button onClick={() => handleGenerate('rewrite')} disabled={isGenerating || !rewriteInstruction.trim()} className={`px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest border transition-all disabled:opacity-30 ${isDark ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}>Rewrite</button>
              </div>
              <button onClick={() => handleGenerate('continue')} disabled={isGenerating} className={`w-full px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-30 ${isDark ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                {isGenerating && genMode === 'continue' ? <div className={`w-5 h-5 border-3 rounded-full animate-spin ${isDark ? 'border-slate-400 border-t-indigo-600' : 'border-white/30 border-t-white'}`}></div> : <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m12 19 7-7-7-7"/><path d="M5 19l7-7-7-7"/></svg>Expand Script</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
