import React, { useState } from 'react';
import type { DesignVariant } from '../types';
import { useI18n } from '../hooks/useI18n';
import Icon from './Icon';
import Loader from './Loader';

interface AppliedPreviewProps {
  referenceHtml: string;
  targetHtml: string;
  result: DesignVariant | null;
  isLoading: boolean;
  loadingMessage: string;
  onViewFullScreen: (variant: DesignVariant) => void;
}

const IframePanel: React.FC<{ title: string; html: string }> = ({ title, html }) => (
  <div className="flex-1 flex flex-col min-w-0 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
    <div className="p-3 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
      <h3 className="font-semibold text-white text-center">{title}</h3>
    </div>
    <div className="flex-grow bg-white">
      <iframe
        srcDoc={html}
        className="w-full h-full border-0"
        title={title}
        sandbox="allow-scripts"
      />
    </div>
  </div>
);


const AppliedPreview: React.FC<AppliedPreviewProps> = ({ referenceHtml, targetHtml, result, isLoading, loadingMessage, onViewFullScreen }) => {
  const { t } = useI18n();
  const [copySuccess, setCopySuccess] = useState('');

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.html).then(() => {
      setCopySuccess(t('appliedPreview.copied'));
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess(t('appliedPreview.copyFailed'));
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.name.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <IframePanel title={t('appliedPreview.reference')} html={referenceHtml} />
      <IframePanel title={t('appliedPreview.target')} html={targetHtml} />
      
      <div className="flex-1 flex flex-col min-w-0 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-3 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-white">{t('appliedPreview.result')}</h3>
          {result && !isLoading && (
            <div className="flex items-center space-x-2">
                 <button 
                    onClick={() => onViewFullScreen(result)} 
                    className="p-1 rounded text-gray-400 hover:bg-gray-700 hover:text-white"
                    title={t('previewCard.fullScreenView')}
                >
                    <Icon name="fullscreen" className="w-5 h-5" />
                </button>
                 <button 
                    onClick={handleCopy} 
                    className="p-1 rounded text-gray-400 hover:bg-gray-700 hover:text-white"
                    title={copySuccess || t('appliedPreview.copy')}
                >
                    <Icon name="copy" className="w-5 h-5" />
                </button>
                 <button 
                    onClick={handleDownload} 
                    className="p-1 rounded text-gray-400 hover:bg-gray-700 hover:text-white"
                    title={t('appliedPreview.download')}
                >
                    <Icon name="download" className="w-5 h-5" />
                </button>
            </div>
          )}
        </div>
        <div className="flex-grow relative bg-gray-900">
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader message={loadingMessage} />
                </div>
            ) : (
                <iframe
                    srcDoc={result?.html || `<div class="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">${t('appliedPreview.placeholder')}</div>`}
                    className="w-full h-full border-0 bg-white"
                    title={t('appliedPreview.result')}
                    sandbox="allow-scripts"
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default AppliedPreview;