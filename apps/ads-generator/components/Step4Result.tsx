
import React from 'react';
import { AdCreative, FormData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import AdCreativeCard from './AdCreativeCard';
import ChatInterface from './ChatInterface';

interface Step4ResultProps {
    formData: FormData;
    generatedCreatives: AdCreative[] | null;
    isLoading: boolean;
    error: string | null;
    onRefine: (prompt: string) => void;
    onRestart: () => void;
}

const Step4Result: React.FC<Step4ResultProps> = ({ 
    formData, 
    generatedCreatives, 
    isLoading, 
    error, 
    onRefine, 
    onRestart
}) => {
    
    if (isLoading && !generatedCreatives) {
        return <LoadingSpinner message="ИИ-директолог подбирает лучшие слова и изображения. Это может занять до минуты..." />;
    }

    if (error) {
        return (
            <div className="text-center p-8 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Произошла ошибка</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button onClick={onRestart} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                    Начать заново
                </button>
            </div>
        );
    }

    if (!generatedCreatives || generatedCreatives.length === 0) {
        return (
            <div className="text-center p-8 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-white mb-4">Сгенерируйте свои первые креативы</h2>
                <p className="text-gray-400 mb-6">Вернитесь на предыдущие шаги, чтобы начать.</p>
                <button onClick={onRestart} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                    Начать заново
                </button>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto lg:grid lg:grid-cols-12 lg:gap-8 animate-fade-in-up">
            <div className="lg:col-span-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-extrabold text-white">Ваши рекламные креативы</h2>
                    <button onClick={onRestart} className="text-sm text-indigo-400 hover:text-indigo-300">Начать заново</button>
                </div>
                <div className="space-y-8">
                    {generatedCreatives.map((creative, index) => (
                        <AdCreativeCard 
                            key={index} 
                            creative={creative} 
                            goal={formData.goal!} 
                            variantNumber={index + 1}
                        />
                    ))}
                </div>
            </div>
            <div className="lg:col-span-4 mt-8 lg:mt-0">
                <div className="sticky top-8 space-y-8">
                    <ChatInterface onSendMessage={onRefine} isRefining={isLoading} />
                </div>
            </div>
        </div>
    );
};

export default Step4Result;