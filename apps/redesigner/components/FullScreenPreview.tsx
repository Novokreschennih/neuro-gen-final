
import React, { useState, useEffect } from 'react';
import type { DesignVariant } from '../types';
import Icon from './Icon';
import Loader from './Loader';
import { useI18n } from '../hooks/useI18n';

interface FullScreenPreviewProps {
  variant: DesignVariant | null;
  onClose: () => void;
  onRefine: (originalHtml: string, instruction: string) => Promise<DesignVariant | null>;
  onUseAsReference: (variant: DesignVariant) => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ variant, onClose, onRefine, onUseAsReference }) => {
  const [currentVariant, setCurrentVariant] = useState(variant);
  const [editableHtml, setEditableHtml] = useState(variant?.html || '');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const { t } = useI18n();

  useEffect(() => {
    setCurrentVariant(variant);
    if (variant) {
      setEditableHtml(variant.html);
      setViewMode('preview'); // Reset to preview when new variant loads
    }
  }, [variant]);
  
  if (!currentVariant) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editableHtml).then(() => {
      setCopySuccess(t('fullScreenPreview.copied'));
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess(t('fullScreenPreview.copyFailed'));
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([editableHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentVariant.name.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineInput.trim() || isRefining) return;
    setIsRefining(true);
    const newVariant = await onRefine(editableHtml, refineInput);
    if (newVariant) {
        setCurrentVariant(newVariant);
        setEditableHtml(newVariant.html);
        setRefineInput('');
    }
    setIsRefining(false);
  };

  const handleUseAsReferenceClick = () => {
    onUseAsReference({ ...currentVariant, html: editableHtml });
  };


  return (
    <div className="fixed inset-0 bg-gray-900/90 z-40 flex flex-col p-4 sm:p-6 lg:p-8" onClick={onClose}>
      <div className="flex-grow flex flex-col bg-gray-800 rounded-lg border border-gray-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <header className="p-3 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 flex flex-wrap justify-between items-center gap-3 flex-shrink-0">
            <div className="flex items-center">
                <h2 className="text-lg font-bold text-white truncate">{currentVariant.name}</h2>
                <div className="flex bg-gray-900 p-1 rounded-lg ml-4 flex-shrink-0">
                    <button onClick={() => setViewMode('preview')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{t('fullScreenPreview.tabPreview')}</button>
                    <button onClick={() => setViewMode('code')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${viewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{t('fullScreenPreview.tabCode')}</button>
                </div>
            </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleUseAsReferenceClick} className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium text-white transition" title={t('fullScreenPreview.useAsReference')}>
              <Icon name="template" className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">{t('fullScreenPreview.useAsReference')}</span>
            </button>
            <button onClick={handleCopy} className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium text-white transition">
              <Icon name="copy" className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">{copySuccess || t('fullScreenPreview.copy')}</span>
            </button>
            <button onClick={handleDownload} className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium text-white transition">
              <Icon name="download" className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">{t('fullScreenPreview.download')}</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 text-gray-300">
              <Icon name="close" className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex-grow relative">
          {isRefining && 
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <Loader message={t('fullScreenPreview.refining')} />
            </div>
          }
          {viewMode === 'preview' ? (
            <iframe
                key={currentVariant.id + '-preview'}
                srcDoc={editableHtml}
                className="w-full h-full border-0 bg-white"
                title={currentVariant.name}
                sandbox="allow-scripts"
            />
          ) : (
             <textarea
                value={editableHtml}
                onChange={(e) => setEditableHtml(e.target.value)}
                className="w-full h-full bg-gray-900 border-0 font-mono text-sm text-gray-200 p-4 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                spellCheck="false"
              />
          )}
        </div>
        
        <footer className="p-3 bg-gray-900 border-t border-gray-700 flex-shrink-0">
          <form onSubmit={handleRefineSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={refineInput}
              onChange={(e) => setRefineInput(e.target.value)}
              placeholder={t('fullScreenPreview.placeholder')}
              className="flex-grow bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isRefining}
            />
            <button
              type="submit"
              disabled={!refineInput.trim() || isRefining}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:bg-indigo-800 disabled:cursor-not-allowed"
            >
              <Icon name="send" className="w-5 h-5" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default FullScreenPreview;