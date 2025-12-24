import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Language } from '../types';
import { translations } from '../i18n';

const globalWasteCompositionAr = [
  { name: 'طعام وعضوي', value: 44 },
  { name: 'ورق كرتون', value: 17 },
  { name: 'بلاستيك', value: 12 },
  { name: 'زجاج', value: 5 },
  { name: 'معادن', value: 4 },
  { name: 'أخرى', value: 18 },
];

const globalWasteCompositionFr = [
  { name: 'Bio-déchets', value: 44 },
  { name: 'Papier/Carton', value: 17 },
  { name: 'Plastique', value: 12 },
  { name: 'Verre', value: 5 },
  { name: 'Métal', value: 4 },
  { name: 'Autres', value: 18 },
];

const recyclingGapAr = [
  { name: 'إعادة تدوير', value: 19 },
  { name: 'طمر صحي', value: 37 },
  { name: 'حرق', value: 11 },
  { name: 'تخلص غير آمن', value: 33 },
];

const recyclingGapFr = [
  { name: 'Recyclé', value: 19 },
  { name: 'Décharge', value: 37 },
  { name: 'Incinéré', value: 11 },
  { name: 'Dépôt sauvage', value: 33 },
];

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];
const GAP_COLORS = ['#059669', '#d97706', '#e11d48', '#334155'];

