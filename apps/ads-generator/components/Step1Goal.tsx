import React from 'react';
import { AdCreativeGoal } from '../types';

interface Step1GoalProps {
  onSelectGoal: (goal: AdCreativeGoal) => void;
}

// FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve 'Cannot find namespace JSX' error.
const GoalCard: React.FC<{ title: string, description: string, icon: React.ReactElement, onClick: () => void }> = ({ title, description, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-indigo-500 cursor-pointer transition-all duration-300 transform hover:scale-105 group"
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-700 group-hover:bg-indigo-600 mb-4 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const TextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const Step1Goal: React.FC<Step1GoalProps> = ({ onSelectGoal }) => {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">Что вы хотите создать?</h2>
      <p className="text-lg text-gray-400 mb-12">Выберите тип рекламного объявления для генерации.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GoalCard
          title="Текстовые объявления"
          description="Для Поиска и РСЯ. Генерация заголовков, текстов, быстрых ссылок и уточнений."
          icon={<TextIcon />}
          onClick={() => onSelectGoal(AdCreativeGoal.TEXT_AD)}
        />
        <GoalCard
          title="Графические объявления"
          description="Для РСЯ. Включает генерацию текста и уникального изображения."
          icon={<ImageIcon />}
          onClick={() => onSelectGoal(AdCreativeGoal.IMAGE_AD)}
        />
      </div>
    </div>
  );
};

export default Step1Goal;