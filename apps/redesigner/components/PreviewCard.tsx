
import React, { useState } from 'react';
import type { DesignVariant, Viewport } from '../types';
import Icon from './Icon';
import { useI18n } from '../hooks/useI18n';

interface PreviewCardProps {
  variant: DesignVariant;
  onViewFullScreen: (variant: DesignVariant) => void;
  onUseAsReference: (variant: DesignVariant) => void;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ variant, onViewFullScreen, onUseAsReference }) => {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const { t } = useI18n();

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/80 flex flex-col group relative transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/50 hover:-translate-y-1">
       <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-400 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
      <div className="relative bg-gray-800/80 rounded-lg flex flex-col h-full">
        <div className="p-3 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 flex justify-between items-center">
          <h3 className="font-semibold text-white truncate pr-2">{variant.name}</h3>
          <div className="flex items-center space-x-2">
             <button
              onClick={() => onUseAsReference(variant)}
              className="p-1 rounded text-gray-400 hover:bg-gray-700 hover:text-white"
              title={t('previewCard.useAsReference')}
            >
              <Icon name="template" className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded ${viewport === 'mobile' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              title={t('previewCard.mobileView')}
            >
              <Icon name="mobile" className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded ${viewport === 'desktop' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              title={t('previewCard.desktopView')}
            >
              <Icon name="desktop" className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onViewFullScreen(variant)} 
              className="p-1 rounded text-gray-400 hover:bg-gray-700 hover:text-white"
              title={t('previewCard.fullScreenView')}
            >
              <Icon name="fullscreen" className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-2 bg-gray-900/80 flex-grow">
          <div className="w-full h-full bg-white mx-auto transition-all duration-300 ease-in-out" style={{ maxWidth: viewport === 'desktop' ? '100%' : '375px' }}>
            <iframe
              srcDoc={variant.html}
              className="w-full h-72 md:h-96 border-0"
              title={variant.name}
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;