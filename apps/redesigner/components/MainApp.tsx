
import React, { useState, useEffect } from 'react';
import Header from './Header';
import ApiKeyModal from './ApiKeyModal';
import HelpModal from './HelpModal';
import LegalModal from './LegalModal';
import CodeInput from './CodeInput';
import StyleSelector from './StyleSelector';
import ModelSelector from './ModelSelector';
import HistoryPanel from './HistoryPanel';
import PreviewCard from './PreviewCard';
import AppliedPreview from './AppliedPreview';
import FullScreenPreview from './FullScreenPreview';
import Loader from './Loader';
import Icon from './Icon';
import { useI18n } from '../hooks/useI18n';
import useLocalStorage from '../hooks/useLocalStorage';
import * as geminiService from '../services/geminiService';
import type { AppMode, SidebarTab, DesignVariant, HistoryItem } from '../types';
import { GEMINI_MODELS, MAX_HISTORY_ITEMS, HISTORY_STORAGE_KEY, API_KEY_STORAGE_KEY, DESIGN_STYLES, INPUT_HTML_STORAGE_KEY, REFERENCE_HTML_STORAGE_KEY, TARGET_HTML_STORAGE_KEY } from '../constants';

interface MainAppProps {
  onLogout: () => void;
}

const ErrorBanner = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-2xl z-[100] flex items-center justify-between max-w-md w-full animate-fade-in-up border border-red-500">
    <span className="font-medium text-sm">{message}</span>
    <button onClick={onClose} className="p-1 -mr-1 rounded-full hover:bg-red-700 transition-colors">
      <Icon name="close" className="w-5 h-5" />
    </button>
  </div>
);


