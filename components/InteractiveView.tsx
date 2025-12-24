import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface WasteCategory {
  id: string;
  nameAr: string;
  nameFr: string;
  color: string;
  hoverColor: string;
  icon: string;
  tipAr: string;
  tipFr: string;
}

const categories: WasteCategory[] = [
  { id: 'plastic', nameAr: 'بلاستيك', nameFr: 'Plastique', color: 'bg-cyan-300', hoverColor: 'hover:bg-cyan-200', icon: '🥤', tipAr: 'استخدم قارورة مياه قابلة لإعادة التعبئة.', tipFr: 'Utilisez une gourde réutilisable.' },
  { id: 'paper', nameAr: 'ورق', nameFr: 'Papier', color: 'bg-slate-100', hoverColor: 'hover:bg-white', icon: '📄', tipAr: 'اطبع على الوجهين دائماً.', tipFr: 'Imprimez toujours en recto-verso.' },
  { id: 'metal', nameAr: 'معادن', nameFr: 'Métal', color: 'bg-rose-300', hoverColor: 'hover:bg-rose-200', icon: '🥫', tipAr: 'اشترِ المنتجات ذات التغليف المعدني البسيط.', tipFr: 'Achetez des produits avec peu d\'emballage métallique.' },
  { id: 'glass', nameAr: 'زجاج', nameFr: 'Verre', color: 'bg-emerald-300', hoverColor: 'hover:bg-emerald-200', icon: '🍾', tipAr: 'الزجاج يمكن تدويره إلى ما لا نهاية.', tipFr: 'Le verre est recyclable à l\'infini.' },
  { id: 'organic', nameAr: 'عضوي', nameFr: 'Organique', color: 'bg-amber-300', hoverColor: 'hover:bg-amber-200', icon: '🍎', tipAr: 'حول فضلات الطعام إلى سماد طبيعي.', tipFr: 'Transformez vos restes en compost.' },
  { id: 'electronic', nameAr: 'إلكترونيات', nameFr: 'Électronique', color: 'bg-indigo-300', hoverColor: 'hover:bg-indigo-200', icon: '🔋', tipAr: 'لا ترمِ البطاريات في القمامة العادية.', tipFr: 'Ne jetez jamais de piles dans la poubelle normale.' },
];

