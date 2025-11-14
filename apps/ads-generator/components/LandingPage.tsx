import React from 'react';
import { BotIcon } from './icons/BotIcon';

interface LandingPageProps {
    onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="max-w-2xl text-center">
                <BotIcon className="w-24 h-24 text-indigo-400 mx-auto mb-6" />
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl mb-4">
                    AI Ad Creative Generator
                </h1>
                <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
                    Создавайте высококонверсионные рекламные объявления для Яндекс.Директ за считанные минуты. Наш AI-ассистент сгенерирует тексты, заголовки и даже изображения для ваших кампаний.
                </p>
                <button
                    onClick={onStart}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
                >
                    Начать работу
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