const MainApp: React.FC<MainAppProps> = ({ onLogout }) => {
  const { t } = useI18n();
  const [apiKey, setApiKey] = useLocalStorage<string | null>(API_KEY_STORAGE_KEY, null);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(HISTORY_STORAGE_KEY, []);
  
  // Modal states
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);

  const [appMode, setAppMode] = useState<AppMode>('redesign');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('controls');

  const [inputHtml, setInputHtml] = useLocalStorage(INPUT_HTML_STORAGE_KEY, '');
  const [referenceHtml, setReferenceHtml] = useLocalStorage(REFERENCE_HTML_STORAGE_KEY, '');
  const [targetHtml, setTargetHtml] = useLocalStorage(TARGET_HTML_STORAGE_KEY, '');
  
  const [selectedStyle, setSelectedStyle] = useState(DESIGN_STYLES[0]);
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0]);

  const [generatedDesigns, setGeneratedDesigns] = useState<DesignVariant[]>([]);
  const [appliedResult, setAppliedResult] = useState<DesignVariant | null>(null);

  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [fullScreenVariant, setFullScreenVariant] = useState<DesignVariant | null>(null);
  
  useEffect(() => {
    // Open the API key modal on first load if no key is set
    if (!apiKey) {
      setIsSettingsModalOpen(true);
    }
  }, [apiKey]);
  
  useEffect(() => {
    if (error) {
        const timer = setTimeout(() => {
            setError(null);
        }, 5000); // Auto-dismiss error after 5 seconds
        return () => clearTimeout(timer);
    }
  }, [error]);

  const handleError = (err: unknown) => {
    if (err instanceof Error && err.message.includes("invalid response format")) {
        setError(t('app.errorInvalidResponse'));
    } else {
        setError(t('app.errorUnknown'));
    }
    console.error(err);
  };

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    setIsSettingsModalOpen(false);
  };
  
  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setHistory([newItem, ...history].slice(0, MAX_HISTORY_ITEMS));
  };
  
  const handleGenerate = async (type: 'initial' | 'more') => {
    if (!apiKey) {
      setError(t('app.errorApiKeyMissing'));
      setIsSettingsModalOpen(true);
      return;
    }
    setError(null);
    const isInitial = type === 'initial';
    
    if (isInitial) {
      setIsLoadingInitial(true);
      setGeneratedDesigns([]); // Clear previous designs for a fresh start
      setLoadingMessage(t('app.loadingMessageRedesign'));
    } else {
      if (generatedDesigns.length >= 9) return; // Max limit check
      setIsLoadingMore(true);
      setLoadingMessage(t('app.loadingMessageMore'));
    }

    try {
      const designsToGenerate = 3;
      const promises = Array.from({ length: designsToGenerate }, () =>
        geminiService.generateSingleDesign(apiKey, inputHtml, selectedStyle, selectedModel)
      );
      const newDesigns = await Promise.all(promises);

      if (isInitial) {
        setGeneratedDesigns(newDesigns);
        addToHistory({
          inputHtml,
          selectedStyle,
          selectedModel,
          generatedDesigns: newDesigns,
        });
      } else {
        const updatedDesigns = [...generatedDesigns, ...newDesigns].slice(0, 9);
        setGeneratedDesigns(updatedDesigns);
        // Do not update history for "more" generations to keep it clean
      }
    } catch (err) {
      handleError(err);
    } finally {
      if (isInitial) {
        setIsLoadingInitial(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };
  
  const handleApply = async () => {
    if (!apiKey) {
      setError(t('app.errorApiKeyMissing'));
      setIsSettingsModalOpen(true);
      return;
    }
    setError(null);
    setIsLoadingInitial(true);
    setLoadingMessage(t('app.loadingMessageApply'));
    setAppliedResult(null);

    try {
        const result = await geminiService.applyDesign(apiKey, referenceHtml, targetHtml, selectedModel);
        setAppliedResult(result);
    } catch (err) {
        handleError(err);
    } finally {
        setIsLoadingInitial(false);
    }
  };
  
  const handleRefine = async (originalHtml: string, instruction: string): Promise<DesignVariant | null> => {
    if (!apiKey) {
      setError(t('app.errorApiKeyMissing'));
      setIsSettingsModalOpen(true);
      return null;
    }
    setError(null);
     try {
        const result = await geminiService.refineDesign(apiKey, originalHtml, instruction, selectedModel);
        return result;
    } catch (err) {
        if (err instanceof Error && err.message.includes("invalid response format")) {
            setError(t('app.errorInvalidResponse'));
        } else {
            setError(t('app.errorRefinement'));
        }
        console.error(err);
        return null;
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setInputHtml(item.inputHtml);
    setSelectedStyle(item.selectedStyle);
    setSelectedModel(item.selectedModel);
    setGeneratedDesigns(item.generatedDesigns);
    setAppMode('redesign');
    setSidebarTab('controls');
    setAppliedResult(null);
    setError(null);
  };
  
  const handleUseAsReference = (variant: DesignVariant) => {
    setReferenceHtml(variant.html);
    setAppMode('apply');
    setFullScreenVariant(null);
    setSidebarTab('controls');
    setIsControlsCollapsed(false);
  };

  const renderContent = () => {
    if (appMode === 'redesign') {
      if (isLoadingInitial) {
        return <div className="flex items-center justify-center h-full"><Loader message={loadingMessage} /></div>;
      }
      if (generatedDesigns.length > 0) {
        return (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {generatedDesigns.map((variant) => (<PreviewCard key={variant.id} variant={variant} onViewFullScreen={setFullScreenVariant} onUseAsReference={handleUseAsReference}/>))}
            </div>
            
            {isLoadingMore && (
              <div className="flex items-center justify-center pt-4">
                  <Loader message={loadingMessage} />
              </div>
            )}

            {generatedDesigns.length < 9 && !isLoadingMore && (
              <div className="text-center pt-4">
                  <button onClick={() => handleGenerate('more')} className="w-full max-w-sm py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition flex items-center justify-center mx-auto">
                      {t('app.generateMore')}
                  </button>
              </div>
            )}
          </div>
        );
      }
      // New Instructional Empty State
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in-up">
          <Icon name="logo" className="w-24 h-24 text-indigo-500/30 mb-4" />
          <h2 className="text-2xl font-bold text-white">{t('app.welcomeTitle')}</h2>
          <p className="mt-2 max-w-lg text-gray-400">{t('app.welcomeMessage')}</p>
        </div>
      );
    }
    // appMode === 'apply'
    return <AppliedPreview referenceHtml={referenceHtml} targetHtml={targetHtml} result={appliedResult} isLoading={isLoadingInitial} loadingMessage={loadingMessage} onViewFullScreen={setFullScreenVariant} />;
  };
  
  return (
    <>
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
      <div className="h-screen bg-gray-900 text-gray-200 flex flex-col">
        <Header onLogout={onLogout} onOpenSettings={() => setIsSettingsModalOpen(true)} onOpenHelp={() => setIsHelpModalOpen(true)} onOpenLegal={() => setIsLegalModalOpen(true)} />
        
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
           <aside className={`
            bg-gray-900/60 backdrop-blur-xl lg:border-r border-gray-700/50 shadow-2xl z-10 
            transition-all duration-300 ease-in-out 
            flex flex-col flex-shrink-0 
            lg:h-full
            ${ isControlsCollapsed ? 'lg:w-20' : 'lg:w-96' }
           `}>
                <div className="p-4 flex-shrink-0 border-b border-gray-800 flex justify-between items-center">
                    <h2 className={`text-lg font-bold text-white transition-opacity ${isControlsCollapsed ? 'lg:opacity-0 lg:invisible' : 'delay-200'}`}>{t('app.controlsTitle')}</h2>
                    <button
                        onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
                        className="p-1 rounded-full text-gray-300 hover:bg-gray-700"
                        aria-label={isControlsCollapsed ? t('app.expandControls') : t('app.collapseControls')}
                        aria-expanded={!isControlsCollapsed}
                    >
                         <span className="hidden lg:block"><Icon name={isControlsCollapsed ? 'chevron-right' : 'chevron-left'} className="w-6 h-6" /></span>
                         <span className="lg:hidden"><Icon name={isControlsCollapsed ? 'chevron-down' : 'chevron-up'} className="w-6 h-6" /></span>
                    </button>
                </div>

                <div className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                     ${isControlsCollapsed ? 'max-h-0 lg:max-h-full' : 'max-h-[calc(100vh-160px)] lg:max-h-full'}
                `}>
                    <div className={`
                        overflow-y-auto h-full
                        transition-opacity duration-200
                        ${isControlsCollapsed ? 'lg:opacity-0 lg:invisible' : 'lg:opacity-100 delay-200'}
                    `}>
                        <div className="p-4 border-b border-gray-800">
                            <div className="flex bg-gray-800 p-1 rounded-lg">
                                <button onClick={() => setSidebarTab('controls')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition ${sidebarTab === 'controls' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{t('app.tabGenerator')}</button>
                                <button onClick={() => setSidebarTab('history')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition ${sidebarTab === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{t('app.tabHistory')}</button>
                            </div>
                        </div>

                        {sidebarTab === 'controls' ? (
                            <div className="space-y-4 px-4 py-4">
                                <div className="flex bg-gray-800 p-1 rounded-lg">
                                    <button onClick={() => setAppMode('redesign')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition ${appMode === 'redesign' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>{t('app.modeRedesign')}</button>
                                    <button onClick={() => setAppMode('apply')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition ${appMode === 'apply' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>{t('app.modeApply')}</button>
                                </div>
                                {appMode === 'redesign' ? (
                                    <div className="space-y-4">
                                        <CodeInput title={t('app.htmlToRedesign')} value={inputHtml} onChange={setInputHtml} placeholder={t('app.placeholderRedesign')} />
                                        <StyleSelector value={selectedStyle} onChange={setSelectedStyle} />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <CodeInput title={t('app.referenceHtml')} value={referenceHtml} onChange={setReferenceHtml} placeholder={t('app.placeholderReference')} />
                                        <CodeInput title={t('app.targetHtml')} value={targetHtml} onChange={setTargetHtml} placeholder={t('app.placeholderTarget')} />
                                    </div>
                                )}
                                <ModelSelector value={selectedModel} onChange={setSelectedModel} />
                                <button onClick={() => appMode === 'redesign' ? handleGenerate('initial') : handleApply()} disabled={isLoadingInitial || isLoadingMore || (appMode === 'redesign' && !inputHtml.trim()) || (appMode === 'apply' && (!referenceHtml.trim() || !targetHtml.trim()))} className="w-full py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center">
                                    {isLoadingInitial || isLoadingMore ? t('app.generating') : t('app.generate')}
                                </button>
                            </div>
                        ) : (
                            <HistoryPanel history={history} onLoadHistory={loadFromHistory} />
                        )}
                    </div>
                </div>
                 {isControlsCollapsed && (
                    <div className="hidden lg:flex items-center justify-center flex-grow">
                        <span className="transform -rotate-90 whitespace-nowrap text-gray-400 font-semibold tracking-widest uppercase">{t('app.controlsTitle')}</span>
                    </div>
                )}
           </aside>
           <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
        
      <ApiKeyModal isOpen={isSettingsModalOpen} onSave={handleSaveApiKey} onClose={() => setIsSettingsModalOpen(false)} currentApiKey={apiKey} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} />
      <FullScreenPreview variant={fullScreenVariant} onClose={() => setFullScreenVariant(null)} onRefine={handleRefine} onUseAsReference={handleUseAsReference} />
    </>
  );
};

export default MainApp;