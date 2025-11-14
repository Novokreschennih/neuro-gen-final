
import React, { useState } from 'react';
import { AdCreative } from '../types';

const YandexSearchPreview: React.FC<{ creative: AdCreative }> = ({ creative }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="w-full">
      <div className="flex justify-end items-center mb-2 space-x-2">
            <button onClick={() => setViewMode('desktop')} className={`p-1 rounded ${viewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0h10v8H5V5z" clipRule="evenodd" /></svg>
            </button>
            <button onClick={() => setViewMode('mobile')} className={`p-1 rounded ${viewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm0 2h6v12H7V4z" clipRule="evenodd" /></svg>
            </button>
      </div>
      <div 
        className={`bg-white text-black p-4 rounded-lg shadow-md font-sans transition-all duration-300 mx-auto ${
          viewMode === 'mobile' ? 'max-w-xs' : 'w-full'
        }`}
      >
          <div className="flex items-center mb-1">
              <span className="text-green-700 text-sm font-medium truncate">https://yandex.ru/search/</span>
          </div>
          <div>
              <h3 className="text-xl text-blue-800 hover:underline cursor-pointer">
                  {creative.headline1}{creative.headline2 && ` | ${creative.headline2}`}
              </h3>
              <p className="text-sm mt-1 break-words">{creative.adText}</p>
              <div className="mt-2 text-sm">
                  <span className="text-green-700 font-medium truncate">{creative.displayLink}</span>
              </div>
              
              {creative.sitelinks && creative.sitelinks.length > 0 && (
                  <div className="mt-2 text-sm text-blue-800 flex flex-wrap gap-x-4 gap-y-1">
                      {creative.sitelinks.map((link, index) => (
                          <span key={index} className="hover:underline cursor-pointer">{link.title}</span>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default YandexSearchPreview;