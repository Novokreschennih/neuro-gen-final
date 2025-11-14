
import React from 'react';
import { HistoryIcon } from './icons/HistoryIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { GearIcon } from './icons/GearIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';

interface FloatingButtonsProps {
    onHistoryClick: () => void;
    onLegalClick: () => void;
    onSettingsClick: () => void;
    onHelpClick: () => void;
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ onHistoryClick, onLegalClick, onSettingsClick, onHelpClick }) => {

    const buttons = [
        { icon: <HistoryIcon className="w-6 h-6" />, onClick: onHistoryClick, tooltip: 'История Генераций' },
        { icon: <ShieldIcon className="w-6 h-6" />, onClick: onLegalClick, tooltip: 'Политика и Условия' },
        { icon: <GearIcon className="w-6 h-6" />, onClick: onSettingsClick, tooltip: 'Настройки' },
    ];

    return (
        <div className="fixed bottom-6 right-6 flex flex-col items-center space-y-3 z-50">
            {/* Top buttons */}
            {buttons.map((btn, index) => (
                 <div key={index} className="group relative">
                     <button
                         onClick={btn.onClick}
                         className="w-12 h-12 flex items-center justify-center bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-600 transition-transform duration-300 transform hover:scale-110"
                     >
                         {btn.icon}
                     </button>
                      <span className="absolute right-full mr-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {btn.tooltip}
                    </span>
                 </div>
            ))}

            {/* Main, larger button at the bottom */}
            <div className="group relative">
                <button
                    onClick={onHelpClick}
                    className="w-16 h-16 flex items-center justify-center bg-cyan-600 text-white rounded-full shadow-xl hover:bg-cyan-500 transition-transform duration-300 transform hover:scale-110 focus:outline-none"
                    aria-label="Помощь"
                >
                    <QuestionMarkIcon className="w-8 h-8" />
                </button>
                <span className="absolute right-full mr-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Помощь
                </span>
            </div>
        </div>
    );
};

export default FloatingButtons;