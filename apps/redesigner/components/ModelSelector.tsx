
import React from 'react';
import { GEMINI_MODELS } from '../constants';
import { useI18n } from '../hooks/useI18n';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange }) => {
  const { t } = useI18n();
  return (
    <div>
      <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-1">{t('selectors.aiModel')}</label>
      <select
        id="model"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        {GEMINI_MODELS.map((model) => (
          <option key={model} value={model}>{model}</option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;