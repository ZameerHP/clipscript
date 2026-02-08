
import React, { useState, useRef } from 'react';
import { generateSpeech, decodeBase64, decodeAudioData, pcmToWav } from '../services/geminiService';

const VOICES = [
  { id: 'Kore', name: 'Kore', desc: 'Warm Male', icon: '👨' },
  { id: 'Puck', name: 'Puck', desc: 'Playful Female', icon: '👧' },
  { id: 'Charon', name: 'Charon', desc: 'Deep Male', icon: '🧔' },
  { id: 'Fenrir', name: 'Fenrir', desc: 'Active Male', icon: '🐺' },
  { id: 'Zephyr', name: 'Zephyr', desc: 'Soft Female', icon: '🌬️' },
];

interface Props {
  initialText?: string;
  theme: 'dark' | 'light';
}

const SpeechGenerator: React.FC<Props> = ({ initialText = '', theme }) => {
  const [text, setText] = useState(initialText);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastAudioBlob, setLastAudioBlob] = useState<Blob | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  React.useEffect(() => {
    if (initialText) setText(initialText);
  }, [initialText]);

  const handleSpeech = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setLastAudioBlob(null);
    try {
      const base64Audio = await generateSpeech(text, selectedVoice);
      const audioBytes = decodeBase64(base64Audio);
      const wavBlob = pcmToWav(audioBytes, 24000);
      setLastAudioBlob(wavBlob);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      if (sourceRef.current) { try { sourceRef.current.stop(); } catch(e) {} }
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      sourceRef.current = source;
      source.start(0);
      setIsPlaying(true);
    } catch (error) {
      alert("Speech failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="tts-section" className="w-full mt-32">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black font-outfit mb-4 tracking-tighter">Audio <span className="text-cyan-500">Lab</span></h2>
        <p className={`max-w-xl mx-auto font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Advanced neural speech synthesis for your generated masterpieces.</p>
      </div>

      <div className={`glass-card p-10 rounded-[3rem] border shadow-2xl transition-all ${theme === 'dark' ? 'border-cyan-500/10' : 'border-cyan-500/20'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Voice Selection */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-900'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              Casting Room
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`flex items-center gap-4 p-5 rounded-2xl transition-all border text-left group ${
                    selectedVoice === voice.id 
                      ? 'bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/20' 
                      : (theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5')
                  }`}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{voice.icon}</span>
                  <div>
                    <span className={`block font-black text-sm ${selectedVoice === voice.id ? 'text-cyan-500' : (theme === 'dark' ? 'text-white' : 'text-slate-900')}`}>{voice.name}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{voice.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-900'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              Input Score
            </h3>
            <div className="relative flex-grow">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ready for transcription..."
                className={`w-full h-full min-h-[350px] bg-transparent border rounded-[2rem] p-8 outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none text-xl leading-relaxed font-medium ${theme === 'dark' ? 'border-white/10 text-slate-200 placeholder:text-slate-700' : 'border-black/5 text-slate-800 placeholder:text-slate-300'}`}
              />
              <div className="absolute bottom-6 right-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 opacity-50">
                {text.length} UNITS
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSpeech}
                disabled={isGenerating || !text.trim()}
                className="flex-grow bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-white hover:scale-[1.02] transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : "Execute Synthesis"}
              </button>
              
              {lastAudioBlob && (
                <button
                  onClick={() => {
                    const url = URL.createObjectURL(lastAudioBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `storyai-${selectedVoice.toLowerCase()}.wav`;
                    a.click();
                  }}
                  className={`px-8 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/5 text-slate-900'}`}
                >
                  Download
                </button>
              )}
            </div>
            
            {isPlaying && (
              <div className="flex items-center gap-2 justify-center py-4 bg-cyan-500/5 rounded-[2rem]">
                {[...Array(16)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-cyan-500 rounded-full animate-bounce" 
                    style={{ 
                      height: `${Math.random() * 30 + 10}px`,
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: '0.4s'
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechGenerator;
