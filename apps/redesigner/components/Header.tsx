import React from 'react';
import Icon from './Icon';
import { useI18n } from '../hooks/useI18n';

interface HeaderProps {
  onLogout: () => void;
  onOpenHelp: () => void;
  onOpenLegal: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onOpenHelp, onOpenLegal, onOpenSettings }) => {
  const { t, language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };
  
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-700 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Icon name="logo" className="w-8 h-8 text-indigo-400" />
          <h1 className="text-xl font-bold text-gray-100 ml-3 hidden sm:block">{t('header.title')}</h1>
        </div>
        <div className="flex items-center space-x-2">
            <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 text-sm font-semibold bg-gray-700 hover:bg-gray-600 rounded-md text-white transition w-12"
            >
                {language.toUpperCase()}
            </button>
             <button
                onClick={onOpenHelp}
                className="p-2 text-sm font-semibold bg-gray-700 hover:bg-gray-600 rounded-md text-white transition"
                title={t('header.help')}
            >
                <Icon name="help" className="w-5 h-5" />
            </button>
             <button
                onClick={onOpenLegal}
                className="p-2 text-sm font-semibold bg-gray-700 hover:bg-gray-600 rounded-md text-white transition"
                title={t('header.legal')}
            >
                <Icon name="shield" className="w-5 h-5" />
            </button>
            <button
                onClick={onOpenSettings}
                className="p-2 text-sm font-semibold bg-gray-700 hover:bg-gray-600 rounded-md text-white transition"
                title={t('header.settings')}
            >
                <Icon name="settings" className="w-5 h-5" />
            </button>
             <button
                onClick={onLogout}
                className="p-2 text-sm font-semibold bg-gray-700 hover:bg-gray-600 rounded-md text-white transition"
                title={t('header.logout')}
            >
                <Icon name="logout" className="w-5 h-5" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;