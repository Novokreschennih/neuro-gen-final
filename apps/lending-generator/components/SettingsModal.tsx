
import React, { useState, useEffect } from 'react';
import { saveApiKey, getApiKey } from '../services/apiKeyService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getApiKey() || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveApiKey(apiKey);
    setIsSaved(true);
    setTimeout(() => {
        setIsSaved(false);
        onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Настройки</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        <div className="space-y-4 text-gray-300">
            <div>
                <h3 className="font-bold text-lg text-indigo-400 mb-2">API-ключ Google Gemini</h3>
                <p className="text-sm text-gray-400 mb-4">
                    Для работы приложения необходим ваш API-ключ от Google AI Studio. Ключ хранится только в вашем браузере и никуда не передается.
                    Получить ключ можно по ссылке: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>.
                </p>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Введите ваш API-ключ..."
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
            </div>
        </div>
        <div className="text-right mt-8">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className={`font-bold py-2 px-6 rounded-lg transition-colors ${
              isSaved
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-500 disabled:cursor-not-allowed'
            }`}
          >
            {isSaved ? 'Сохранено!' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
