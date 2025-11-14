
export const DESIGN_STYLE_CONFIG: { [key: string]: string } = {
  aiChoice: "AI's Choice",
  minimalist: 'Minimalist',
  monochromatic: 'Monochromatic',
  glassmorphism: 'Glassmorphism',
  aurora: 'Aurora',
  neumorphism: 'Neumorphism',
  brutalism: 'Brutalism',
  corporate: 'Corporate',
  playful: 'Playful',
  futuristic: 'Futuristic',
};

export const DESIGN_STYLES = Object.keys(DESIGN_STYLE_CONFIG);
export const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'];
export const MAX_HISTORY_ITEMS = 20;
export const AUTH_STORAGE_KEY = 'redesigner-auth';
export const API_KEY_STORAGE_KEY = 'redesigner-api-key';
export const HISTORY_STORAGE_KEY = 'redesigner-history';

export const INPUT_HTML_STORAGE_KEY = 'redesigner-inputHtml';
export const REFERENCE_HTML_STORAGE_KEY = 'redesigner-referenceHtml';
export const TARGET_HTML_STORAGE_KEY = 'redesigner-targetHtml';

// Centralized PIN Authentication Service Configuration
export const PIN_AUTH_SERVICE_URL = 'https://pin-auth-service2.vercel.app/api/validate';
export const APP_ID = 'app1';