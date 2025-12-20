
export type Language = 'ar' | 'fr';

export interface TranslationStrings {
  title: string;
  subtitle: string;
  navHome: string;
  navScanner: string;
  navChat: string;
  navStats: string;
  heroTitle: string;
  heroDesc: string;
  startScanning: string;
  askAi: string;
  analysisTitle: string;
  analysisDesc: string;
  uploadBtn: string;
  scanningText: string;
  chatTitle: string;
  chatPlaceholder: string;
  statsTitle: string;
  statsDesc: string;
  footerText: string;
  languageToggle: string;
  speakResult: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface WasteAnalysisResult {
  item: string;
  category: string;
  instructions: string;
  impact: string;
}
