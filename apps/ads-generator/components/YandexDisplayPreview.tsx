
import React, { useState } from 'react';
import { AdCreative } from '../types';

const YandexDisplayPreview: React.FC<{ creative: AdCreative }> = ({ creative }) => {
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const imageUrl = creative.imageUrl ? `data:image/jpeg;base64,${creative.imageUrl}` : `https://via.placeholder.com/1200x675.png/111827/FFFFFF?text=Generated+Image`;
    
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
                className={`bg-white text-black rounded-lg shadow-md overflow-hidden font-sans transition-all duration-300 mx-auto ${
                    viewMode === 'mobile' ? 'max-w-xs' : 'w-full'
                }`}
            >
                <div className="relative">
                    <img src={imageUrl} alt="Ad creative" className="w-full h-auto aspect-video object-cover"/>
                    <span className="absolute top-2 right-2 bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded">Реклама</span>
                </div>
                <div className="p-4">
                    <span className="text-green-700 text-xs font-medium truncate">{creative.displayLink}</span>
                    <h3 className="text-lg font-bold text-blue-800 hover:underline cursor-pointer mt-1">
                        {creative.headline1}
                    </h3>
                    <p className="text-sm mt-1">{creative.adText}</p>
                </div>
            </div>
        </div>
    );
};

export default YandexDisplayPreview;