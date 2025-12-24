import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  current: Language;
  onToggle: (lang: Language) => void;
}

const AlgeriaSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-7 h-5 rounded-sm shadow-sm">
    <rect width="900" height="600" fill="#fff"/>
    <rect width="450" height="600" fill="#006233"/>
    <circle cx="450" cy="300" r="150" fill="#d21034"/>
    <circle cx="490" cy="300" r="150" fill="#fff"/>
    <path fill="#d21034" d="M510 300l-63.7 20.7 39.4-54.2V354l-39.4-54.2z"/>
  </svg>
);

const FranceSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-7 h-5 rounded-sm shadow-sm">
    <rect width="1" height="2" fill="#002395"/>
    <rect width="1" height="2" x="1" fill="#fff"/>
    <rect width="1" height="2" x="2" fill="#ed2939"/>
  </svg>
);

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ current, onToggle }) => {
  const isArabic = current === 'ar';

  return (
    <button
      onClick={() => onToggle(isArabic ? 'fr' : 'ar')}
      className="group relative flex items-center gap-3 h-11 md:h-12 px-4 rounded-2xl glass border border-slate-200 dark:border-emerald-500/20 transition-all duration-500 hover:scale-[1.05] active:scale-95 hover:shadow-[0_8px_30px_rgb(16,185,129,0.2)] overflow-hidden"
      title={isArabic ? "Passer en Français" : "التبديل إلى العربية"}
    >
      {/* Premium Shimmer Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      
      {/* Icon/Flag Container */}
      <div className="relative z-10 flex items-center gap-2">
        <div className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
          {isArabic ? <FranceSVG /> : <AlgeriaSVG />}
        </div>
        
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors">
            {isArabic ? 'FR' : 'DZ'}
          </span>
        </div>
      </div>

      {/* Decorative pulse ring on hover */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-500/0 group-hover:ring-emerald-500/20 transition-all duration-500 scale-110 group-hover:scale-100"></div>
    </button>
  );
};