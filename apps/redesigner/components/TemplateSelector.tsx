import React from 'react';
import { TEMPLATES } from '../constants/templates';
import { useI18n } from '../hooks/useI18n';

interface TemplateSelectorProps {
  onSelect: (html: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const { t } = useI18n();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{t('app.startWithTemplate')}</label>
      <div className="grid grid-cols-3 gap-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.key}
            type="button"
            onClick={() => onSelect(template.html)}
            className="p-2 text-xs font-semibold bg-gray-700 hover:bg-gray-600 rounded-md text-white transition text-center"
            title={`${t('app.useTemplate')} ${t(`templates.${template.key}`)}`}
          >
            {t(`templates.${template.key}`)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
