
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Generator from './components/Generator';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import SpeechGenerator from './components/SpeechGenerator';
import Auth from './components/Auth';
import Pricing from './components/Pricing';
import BillingDashboard from './components/BillingDashboard';
import { dbService } from './services/dbService';
import { GeneratedContent, StoryType, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'billing'>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [userLibrary, setUserLibrary] = useState<(GeneratedContent & { id: string })[]>([]);
  const [selectedType, setSelectedType] = useState<StoryType | null>(null);
  const [ttsContent, setTtsContent] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const ttsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('clipscript_session');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadUserLibrary(parsedUser.id);
      dbService.getUserById(parsedUser.id).then(u => {
        if (u) {
          setUser(u);
          localStorage.setItem('clipscript_session', JSON.stringify(u));
        }
      });
    }
    
    const savedTheme = localStorage.getItem('clipscript_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    } else {
      document.body.className = 'dark';
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('clipscript_theme', newTheme);
  };

  const loadUserLibrary = async (userId: string) => {
    setIsSyncing(true);
    const stories = await dbService.getStoriesByUser(userId);
    setUserLibrary(stories);
    setIsSyncing(false);
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('clipscript_session', JSON.stringify(newUser));
    loadUserLibrary(newUser.id);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setUserLibrary([]);
    setView('home');
    localStorage.removeItem('clipscript_session');
  };

  const addToHistory = async (content: GeneratedContent) => {
    if (!user) return;
    setIsSyncing(true);
    await dbService.saveStory(user.id, content);
    await loadUserLibrary(user.id);
    setIsSyncing(false);
  };

  const scrollToGenerator = (type?: StoryType) => {
    if (view !== 'home') setView('home');
    if (!user) {
      setAuthInitialMode('signup');
      setIsAuthOpen(true);
      return;
    }
    if (type) setSelectedType(type);
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const scrollToTts = (content?: string) => {
    if (view !== 'home') setView('home');
    if (!user) {
      setAuthInitialMode('login');
      setIsAuthOpen(true);
      return;
    }
    if (content) setTtsContent(content);
    setTimeout(() => ttsScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleCreditsUpdated = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, credits: newBalance };
      setUser(updatedUser);
      localStorage.setItem('clipscript_session', JSON.stringify(updatedUser));
    }
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 theme-transition ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        {theme === 'dark' ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[0%] right-[-5%] w-[35%] h-[35%] bg-blue-600/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[0%] right-[-5%] w-[45%] h-[45%] bg-blue-200/30 blur-[100px] rounded-full"></div>
          </>
        )}
      </div>

      <Navbar 
        user={user}
        theme={theme}
        onThemeToggle={toggleTheme}
        onLoginClick={() => openAuth('login')}
        onLogoutClick={handleLogout}
        onStartClick={() => scrollToGenerator()} 
        onTtsClick={() => scrollToTts()} 
        onPricingClick={() => setIsPricingOpen(true)}
        onBillingClick={() => setView('billing')}
        onHomeClick={() => setView('home')}
      />
      
      <main className="pt-16">
        {view === 'home' ? (
          <>
            <Hero onStartClick={() => scrollToGenerator()} />
            
            <div ref={scrollRef} className="max-w-6xl mx-auto px-4 py-20">
              {user && (
                <div className="mb-6 flex items-center justify-between px-4">
                   <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                       {isSyncing ? 'Syncing...' : 'Connected'}
                     </span>
                   </div>
                   <div className="flex gap-4">
                     <button onClick={() => setIsPricingOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:underline">
                        Add Credits
                     </button>
                     {userLibrary.length > 0 && (
                       <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                         {userLibrary.length} Library Items
                       </span>
                     )}
                   </div>
                </div>
              )}

              <Generator 
                onGenerated={addToHistory} 
                history={userLibrary} 
                theme={theme}
                user={user}
                onCreditsUpdated={handleCreditsUpdated}
                onBuyCreditsClick={() => setIsPricingOpen(true)}
                externalTypeSelection={selectedType}
                onSelectionHandled={() => setSelectedType(null)}
                onSendToTts={scrollToTts}
              />

              <div ref={ttsScrollRef}>
                <SpeechGenerator initialText={ttsContent} theme={theme} />
              </div>
            </div>

            <Features onSelectType={(type) => scrollToGenerator(type)} theme={theme} />
            <HowItWorks theme={theme} />
          </>
        ) : (
          <BillingDashboard 
            user={user} 
            theme={theme} 
            onCreditsUpdated={handleCreditsUpdated} 
          />
        )}
      </main>

      <Footer theme={theme} />

      <Auth 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin}
        theme={theme}
        initialMode={authInitialMode}
      />

      <Pricing
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        user={user}
        theme={theme}
        onCreditsUpdated={handleCreditsUpdated}
      />
    </div>
  );
};

export default App;