export const StatsView: React.FC<{ lang: Language }> = ({ lang }) => {
  const compData = lang === 'ar' ? globalWasteCompositionAr : globalWasteCompositionFr;
  const gapData = lang === 'ar' ? recyclingGapAr : recyclingGapFr;
  const t = translations[lang];

  return (
    <div className="relative space-y-12 md:space-y-24 py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible min-h-screen">
      
      {/* Background Ambience - Layered Bokeh Glass */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Large Aura Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-[160px] animate-blob-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] max-w-[900px] bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-[180px] animate-blob-slow" style={{ animationDelay: '-10s' }}></div>
        
        {/* Floating Glass Sheets - Ultra Soft */}
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[40vh] glass rounded-[5rem] opacity-[0.03] dark:opacity-[0.02] blur-3xl animate-float-extra-slow"></div>
        <div className="absolute bottom-[20%] left-[5%] w-[40vw] h-[20vh] glass rounded-[4rem] opacity-[0.04] dark:opacity-[0.03] blur-3xl animate-drift"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-12 md:space-y-24">
        {/* Hero Banner */}
        <div className="text-center space-y-6 md:space-y-10 max-w-5xl mx-auto p-8 sm:p-12 md:p-20 glass rounded-[3rem] md:rounded-[6rem] shadow-sm border border-white/40 dark:border-white/5 shimmer-effect">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-500/5 dark:bg-white/5 backdrop-blur-md rounded-full border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              {lang === 'ar' ? 'البيانات العالمية لعام ٢٠٢٤' : 'Global Data Matrix 2024'}
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] md:leading-[0.9] py-2 break-words sm:break-normal">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 via-emerald-400 to-blue-600 dark:from-emerald-300 dark:via-emerald-500 dark:to-blue-400">
              {t.statsTitle}
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-300 font-semibold leading-relaxed max-w-2xl mx-auto px-2">
            {t.statsDesc}
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-20">
          {/* Card 1 - Composition */}
          <div className="glass group p-6 sm:p-10 md:p-14 rounded-[2.5rem] sm:rounded-[4rem] shadow-xl border border-white/30 dark:border-white/5 h-[500px] sm:h-[650px] md:h-[800px] flex flex-col transition-all duration-1000 hover:border-emerald-500/20">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-8 sm:mb-12 text-slate-900 dark:text-white flex items-center gap-4 sm:gap-6">
              <span className="w-8 sm:w-12 h-1 rounded-full bg-emerald-500/40"></span>
              {lang === 'ar' ? 'تكوين المواد' : 'Analyse des Matières'}
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'currentColor', fontSize: 11, fontWeight: 700}} 
                    width={90}
                    className="sm:text-[13px]"
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(16,185,129,0.03)'}}
                    contentStyle={{borderRadius: '16px', border: 'none', background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px'}}
                  />
                  <Bar dataKey="value" radius={[0, 20, 20, 0]} barSize={window.innerWidth < 640 ? 25 : 35} animationDuration={4000} animationEasing="cubic-bezier(0.16, 1, 0.3, 1)">
                    {compData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2 - Management */}
          <div className="glass group p-6 sm:p-10 md:p-14 rounded-[2.5rem] sm:rounded-[4rem] shadow-xl border border-white/30 dark:border-white/5 h-[500px] sm:h-[650px] md:h-[800px] flex flex-col transition-all duration-1000 hover:border-blue-500/20">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-8 sm:mb-12 text-slate-900 dark:text-white flex items-center gap-4 sm:gap-6">
              <span className="w-8 sm:w-12 h-1 rounded-full bg-blue-500/40"></span>
              {lang === 'ar' ? 'مسار الإدارة' : 'Flux de Gestion'}
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gapData}
                    cx="50%"
                    cy="45%"
                    innerRadius={window.innerWidth < 640 ? 60 : 80}
                    outerRadius={window.innerWidth < 640 ? 110 : 150}
                    paddingAngle={window.innerWidth < 640 ? 8 : 12}
                    cornerRadius={window.innerWidth < 640 ? 15 : 24}
                    dataKey="value"
                    stroke="none"
                    animationDuration={4000}
                    animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
                  >
                    {gapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GAP_COLORS[index % GAP_COLORS.length]} fillOpacity={0.7} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px'}}
                  />
                  <Legend verticalAlign="bottom" height={40} wrapperStyle={{paddingTop: '20px', fontWeight: '800', fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
          {[
            { label: 'Bank Mondiale', val: '3.4B', desc: lang === 'ar' ? 'طن سنوياً بـ 2050' : 'Tonnes/an by 2050', color: 'text-emerald-500', delay: '0s' },
            { label: 'OCDE Impact', val: '9%', desc: lang === 'ar' ? 'تدوير البلاستيك' : 'Recyclage Plastique', color: 'text-blue-500', delay: '0.2s' },
            { label: 'FAO Global', val: '1/3', desc: lang === 'ar' ? 'هدر الأغذية' : 'Pertes Alimentaires', color: 'text-orange-500', delay: '0.4s' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="glass p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] text-center transition-all duration-1000 hover:-translate-y-4 hover:shadow-2xl border border-white/20 relative group overflow-hidden" 
              style={{ transitionDelay: stat.delay }}
            >
              <div className="absolute inset-x-8 top-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 opacity-20"></div>
              <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 sm:mb-6">{stat.label}</h4>
              <p className={`text-5xl sm:text-6xl md:text-7xl font-black mb-3 sm:mb-4 ${stat.color} tracking-tighter`}>{stat.val}</p>
              <p className="text-xs sm:text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest px-2">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer Statement / Conclusion Card */}
        <div className="p-10 sm:p-16 md:p-24 lg:p-32 glass rounded-[3rem] sm:rounded-[5rem] md:rounded-[7rem] text-center animate-shimmer-slow relative overflow-hidden group border border-emerald-500/10">
          <div className="absolute inset-0 bg-emerald-500/[0.01] scale-0 group-hover:scale-110 transition-transform duration-[5s] rounded-full"></div>
          
          <h4 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 sm:mb-10 uppercase tracking-[0.2em] opacity-80 px-4">
            {lang === 'ar' ? 'كن التغيير' : 'SOYEZ LE CHANGEMENT'}
          </h4>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-4xl text-slate-500 dark:text-slate-300 font-bold max-w-5xl mx-auto leading-relaxed px-4 break-words">
            {lang === 'ar' 
              ? "البيانات هي الخطوة الأولى للوعي. سيمبيوز يمنحك القوة لتحويل هذه الأرقام إلى مستقبل أفضل." 
              : "Les données sont la genèse de la conscience. Symbiose vous donne le pouvoir de transformer ces chiffres en un futur radieux."}
          </p>
        </div>
      </div>
    </div>
  );
};