
export enum Goal {
  LANDING_PAGE = 'landing_page',
  LEAD_MAGNET = 'lead_magnet',
}

export enum LeadMagnetFormat {
  PDF = 'PDF-документ',
  HTML = 'HTML-страница',
  CANVA = 'Шаблон для Canva',
}

export enum DesignStyle {
  MINIMALIST = 'Минимализм',
  CORPORATE = 'Корпоративный',
  PLAYFUL = 'Яркий и Игривый',
  TECH = 'Технологичный',
  ECO = 'Эко-стиль',
  AURORA = 'Аврора (градиенты)',
  GLASSMORPHISM = 'Глассморфизм (эффект стекла)',
  NEUBRUTALISM = 'Нейбрутализм',
  VINTAGE = 'Винтаж',
}

export enum AIModel {
  GEMINI_FLASH = 'gemini-2.5-flash',
  GEMINI_PRO = 'gemini-2.5-pro',
}

export interface FormData {
  goal: Goal | null;
  ideaDescription: string;
  leadMagnetFormat: LeadMagnetFormat | null;
  designStyle: DesignStyle | null;
  aiModel: AIModel;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  formData: FormData;
  generatedContent: string;
  chatHistory: { role: 'user' | 'ai', text: string }[];
}