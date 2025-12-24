import React, { useState, useRef, useEffect } from 'react';
import { Language, Theme, WasteAnalysisResult, ChatMessage } from './types';
import { translations } from './i18n';
import { LanguageToggle } from './components/LanguageToggle';
import { ThemeToggle } from './components/ThemeToggle';
import { StatsView } from './components/StatsView';
import { InteractiveView } from './components/InteractiveView';
import { 
  analyzeWasteImage, 
  getChatResponse 
} from './services/geminiService';

// Icons Components for Navigation - Increased size from w-4 h-4 to w-6 h-6
const HomeIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const ScannerIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 002 2z"/></svg>;
const ChatIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>;
const DiscoverIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.414 1.414a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022l-1.414-1.414z"/></svg>;
const InteractiveIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeTab, setActiveTab] = useState<'home' | 'scanner' | 'chat' | 'stats' | 'about' | 'interactive'>('home');
  const [showDiscoverMenu, setShowDiscoverMenu] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WasteAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  
  const t = translations[lang];
  const logoUrl = "https://i.pinimg.com/1200x/3f/29/3e/3f293e41cd69ba2bd0041979dd9b7c9d.jpg";
  const heroImageUrl = "https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const desktopDiscoverRef = useRef<HTMLDivElement>(null);
  const mobileDiscoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatting]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!desktopDiscoverRef.current?.contains(target) && !mobileDiscoverRef.current?.contains(target)) {
        setShowDiscoverMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAnalyzing(true);
    setApiKeyError(false);
    setAnalysisResult(null); 
    stopSpeaking();
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await analyzeWasteImage(base64, lang);
        setAnalysisResult(result);
      } catch (err: any) {
        console.error(err);
        if (err.message === "config_error") setApiKeyError(true);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);
    
    try {
      const aiResponse = await getChatResponse(userMsg, lang);
      setChatMessages(prev => [...prev, { role: 'model', text: aiResponse || '' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className={line.trim() === '' ? 'h-3' : 'mb-1'}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-extrabold text-emerald-600 dark:text-emerald-400">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  const startSpeaking = () => {
    if (!analysisResult) return;
    const textToRead = lang === 'ar' 
      ? `هذا العنصر هو ${analysisResult.item}. الفئة: ${analysisResult.category}. التعليمات: ${analysisResult.instructions}. التأثير: ${analysisResult.impact}. يستغرق التحلل حوالي ${analysisResult.decompositionTime}. نصيحة للتدوير المنزلي: ${analysisResult.diyTip}`
      : `Cet objet est un ${analysisResult.item}. Catégorie: ${analysisResult.category}. Instructions: ${analysisResult.instructions}. Impact: ${analysisResult.impact}. Temps de décomposition: ${analysisResult.decompositionTime}. Astuce DIY: ${analysisResult.diyTip}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
    utterance.onend = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const resetScanner = () => {
    setAnalysisResult(null);
    stopSpeaking();
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (captureInputRef.current) captureInputRef.current.value = '';
  };

  const isDiscoverActive = activeTab === 'stats' || activeTab === 'about' || activeTab === 'interactive';

  const renderDesktopNav = (id: string, Icon: React.FC) => (
    <button 
      key={id}
      onClick={() => { setActiveTab(id as any); setShowDiscoverMenu(false); }} 
      className={`relative group px-5 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-500 flex items-center gap-3 overflow-hidden ${
        activeTab === id 
        ? 'bg-emerald-700 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)]' 
        : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-500/5 hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.2)]'
      }`}
    >
      <div className={`transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${activeTab === id ? 'animate-pulse' : ''}`}>
        <Icon />
      </div>
      <span>{translations[lang][`nav${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof typeof t]}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white ${lang === 'ar' ? 'rtl font-arabic' : 'ltr font-jakarta'}`}>
      
      {apiKeyError && (
        <div className="bg-red-600 text-white text-center p-3 text-sm font-bold animate-pulse z-[100]">
          {lang === 'ar' ? "⚠️ تنبيه: مفتاح API غير مضبوط" : "⚠️ Alert: API_KEY is missing"}
        </div>
      )}

      <header className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-slate-800 shadow-md">
        <nav className="container mx-auto h-16 md:h-20 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
            <img src={logoUrl} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-md transition-transform hover:scale-110" />
            <h1 className="text-lg md:text-xl font-black">{t.title}</h1>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 mx-4">
            {renderDesktopNav('home', HomeIcon)}
            {renderDesktopNav('scanner', ScannerIcon)}
            {renderDesktopNav('chat', ChatIcon)}
            
            <div className="relative" ref={desktopDiscoverRef}>
              <button 
                onClick={() => setShowDiscoverMenu(!showDiscoverMenu)}
                className={`relative group px-5 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-500 flex items-center gap-3 overflow-hidden ${
                  isDiscoverActive 
                  ? 'bg-emerald-700 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)]' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-500/5 hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.2)]'
                }`}
              >
                <div className="group-hover:animate-bounce">
                  <DiscoverIcon />
                </div>
                {t.navDiscover}
                <svg className={`w-3 h-3 transition-transform duration-500 ${showDiscoverMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
              </button>
              
              {showDiscoverMenu && (
                <div className="absolute top-full mt-3 right-0 w-56 glass border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
                  <button onClick={() => { setActiveTab('interactive'); setShowDiscoverMenu(false); }} className={`w-full text-right px-4 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-between group ${activeTab === 'interactive' ? 'bg-emerald-600/20 text-emerald-600' : 'hover:bg-emerald-500/10'}`}>
                    {t.navInteractive}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><InteractiveIcon /></div>
                  </button>
                  <button onClick={() => { setActiveTab('stats'); setShowDiscoverMenu(false); }} className={`w-full text-right px-4 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-between group ${activeTab === 'stats' ? 'bg-emerald-600/20 text-emerald-600' : 'hover:bg-emerald-500/10'}`}>
                    {t.navStats}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><ScannerIcon /></div>
                  </button>
                  <button onClick={() => { setActiveTab('about'); setShowDiscoverMenu(false); }} className={`w-full text-right px-4 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-between group ${activeTab === 'about' ? 'bg-emerald-600/20 text-emerald-600' : 'hover:bg-emerald-500/10'}`}>
                    {t.navAbout}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><HomeIcon /></div>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle current={theme} onToggle={setTheme} />
            <LanguageToggle current={lang} onToggle={setLang} />
          </div>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-8 py-6 md:py-12 relative z-10">
        {activeTab === 'home' && (
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <h1 className="text-4xl md:text-7xl font-black leading-tight">
                {t.heroTitle.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? "text-emerald-600 dark:text-emerald-400 block" : "block"}>{word}</span>
                ))}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">{t.heroDesc}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={() => setActiveTab('scanner')} className="px-10 py-5 bg-emerald-700 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-800 transition-all hover:scale-105 active:scale-95">{t.startScanning}</button>
                <button onClick={() => setActiveTab('chat')} className="px-10 py-5 glass border-2 border-emerald-700 rounded-2xl font-black hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-white transition-all hover:scale-105 active:scale-95">{t.askAi}</button>
              </div>
            </div>
            <div className="flex-1 w-full max-w-xl">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-slate-200 dark:border-slate-800 floating transition-transform hover:rotate-2">
                <img src={heroImageUrl} alt="Eco Spirit" className="w-full aspect-square object-cover" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="max-w-6xl mx-auto space-y-12 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-6xl font-black tracking-tighter">{t.analysisTitle}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">{t.analysisDesc}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                {!analysisResult ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => fileInputRef.current?.click()} className="group h-48 glass rounded-[2.5rem] border-2 border-dashed border-emerald-500 flex flex-col items-center justify-center transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileUpload} />
                      <svg className="w-12 h-12 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <span className="font-black text-sm uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{t.uploadBtn}</span>
                    </button>
                    <button onClick={() => captureInputRef.current?.click()} className="group h-48 bg-emerald-700 text-white rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-emerald-800 shadow-xl transition-all hover:scale-[1.02]">
                      <input type="file" hidden ref={captureInputRef} accept="image/*" capture="environment" onChange={handleFileUpload} />
                      <svg className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      <span className="font-black text-sm uppercase tracking-widest">{t.captureBtn}</span>
                    </button>
                  </div>
                ) : (
                  <div className="glass rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                      <svg className="w-10 h-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h3 className="text-xl font-bold">{lang === 'ar' ? 'اكتمل التحليل' : 'Analyse terminée'}</h3>
                    <button onClick={resetScanner} className="w-full py-4 bg-slate-900 dark:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                      {t.resetBtn}
                    </button>
                  </div>
                )}
              </div>
              <div className="glass rounded-[3rem] p-6 md:p-10 min-h-[500px] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-all overflow-hidden relative">
                {isAnalyzing ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 border-8 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-2xl font-black animate-pulse">{t.scanningText}</p>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start animate-in fade-in slide-in-from-top duration-500">
                      <div className="space-y-2">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase border border-emerald-500/20 tracking-wider">
                          <svg className="w-3 h-3 animate-ping" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>
                          {analysisResult.category}
                        </span>
                        <h3 className="text-3xl md:text-5xl font-black mt-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">{analysisResult.item}</h3>
                      </div>
                      <button 
                        onClick={isSpeaking ? stopSpeaking : startSpeaking}
                        className={`p-4 rounded-2xl transition-all shadow-lg hover:scale-110 active:scale-95 ${isSpeaking ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400'}`}
                      >
                        {isSpeaking ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                        )}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-6 glass bg-slate-100 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 animate-in fade-in slide-in-from-bottom duration-500 delay-100 group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 group-hover:scale-110 transition-transform">
                            <HomeIcon />
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{lang === 'ar' ? 'التعليمات' : 'Instructions'}</p>
                        </div>
                        <p className="font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">{analysisResult.instructions}</p>
                      </div>

                      <div className="p-6 glass bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-200 dark:border-blue-700/50 transition-all hover:bg-blue-100/30 animate-in fade-in slide-in-from-bottom duration-500 delay-200 group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-500 group-hover:scale-110 transition-transform">
                            <ScannerIcon />
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest text-blue-500">{lang === 'ar' ? 'الأثر البيئي' : 'Impact'}</p>
                        </div>
                        <p className="text-blue-800 dark:text-blue-100 font-bold leading-relaxed">{analysisResult.impact}</p>
                      </div>

                      <div className="p-6 glass bg-amber-50/50 dark:bg-amber-900/10 rounded-3xl border border-amber-200 dark:border-amber-700/50 transition-all hover:bg-amber-100/30 animate-in fade-in slide-in-from-bottom duration-500 delay-300 group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-500 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest text-amber-500">{t.decompositionLabel}</p>
                        </div>
                        <p className="text-amber-800 dark:text-amber-100 font-black text-xl tracking-tight">{analysisResult.decompositionTime}</p>
                      </div>

                      <div className="p-6 glass bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-200 dark:border-indigo-700/50 transition-all hover:bg-indigo-100/30 animate-in fade-in slide-in-from-bottom duration-500 delay-400 group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 group-hover:scale-110 transition-transform">
                            <DiscoverIcon />
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest text-indigo-500">{t.diyLabel}</p>
                        </div>
                        <p className="text-indigo-800 dark:text-indigo-100 font-bold leading-relaxed">{analysisResult.diyTip}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-6">
                    <div className="relative">
                      <svg className="w-24 h-24 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-12 h-12 opacity-40 animate-pulse text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      </div>
                    </div>
                    <p className="text-xl font-black uppercase tracking-[0.2em] text-center max-w-[200px] leading-relaxed opacity-60">
                      {lang === 'ar' ? 'بانتظار مساهمتك في حماية الكوكب' : 'En attente de votre contribution'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto h-[600px] flex flex-col animate-in fade-in duration-500 overflow-hidden">
            <div className="flex-1 glass rounded-[2.5rem] md:rounded-[3rem] flex flex-col overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
                {chatMessages.length === 0 && !isChatting && (
                   <div className="h-full flex flex-col items-center justify-center text-center px-4">
                     <div className="relative mb-8">
                       <img src={logoUrl} className="w-24 h-24 rounded-3xl shadow-2xl relative z-10" />
                       <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                     </div>
                     <div className="max-w-md p-6 glass rounded-[2rem] border border-emerald-500/10 shadow-lg animate-in zoom-in-95 duration-700">
                       <h4 className="text-xl md:text-2xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400">
                         {t.chatTitle}
                       </h4>
                       <p className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                         {t.chatIntro}
                       </p>
                     </div>
                   </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] md:max-w-[80%] px-5 py-3 md:px-6 md:py-4 rounded-[1.5rem] md:rounded-[2rem] text-sm md:text-base font-medium leading-relaxed ${msg.role === 'user' ? 'bg-emerald-700 text-white rounded-tr-none shadow-md' : 'glass bg-slate-200 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-tl-none shadow-sm'}`}>
                      {msg.role === 'model' ? formatMessage(msg.text) : msg.text}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-slate-200 dark:bg-slate-800 px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleChatSubmit} className="p-3 md:p-6 bg-slate-100/50 dark:bg-black/40 flex items-center gap-2 md:gap-3 border-t border-slate-200 dark:border-slate-800">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder={t.chatPlaceholder} 
                  disabled={isChatting}
                  className="flex-1 px-4 py-3 md:px-6 md:py-4 text-xs md:text-base rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-medium disabled:opacity-50 min-w-0" 
                />
                <button 
                  type="submit" 
                  disabled={isChatting || !chatInput.trim()} 
                  className="w-10 h-10 md:w-14 md:h-14 bg-emerald-700 text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-emerald-800 transition-all disabled:opacity-50 shadow-lg shrink-0 hover:rotate-12"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'interactive' && <InteractiveView lang={lang} />}
        {activeTab === 'stats' && <StatsView lang={lang} />}

        {activeTab === 'about' && (
          <div className="max-w-5xl mx-auto py-8 md:py-16 space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400">
                {t.aboutTitle}
              </h2>
              <p className="text-xl md:text-2xl font-bold text-slate-500 dark:text-slate-400">{t.aboutText}</p>
            </div>
            
            <div className="grid gap-8">
              <div className="glass p-8 md:p-14 rounded-[3rem] md:rounded-[4rem] shadow-xl border border-slate-200 dark:border-emerald-500/10 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600/30 group-hover:w-full transition-all duration-700 opacity-5"></div>
                <div className="space-y-4">
                   <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                     <span className="w-10 h-1 rounded-full bg-emerald-500"></span>
                     {lang === 'ar' ? 'حول سيمبيوز' : 'À propos de Symbiose'}
                   </h3>
                   <p className="text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{t.aboutBody}</p>
                </div>
                <div className="space-y-4">
                   <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                     <span className="w-10 h-1 rounded-full bg-blue-500"></span>
                     {lang === 'ar' ? 'أهدافنا وتطلعاتنا' : 'Objectifs et Aspirations'}
                   </h3>
                   <p className="text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{t.aboutGoals}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass p-8 md:p-12 rounded-[3rem] border border-slate-200 dark:border-emerald-500/10 transition-transform hover:scale-[1.02]">
                   <h3 className="text-xl md:text-2xl font-black mb-6 uppercase tracking-widest text-emerald-600">
                     {lang === 'ar' ? 'الفريق المطور' : 'Équipe de Développement'}
                   </h3>
                   <div className="space-y-3 whitespace-pre-line text-lg font-bold text-slate-800 dark:text-white">
                     {t.aboutDevelopers}
                   </div>
                </div>

                <div className="glass p-8 md:p-12 rounded-[3rem] border border-slate-200 dark:border-emerald-500/10 transition-transform hover:scale-[1.02]">
                   <h3 className="text-xl md:text-2xl font-black mb-6 uppercase tracking-widest text-blue-600">
                     {lang === 'ar' ? 'السياق الأكاديمي' : 'Contexte Académique'}
                   </h3>
                   <p className="text-base md:text-lg leading-relaxed font-medium text-slate-600 dark:text-slate-300">
                     {t.aboutIncubator}
                   </p>
                </div>
              </div>

              <div className="glass p-8 md:p-10 rounded-[2.5rem] border-2 border-red-500/10 bg-red-500/5 text-center">
                 <p className="text-sm md:text-base font-black text-red-600 dark:text-red-400 uppercase tracking-wide">
                   {t.aboutCopyright}
                 </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="lg:hidden fixed bottom-0 left-0 w-full glass border-t border-slate-200 dark:border-slate-800 z-50 p-2">
        <div className="flex justify-around items-center h-20 relative">
          {[
            { id: 'home', icon: HomeIcon },
            { id: 'scanner', icon: ScannerIcon },
            { id: 'chat', icon: ChatIcon },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id as any); setShowDiscoverMenu(false); }} 
              className={`p-4 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-emerald-700 text-white shadow-lg scale-110' : 'text-slate-400'}`}
            >
              <item.icon />
            </button>
          ))}
          
          <button 
            onClick={(e) => { e.stopPropagation(); setShowDiscoverMenu(!showDiscoverMenu); }} 
            className={`p-4 rounded-2xl transition-all duration-300 ${isDiscoverActive ? 'bg-emerald-700 text-white shadow-lg scale-110' : 'text-slate-400'}`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
          </button>

          {showDiscoverMenu && (
            <div ref={mobileDiscoverRef} className="absolute bottom-full left-0 w-full px-4 pb-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="glass border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                 <button 
                   onClick={() => { setActiveTab('interactive'); setShowDiscoverMenu(false); }}
                   className={`flex items-center justify-between p-5 rounded-2xl font-black uppercase tracking-widest transition-all ${activeTab === 'interactive' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-900'}`}
                 >
                   {t.navInteractive}
                   <InteractiveIcon />
                 </button>
                 <button 
                   onClick={() => { setActiveTab('stats'); setShowDiscoverMenu(false); }}
                   className={`flex items-center justify-between p-5 rounded-2xl font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-900'}`}
                 >
                   {t.navStats}
                   <ScannerIcon />
                 </button>
                 <button 
                   onClick={() => { setActiveTab('about'); setShowDiscoverMenu(false); }}
                   className={`flex items-center justify-between p-5 rounded-2xl font-black uppercase tracking-widest transition-all ${activeTab === 'about' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-900'}`}
                 >
                   {t.navAbout}
                   <HomeIcon />
                 </button>
              </div>
            </div>
          )}
        </div>
      </footer>

      <footer className="hidden lg:block py-12 mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-xl transition-transform hover:rotate-6" />
            <div>
              <p className="text-xl font-black">{t.title}</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t.footerText}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Symbiose AI 2025©</p>
        </div>
      </footer>
      <div className="h-20 lg:hidden" />
    </div>
  );
};

export default App;