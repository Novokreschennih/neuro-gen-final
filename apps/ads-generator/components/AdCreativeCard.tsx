
import React from 'react';
import { AdCreative, AdCreativeGoal } from '../types';
import CopyButton from './CopyButton';
import YandexSearchPreview from './YandexSearchPreview';
import YandexDisplayPreview from './YandexDisplayPreview';

interface AdCreativeCardProps {
  creative: AdCreative;
  goal: AdCreativeGoal;
  variantNumber: number;
}

const Field: React.FC<{ label: string; value: string; maxLength?: number }> = ({ label, value, maxLength }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-400">{label}</label>
            {maxLength && <span className={`text-xs ${value.length > maxLength ? 'text-red-500' : 'text-gray-500'}`}>{value.length}/{maxLength}</span>}
        </div>
        <div className="flex items-center bg-gray-900 rounded-md">
            <p className="flex-grow p-2 text-white text-sm">{value}</p>
            <CopyButton textToCopy={value} />
        </div>
    </div>
);

const AdCreativeCard: React.FC<AdCreativeCardProps> = ({ creative, goal, variantNumber }) => {
  const downloadImage = () => {
    if (!creative.imageUrl) return;
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${creative.imageUrl}`;
    link.download = `ad_creative_${variantNumber}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-4 bg-gray-900/50">
        <h3 className="text-lg font-bold text-white">Вариант #{variantNumber}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="space-y-4">
          <Field label="Заголовок 1" value={creative.headline1} maxLength={56} />
          <Field label="Заголовок 2" value={creative.headline2} maxLength={30} />
          <Field label="Текст объявления" value={creative.adText} maxLength={81} />
          <Field label="Отображаемая ссылка" value={creative.displayLink} maxLength={20} />
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Быстрые ссылки</label>
            <div className="space-y-2">
              {creative.sitelinks.map((link, index) => (
                <div key={index} className="bg-gray-900 rounded-md p-2">
                   <div className="flex items-center">
                     <p className="flex-grow text-sm text-indigo-300 font-semibold">{link.title} ({link.title.length}/30)</p>
                     <CopyButton textToCopy={`${link.title}\n${link.description}`} />
                   </div>
                   <p className="text-xs text-gray-300 mt-1">{link.description} ({link.description.length}/60)</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Уточнения</label>
            <div className="flex flex-wrap gap-2">
                {creative.clarifications.map((clar, index) => (
                    <div key={index} className="flex items-center bg-gray-900 rounded-full px-3 py-1">
                        <span className="text-xs text-gray-300">{clar} ({clar.length}/25)</span>
                        <div className="ml-2">
                          <CopyButton textToCopy={clar} />
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center bg-gray-900/50 p-4 rounded-lg">
          <h4 className="text-sm font-bold text-gray-400 mb-4">Предпросмотр</h4>
          {goal === AdCreativeGoal.TEXT_AD ? (
            <YandexSearchPreview creative={creative} />
          ) : (
            <div className="w-full">
              <YandexDisplayPreview creative={creative} />
              <button onClick={downloadImage} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition duration-300">
                Скачать изображение
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdCreativeCard;
