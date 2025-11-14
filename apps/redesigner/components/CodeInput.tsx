import React, { useRef } from 'react';
import Icon from './Icon';
import { useI18n } from '../hooks/useI18n';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  title: string;
}

const CodeInput: React.FC<CodeInputProps> = ({ value, onChange, placeholder, title }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          onChange(text);
        }
      };
      reader.readAsText(file);
    }
    // Reset the input value to allow uploading the same file again
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-300">{title}</label>
        <button
          type="button"
          onClick={handleUploadClick}
          className="flex items-center space-x-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
          aria-label={`${title}: ${t('codeInput.upload')}`}
        >
          <Icon name="upload" className="w-4 h-4" />
          <span>{t('codeInput.upload')}</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".html,.htm"
          className="hidden"
        />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-48 bg-gray-900/50 border border-gray-600 rounded-md shadow-sm p-3 font-mono text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150 ease-in-out resize-y"
        spellCheck="false"
      />
    </div>
  );
};

export default CodeInput;