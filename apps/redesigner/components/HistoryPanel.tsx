import React from 'react';
import type { HistoryItem } from '../types';
import { useI18n } from '../hooks/useI18n';

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoadHistory }) => {
  const { t } = useI18n();
  if (history.length === 0) {
    return (
      <div className="text-center text-gray-400 p-4">
        <p>{t('history.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {history.map((item) => (
        <button
          key={item.id}
          onClick={() => onLoadHistory(item)}
          className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-md transition duration-150"
        >
          <p className="text-sm font-semibold text-indigo-300 truncate">{t(`designStyles.${item.selectedStyle}`)} - {item.selectedModel}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
        </button>
      ))}
    </div>
  );
};

export default HistoryPanel;