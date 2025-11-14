import React from 'react';
import { DESIGN_STYLES } from '../constants';
import { useI18n } from '../hooks/useI18n';

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ value, onChange }) => {
  const { t } = useI18n();
  return (
    <div>
      <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-1">{t('selectors.designStyle')}</label>
      <select
        id="style"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        {DESIGN_STYLES.map((styleKey) => (
          <option key={styleKey} value={styleKey}>{t(`designStyles.${styleKey}`)}</option>
        ))}
      </select>
    </div>
  );
};

export default StyleSelector;