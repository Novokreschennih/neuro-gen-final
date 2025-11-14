
export enum AdCreativeGoal {
  TEXT_AD = 'text_ad',
  IMAGE_AD = 'image_ad',
}

export enum CreativeStyle {
  PROFESSIONAL = 'Профессиональный',
  SALES = 'Продающий (акция/скидка)',
  PLAYFUL = 'Креативный / Игривый',
  URGENT = 'Срочный',
  PROBLEM_SOLUTION = 'Решение проблемы',
}

export enum AIModel {
    GEMINI_FLASH = 'gemini-2.5-flash',
    GEMINI_PRO = 'gemini-2.5-pro',
}

export interface AdCreative {
  headline1: string;
  headline2: string;
  adText: string;
  sitelinks: { title: string; description: string; }[];
  clarifications: string[];
  displayLink: string;
  imageUrl?: string; // base64 string for image ads
}

export interface FormData {
  goal: AdCreativeGoal | null;
  productDescription: string;
  targetAudience: string;
  usp: string[];
  websiteUrl?: string;
  keywords?: string;
  creativeStyle: CreativeStyle;
  variantCount: number;
  aiModel: AIModel;
}

export interface HistoryEntry {
    formData: FormData;
    creatives: AdCreative[];
    timestamp: number;
}