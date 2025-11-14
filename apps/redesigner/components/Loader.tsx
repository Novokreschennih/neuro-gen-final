
import React from 'react';
import { useI18n } from '../hooks/useI18n';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-lg">
      <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-200">{t('loader.magic')}</p>
      <p className="mt-1 text-sm text-gray-400">{message}</p>
    </div>
  );
};

export default Loader;