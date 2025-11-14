import { AIModel, DesignStyle, LeadMagnetFormat } from './types';

export const DESIGN_STYLES: DesignStyle[] = [
  DesignStyle.MINIMALIST,
  DesignStyle.CORPORATE,
  DesignStyle.PLAYFUL,
  DesignStyle.TECH,
  DesignStyle.ECO,
  DesignStyle.AURORA,
  DesignStyle.GLASSMORPHISM,
  DesignStyle.NEUBRUTALISM,
  DesignStyle.VINTAGE,
];

export const LEAD_MAGNET_FORMATS: LeadMagnetFormat[] = [
  LeadMagnetFormat.PDF,
  LeadMagnetFormat.HTML,
  LeadMagnetFormat.CANVA,
];

export const AI_MODELS_OPTIONS: { value: AIModel; label: string }[] = [
    { value: AIModel.GEMINI_FLASH, label: 'Gemini 2.5 Flash (Быстрый)' },
    { value: AIModel.GEMINI_PRO, label: 'Gemini 2.5 Pro (Продвинутый)' },
];

export const LOADING_MESSAGES: string[] = [
  "Подбираем лучшие слова...",
  "Рисуем дизайн...",
  "AI творит магию...",
  "Собираем пиксели в шедевр...",
  "Обучаем нейросеть хорошим манерам...",
  "Генерируем креативные идеи...",
];

export const PIN_AUTH_SERVICE_URL = 'https://pin-auth-service2.vercel.app/api/validate';
export const APP_ID = 'app4';
