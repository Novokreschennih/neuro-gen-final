
import React from 'react';
import { FormData, CreativeStyle, AIModel } from '../types';

interface Step3StyleProps {
  formData: Partial<FormData>;
  onUpdate: (data: Partial<FormData>) => void;
  onGenerate: () => void;
  onBack: () => void;
}

const Step3Style: React.FC<Step3StyleProps> = ({ formData, onUpdate, onGenerate, onBack }) => {

  const handleStyleSelect = (style: CreativeStyle) => {
    onUpdate({ creativeStyle: style });
  };
  
  const handleModelSelect = (model: AIModel) => {
    onUpdate({ aiModel: model });
  };

  const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ variantCount: parseInt(e.target.value, 10) });
  };
  
  const selectedStyle = formData.creativeStyle ?? CreativeStyle.PROFESSIONAL;
  const selectedModel = formData.aiModel ?? AIModel.GEMINI_FLASH;
  const variantCount = formData.variantCount ?? 3;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4 text-center">Настройте генерацию</h2>
      <p className="text-lg text-gray-400 mb-12 text-center">Выберите стиль, модель и количество вариантов для A/B тестирования.</p>

      <div className="space-y-8 bg-gray-800 p-8 rounded-lg border border-gray-700">
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Креативный стиль</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.values(CreativeStyle).map(style => (
              <button
                key={style}
                onClick={() => handleStyleSelect(style)}
                className={`p-4 rounded-lg text-center transition-all duration-200 border-2 ${selectedStyle === style ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-700 border-gray-600 hover:border-indigo-500'}`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
            <label htmlFor="variantCount" className="block text-lg font-medium text-white mb-4">Количество вариантов: <span className="text-indigo-400 font-bold">{variantCount}</span></label>
            <input 
                id="variantCount" 
                type="range" 
                min="1" 
                max="5" 
                value={variantCount} 
                onChange={handleVariantChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-4">AI Модель</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => handleModelSelect(AIModel.GEMINI_FLASH)}
              className={`flex-1 p-4 rounded-lg text-center transition-all duration-200 border-2 ${selectedModel === AIModel.GEMINI_FLASH ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-700 border-gray-600 hover:border-indigo-500'}`}
            >
              <h4 className="font-bold">Gemini Flash</h4>
              <p className="text-sm opacity-80">Быстрый и эффективный</p>
            </button>
            <button
              onClick={() => handleModelSelect(AIModel.GEMINI_PRO)}
              className={`flex-1 p-4 rounded-lg text-center transition-all duration-200 border-2 ${selectedModel === AIModel.GEMINI_PRO ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-700 border-gray-600 hover:border-indigo-500'}`}
            >
              <h4 className="font-bold">Gemini Pro</h4>
              <p className="text-sm opacity-80">Более мощный и креативный</p>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
          Назад
        </button>
        <button onClick={onGenerate} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" />
                <path d="M5 12a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" />
                <path d="M11 16a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM5 16a1 1 0 011-1h2a1 1 0 110 2H6a1 1 0 01-1-1z" />
            </svg>
          Сгенерировать
        </button>
      </div>
    </div>
  );
};

export default Step3Style;
