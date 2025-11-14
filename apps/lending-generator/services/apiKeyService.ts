
const API_KEY_STORAGE_KEY = 'gemini-api-key';

export const saveApiKey = (apiKey: string): void => {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  } catch (error) {
    console.error("Could not save API key to local storage", error);
  }
};

export const getApiKey = (): string | null => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Could not retrieve API key from local storage", error);
    return null;
  }
};

export const hasApiKey = (): boolean => {
  return getApiKey() !== null;
};
