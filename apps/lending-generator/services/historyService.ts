
import { HistoryItem } from '../types';

const HISTORY_STORAGE_KEY = 'ai-generator-history';

export const getHistory = (): HistoryItem[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Could not retrieve history from local storage", error);
    return [];
  }
};

const saveHistory = (history: HistoryItem[]): void => {
  try {
    const limitedHistory = history.slice(0, 20);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Could not save history to local storage", error);
  }
};

export const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>): void => {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: new Date().toISOString() + '-' + Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };
  const updatedHistory = [newItem, ...history];
  saveHistory(updatedHistory);
};


export const deleteHistoryItem = (id: string): HistoryItem[] => {
  let history = getHistory();
  history = history.filter(item => item.id !== id);
  saveHistory(history);
  return history;
};
