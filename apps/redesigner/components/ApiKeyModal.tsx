
import React, { useState } from 'react';
import Icon from './Icon';
import { useI18n } from '../hooks/useI18n';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
  onClose: () => void;
  currentApiKey?: string | null;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, currentApiKey }) => {
  const [key, setKey] = useState(currentApiKey || '');
  const { t } = useI18n();

  if (!isOpen) return null;

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
            <div className='flex items-center'>
                <Icon name="settings" className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold text-white ml-3">{t('apiKeyModal.title')}</h2>
            </div>
             <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                <Icon name="close" className="w-6 h-6" />
            </button>
        </div>
        <p className="text-gray-400 mt-2">
          {t('apiKeyModal.description')}
        </p>
        <p className="text-gray-400 mt-2">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                {t('apiKeyModal.getApiKeyLink')}
            </a>
        </p>
        <div className="mt-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300">
            {t('apiKeyModal.label')}
          </label>
          <input
            type="password"
            id="apiKey"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={t('apiKeyModal.placeholder')}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 disabled:bg-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {t('apiKeyModal.saveButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;