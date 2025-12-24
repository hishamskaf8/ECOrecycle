export type Language = 'ar' | 'fr';
export type Theme = 'light' | 'dark';

export interface TranslationStrings {
  title: string;
  subtitle: string;
  navHome: string;
  navScanner: string;
  navChat: string;
  navStats: string;
  navAbout: string;
  navDiscover: string;
  navInteractive: string; // New: Interactive Experience nav
  heroTitle: string;
  heroDesc: string;
  startScanning: string;
  askAi: string;
  analysisTitle: string;
  analysisDesc: string;
  uploadBtn: string;
  captureBtn: string;
  scanningText: string;
  chatTitle: string;
  chatIntro: string;
  chatPlaceholder: string;
  statsTitle: string;
  statsDesc: string;
  footerText: string;
  languageToggle: string;
  speakResult: string;
  stopResult: string;
  resetBtn: string;
  aboutTitle: string;
  aboutText: string;
  aboutBody: string;
  aboutGoals: string;
  aboutDevelopers: string;
  aboutIncubator: string;
  aboutCopyright: string;
  decompositionLabel: string;
  diyLabel: string;
  // New Interactive keys
  interactiveTitle: string;
  adultMode: string;
  childMode: string;
  feedMe: string;
  thankYouRobot: string;
  candyLimitReached: string;
  wasteReductionTip: string;
  moonChildrenTitle: string;
  moonChildrenDesc: string;
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
  decompositionTime: string;
  diyTip: string;
}