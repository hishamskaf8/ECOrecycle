
import React, { useState, useRef } from 'react';
import { Language, WasteAnalysisResult, ChatMessage } from './types';
import { translations } from './i18n';
import { LanguageToggle } from './components/LanguageToggle';
import { StatsView } from './components/StatsView';
import { analyzeWasteImage, getChatResponse, generateSpeech, decodeBase64Audio } from './services/geminiService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('fr');
  const [activeTab, setActiveTab] = useState<'home' | 'scanner' | 'chat' | 'stats'>('home');
  const [analysisResult, setAnalysisResult] = useState<WasteAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await analyzeWasteImage(base64, lang);
        setAnalysisResult(result);
      } catch (err) {
        console.error("Analysis failed:", err);
        setError(lang === 'ar' ? "فشل الاتصال بمحرك الذكاء الاصطناعي. تأكد من إعدادات النشر." : "Échec de connexion au moteur d'IA. Vérifiez les paramètres de déploiement.");
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
    setError(null);
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    try {
      const aiResponse = await getChatResponse(userMsg, lang);
      setChatMessages(prev => [...prev, { role: 'model', text: aiResponse || '' }]);
    } catch (err) {
      setError(lang === 'ar' ? "تعذر الحصول على رد من المساعد." : "Impossible d'obtenir une réponse de l'assistant.");
    } finally {
      setIsChatting(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const base64Audio = await generateSpeech(text, lang);
      const audioBuffer = await decodeBase64Audio(base64Audio);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (err) {
      setIsSpeaking(false);
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center text-center py-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative group cursor-pointer" onClick={() => setActiveTab('scanner')}>
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000"></div>
        <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800" alt="Recycling" className="relative rounded-3xl shadow-2xl w-full max-w-4xl object-cover h-[400px]" />
      </div>
      <div className="max-w-2xl space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
          {t.heroTitle}
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          {t.heroDesc}
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <button 
            onClick={() => setActiveTab('scanner')}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95"
          >
            {t.startScanning}
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className="px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-600 rounded-2xl font-bold text-lg shadow-sm hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95"
          >
            {t.askAi}
          </button>
        </div>
      </div>
    </div>
  );

  const renderScanner = () => (
    <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-slate-800">{t.analysisTitle}</h2>
        <p className="text-slate-600">{t.analysisDesc}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-slate-200 rounded-3xl bg-white hover:border-emerald-400 transition-colors cursor-pointer group"
             onClick={() => fileInputRef.current?.click()}>
          <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileUpload} />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 group-hover:text-emerald-500 mb-4 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xl font-medium text-slate-700">{t.uploadBtn}</p>
        </div>

        <div className="min-h-[300px] flex flex-col justify-center">
          {isAnalyzing ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium animate-pulse">{t.scanningText}</p>
            </div>
          ) : analysisResult ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 space-y-6 animate-in slide-in-from-right-4">
              <div>
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  {analysisResult.category}
                </span>
                <h3 className="text-3xl font-bold text-slate-800">{analysisResult.item}</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-bold text-slate-700 mb-1">{lang === 'ar' ? 'التعليمات' : 'Instructions'}</h4>
                  <p className="text-slate-600 leading-relaxed">{analysisResult.instructions}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-bold text-blue-700 mb-1">{lang === 'ar' ? 'الأثر البيئي' : 'Impact Environnemental'}</h4>
                  <p className="text-blue-600 leading-relaxed">{analysisResult.impact}</p>
                </div>
              </div>
              <button 
                onClick={() => handleSpeak(`${analysisResult.item}. ${analysisResult.instructions}`)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                disabled={isSpeaking}
              >
                {isSpeaking ? '...' : t.speakResult}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 13a3 3 0 110-6 3 3 0 010 6z" />
              </svg>
              <p>{lang === 'ar' ? 'بانتظار الصورة...' : 'En attente d\'image...'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="max-w-4xl mx-auto py-12 flex flex-col h-[700px] animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">{t.chatTitle}</h2>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-lg text-center px-4">{lang === 'ar' ? 'ابدأ محادثة مع خبيرنا البيئي حول الاستدامة' : 'Commencez une conversation sur la durabilité'}</p>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-6 py-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'} shadow-sm`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => handleSpeak(msg.text)}
                    className="mt-2 text-xs opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                    {t.speakResult}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-6 py-4 rounded-2xl rounded-tl-none animate-pulse flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-100 flex gap-4 bg-slate-50">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={t.chatPlaceholder}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isChatting}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{t.title}</h1>
              <p className="text-xs text-slate-500 font-medium">{t.subtitle}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setActiveTab('home')} className={`font-semibold transition-colors ${activeTab === 'home' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}>{t.navHome}</button>
            <button onClick={() => setActiveTab('scanner')} className={`font-semibold transition-colors ${activeTab === 'scanner' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}>{t.navScanner}</button>
            <button onClick={() => setActiveTab('chat')} className={`font-semibold transition-colors ${activeTab === 'chat' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}>{t.navChat}</button>
            <button onClick={() => setActiveTab('stats')} className={`font-semibold transition-colors ${activeTab === 'stats' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}>{t.navStats}</button>
          </div>

          <LanguageToggle current={lang} onToggle={setLang} />
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-6">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'scanner' && renderScanner()}
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'stats' && <StatsView lang={lang} />}
      </main>

      <footer className="py-12 bg-white border-t border-slate-100 mt-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">{t.footerText}</p>
          </div>
          <div className="flex gap-6 text-sm font-bold text-slate-400">
            <span className="text-emerald-600">Powered by Gemini 3 Flash</span>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 glass border border-slate-200/50 rounded-full px-4 py-2 flex items-center gap-6 shadow-2xl z-50">
        <button onClick={() => setActiveTab('home')} className={`p-2 rounded-full ${activeTab === 'home' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button onClick={() => setActiveTab('scanner')} className={`p-2 rounded-full ${activeTab === 'scanner' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
        </button>
        <button onClick={() => setActiveTab('chat')} className={`p-2 rounded-full ${activeTab === 'chat' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
        <button onClick={() => setActiveTab('stats')} className={`p-2 rounded-full ${activeTab === 'stats' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default App;