export const InteractiveView: React.FC<{ lang: Language }> = ({ lang }) => {
  const [mode, setMode] = useState<'adult' | 'child'>('adult');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeTip, setActiveTip] = useState<string | null>(null);
  const [isFeeding, setIsFeeding] = useState(false);
  const [robotState, setRobotState] = useState<'idle' | 'happy' | 'eating'>('idle');
  const [candiesToday, setCandiesToday] = useState(0);
  const [message, setMessage] = useState<string>('');
  const [isMoonMode, setIsMoonMode] = useState(false);
  const [activeColor, setActiveColor] = useState<string>('border-slate-300');
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('robot_muted') === 'true');
  
  const t = translations[lang] as any;

  useEffect(() => {
    const savedDate = localStorage.getItem('last_candy_date');
    const today = new Date().toDateString();
    if (savedDate !== today) {
      localStorage.setItem('last_candy_date', today);
      localStorage.setItem('candies_count', '0');
      setCounts({});
      setCandiesToday(0);
    } else {
      setCandiesToday(parseInt(localStorage.getItem('candies_count') || '0'));
    }
    
    if (mode === 'child') {
      const welcome = isMoonMode ? t.moonModeMsg : t.feedMe;
      setMessage(welcome);
      speak(welcome);
    } else {
      window.speechSynthesis.cancel();
    }
  }, [mode, lang, isMoonMode]);

  useEffect(() => {
    localStorage.setItem('robot_muted', isMuted.toString());
  }, [isMuted]);

  const speak = (text: string) => {
    // CRITICAL: Sound only works in child mode and when not muted
    if (isMuted || mode !== 'child') return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleAction = (cat: WasteCategory) => {
    setCounts(prev => ({ ...prev, [cat.id]: (prev[cat.id] || 0) + 1 }));
    setActiveTip(lang === 'ar' ? cat.tipAr : cat.tipFr);
    setIsFeeding(true);
    setActiveColor(cat.color.replace('bg-', 'border-'));
    
    if (mode === 'adult') {
      setTimeout(() => setIsFeeding(false), 1200);
    } else {
      setRobotState('eating');
      setTimeout(() => {
        setRobotState('happy');
        const phrases = t.robotPhrases;
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        
        if (candiesToday < 4) {
          const newCount = candiesToday + 1;
          setCandiesToday(newCount);
          localStorage.setItem('candies_count', newCount.toString());
          setMessage(randomPhrase);
          speak(randomPhrase);
        } else {
          setMessage(t.candyLimitReached);
          speak(t.candyLimitReached);
        }
        
        setIsFeeding(false);
        setTimeout(() => setRobotState('idle'), 4000);
      }, 1200);
    }
  };

  const toggleMoonMode = () => {
    const nextState = !isMoonMode;
    setIsMoonMode(nextState);
    if (nextState) {
      setMessage(t.moonModeMsg);
      speak(t.moonModeMsg);
    } else {
      setMessage(t.feedMe);
      speak(t.feedMe);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      speak(mode === 'child' ? t.feedMe : "");
    } else {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className={`relative min-h-[1000px] py-12 px-4 md:px-8 transition-all duration-[2.5s] rounded-[5rem] overflow-hidden ${mode === 'child' ? 'bg-gradient-to-br from-[#a78bfa] via-[#f472b6] to-[#818cf8]' : 'bg-transparent'}`}>
      
      {/* Background Ambience for Child Mode */}
      {mode === 'child' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse-glow"></div>
          {[...Array(40)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full animate-drift opacity-60 shadow-[0_0_15px_white]" 
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4}px`,
                height: `${Math.random() * 4}px`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Animation CSS */}
      <style>{`
        @keyframes scanGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(56, 189, 248, 0.4); }
          50% { text-shadow: 0 0 20px rgba(56, 189, 248, 0.8); }
        }
        .smart-bin-glow { animation: scanGlow 2s ease-in-out infinite; }
        .robot-hover { animation: bounceSlow 5s ease-in-out infinite; }
        .belly-text { animation: textGlow 3s ease-in-out infinite; }
      `}</style>

      {/* Mode Selectors */}
      <div className="relative z-40 max-w-sm mx-auto mb-32 flex glass p-2 rounded-full border-2 border-white/40 shadow-2xl backdrop-blur-xl">
        <button 
          onClick={() => setMode('adult')}
          className={`flex-1 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-700 ${mode === 'adult' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-600 hover:text-emerald-500'}`}
        >
          {t.adultMode}
        </button>
        <button 
          onClick={() => setMode('child')}
          className={`flex-1 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-700 ${mode === 'child' ? 'bg-sky-400 text-white shadow-xl' : 'text-slate-600 hover:text-sky-500'}`}
        >
          {t.childMode}
        </button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
        
        {/* Visual Section (Bin or Robot) */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[600px]">
          
          {mode === 'adult' ? (
            /* Premium Smart Bin */
            <div className={`relative w-72 h-[450px] transition-all duration-700 ${isFeeding ? 'scale-110' : 'scale-100'}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 rounded-[3.5rem] shadow-2xl border-x-4 border-t-2 border-white/20"></div>
              <div className="absolute inset-x-8 top-20 bottom-12 bg-slate-900/10 dark:bg-black/20 rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center overflow-hidden">
                <div className="text-4xl opacity-20 filter grayscale mb-4">♻️</div>
                {isFeeding && (
                   <div className={`absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent animate-pulse`}></div>
                )}
              </div>
              <div className={`absolute -top-6 inset-x-4 h-16 bg-slate-300 dark:bg-slate-600 rounded-[2rem] border-b-8 border-slate-500 dark:border-slate-800 shadow-xl flex items-center justify-center transition-colors duration-500 ${isFeeding ? activeColor : 'border-slate-400'}`}>
                <div className={`w-3/4 h-2 rounded-full smart-bin-glow ${isFeeding ? activeColor.replace('border-', 'bg-') : 'bg-slate-400 dark:bg-slate-800'}`}></div>
              </div>
              <div className="absolute bottom-16 right-10 w-4 h-12 flex flex-col gap-1">
                 <div className={`w-2 h-2 rounded-full ${isFeeding ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`}></div>
                 <div className="w-2 h-2 rounded-full bg-blue-500/40"></div>
              </div>
              {isFeeding && (
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 text-7xl animate-bounce drop-shadow-2xl">🗑️</div>
              )}
            </div>
          ) : (
            /* Child Mode Robot - Text moved to Belly */
            <div className="flex flex-col items-center relative group">
              
              {/* MUTE TOGGLE - Always visible in child mode corner */}
              <button 
                onClick={toggleMute}
                className={`absolute top-[-5rem] right-0 z-50 p-4 rounded-full glass border-2 transition-all duration-500 hover:scale-110 shadow-lg ${isMuted ? 'border-rose-400 text-rose-400' : 'border-white/60 text-white'}`}
                title={isMuted ? (lang === 'ar' ? "تشغيل الصوت" : "Activer le son") : (lang === 'ar' ? "إيقاف الصوت" : "Couper le son")}
              >
                {isMuted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                )}
              </button>

              {/* The Robot */}
              <div className={`relative robot-hover transition-all duration-1000 ${isMoonMode ? 'filter drop-shadow-[0_0_50px_rgba(255,255,255,0.7)]' : ''}`}>
                <div className={`relative w-80 h-[450px] transition-all duration-500 ${isFeeding ? 'scale-110' : 'scale-100'}`}>
                  
                  {/* Body with Integrated Display Screen (Belly) */}
                  <div className="absolute bottom-0 inset-x-4 h-60 bg-white rounded-[5rem] shadow-2xl border-[10px] border-sky-400 overflow-hidden flex items-center justify-center p-8">
                     {/* Digital Screen Overlay */}
                     <div className="absolute inset-4 bg-sky-50/50 rounded-[3rem] border-2 border-sky-100/50 shadow-inner flex items-center justify-center p-4">
                        <p className={`text-center font-black text-sky-900 leading-tight belly-text transition-all duration-500 ${message.length > 40 ? 'text-sm' : 'text-base md:text-lg'}`}>
                           {message || t.feedMe}
                        </p>
                     </div>
                     {/* Subtle Glow Effect behind text */}
                     <div className="w-32 h-32 bg-sky-400/5 rounded-full blur-2xl animate-pulse"></div>
                  </div>

                  {/* Head - Fully visible, never hidden by text */}
                  <div className={`absolute top-0 inset-x-6 h-52 bg-white rounded-[4.5rem] shadow-xl border-[10px] border-sky-400 transition-all duration-500 ${robotState === 'eating' ? 'translate-y-6 rotate-2' : ''}`}>
                    <div className="absolute top-16 inset-x-10 flex justify-between">
                       <div className="w-14 h-14 bg-indigo-950 rounded-full relative overflow-hidden">
                          <div className={`absolute w-5 h-5 bg-white rounded-full top-2 left-2 transition-all ${robotState === 'happy' ? 'scale-y-50' : ''}`}></div>
                       </div>
                       <div className="w-14 h-14 bg-indigo-950 rounded-full relative overflow-hidden">
                          <div className={`absolute w-5 h-5 bg-white rounded-full top-2 right-2 transition-all ${robotState === 'happy' ? 'scale-y-50' : ''}`}></div>
                       </div>
                    </div>
                    <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 w-12 h-2 bg-indigo-950 rounded-full transition-all duration-300 ${robotState === 'eating' ? 'h-16 w-20 rounded-[2rem]' : robotState === 'happy' ? 'h-8 w-24 rounded-t-none rounded-b-full bg-rose-400' : ''}`}></div>
                  </div>

                  {/* Hands */}
                  <div className={`absolute -left-4 top-48 w-8 h-24 bg-sky-500 rounded-full transition-all ${robotState === 'happy' ? '-rotate-[150deg] -translate-y-12' : 'rotate-12'}`}></div>
                  <div className={`absolute -right-4 top-48 w-8 h-24 bg-sky-500 rounded-full transition-all ${robotState === 'happy' ? 'rotate-[150deg] -translate-y-12' : '-rotate-12'}`}></div>
                </div>

                {robotState === 'happy' && candiesToday <= 4 && (
                  <div className="absolute -top-40 left-1/2 -translate-x-1/2 text-9xl animate-bounce filter drop-shadow-2xl">🍬</div>
                )}
              </div>
            </div>
          )}

          {/* Counts Matrix */}
          <div className="mt-20 flex flex-wrap justify-center gap-4">
            {categories.map(cat => (
              <div key={cat.id} className={`px-8 py-3 rounded-3xl flex items-center gap-4 border-2 shadow-xl transition-all ${mode === 'child' ? 'bg-white/10 border-white/30 text-white backdrop-blur-md' : 'glass border-slate-100 dark:border-slate-800'}`}>
                <span className="text-3xl">{cat.icon}</span>
                <span className="font-black text-2xl">{counts[cat.id] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex-1 space-y-10 w-full">
          <div className="space-y-4 text-center lg:text-left">
            <h2 className={`text-5xl md:text-7xl font-black tracking-tighter ${mode === 'child' ? 'text-white' : ''}`}>{t.interactiveTitle}</h2>
            {activeTip && (
              <div className={`p-10 rounded-[3rem] border-4 shadow-2xl animate-in zoom-in-95 ${mode === 'child' ? 'bg-white/30 border-white/50 text-white backdrop-blur-md' : 'glass border-emerald-500/20 bg-emerald-500/5'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">{t.wasteReductionTip}</p>
                <p className="text-2xl font-bold italic leading-relaxed">"{activeTip}"</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => handleAction(cat)}
                disabled={isFeeding}
                className={`group relative p-8 rounded-[3rem] border-4 transition-all duration-500 flex flex-col items-center justify-center gap-4 hover:scale-105 active:scale-95 shadow-2xl ${mode === 'child' ? 'bg-white/10 border-white/20 hover:border-white hover:bg-white/30' : 'glass border-slate-100 dark:border-slate-800 hover:border-emerald-500'}`}
              >
                <div className={`w-20 h-20 rounded-2xl ${cat.color} ${cat.hoverColor} flex items-center justify-center text-5xl shadow-xl transition-transform group-hover:rotate-12`}>
                  {cat.icon}
                </div>
                <span className={`font-black text-[10px] uppercase tracking-widest text-center ${mode === 'child' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {lang === 'ar' ? cat.nameAr : cat.nameFr}
                </span>
              </button>
            ))}
          </div>

          {/* Moon Children Card */}
          <button 
            onClick={toggleMoonMode}
            className={`w-full p-12 rounded-[4rem] border-4 shadow-3xl relative overflow-hidden group transition-all duration-1000 ${isMoonMode ? 'bg-gradient-to-br from-yellow-300 to-orange-400 border-white scale-[1.02]' : 'bg-white/10 border-white/30 hover:border-white'}`}
          >
            <div className={`absolute top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} p-8 opacity-30 group-hover:opacity-60 transition-opacity`}>
               <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c.132 0 .263 0 .393.007a9 9 0 0011.6 11.6 9 9 0 11-11.993-11.607z"/></svg>
            </div>
            <div className="relative z-10 space-y-4 text-right md:text-left">
              <h3 className={`text-3xl font-black flex items-center gap-4 ${isMoonMode ? 'text-sky-900' : 'text-white'}`}>
                <span className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${isMoonMode ? 'bg-sky-800 animate-spin' : 'bg-indigo-600'}`}>✨</span>
                {t.moonChildrenTitle}
              </h3>
              <p className={`text-lg font-medium leading-relaxed max-w-lg ${isMoonMode ? 'text-sky-900' : 'text-slate-50'}`}>
                {t.moonChildrenDesc}
              </p>
            </div>
          </button>

          {/* Progress */}
          {mode === 'child' && (
            <div className="flex flex-col items-center gap-8 p-10 glass bg-white/20 rounded-[4rem] border-2 border-white/40 shadow-inner">
              <div className="flex gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-16 h-16 rounded-3xl flex items-center justify-center text-4xl transition-all duration-1000 shadow-2xl ${i < candiesToday ? 'bg-gradient-to-br from-rose-400 to-pink-500 scale-110 rotate-12' : 'bg-white/10 opacity-20 grayscale scale-90'}`}>
                    🍬
                  </div>
                ))}
              </div>
              <p className="text-sm font-black uppercase tracking-[0.4em] text-white drop-shadow-md">
                {lang === 'ar' ? `هداياك: ${candiesToday} / 4` : `RÉCOMPENSES : ${candiesToday} / 4`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};