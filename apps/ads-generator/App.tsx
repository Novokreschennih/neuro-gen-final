
import React, { useState, useCallback, useEffect } from 'react';
import { FormData, AdCreative, AdCreativeGoal, CreativeStyle, AIModel, HistoryEntry } from './types';
import { WIZARD_STEPS } from './constants';
import * as geminiService from './services/geminiService';
import Step1Goal from './components/Step1Goal';
import Step2Info from './components/Step2Info';
import Step3Style from './components/Step3Style';
import Step4Result from './components/Step4Result';
import PinValidation from './components/PinValidation';
import LandingPage from './components/LandingPage';
import FloatingButtons from './components/FloatingButtons';
import HistoryDrawer from './components/drawers/HistoryDrawer';
import HelpDrawer from './components/drawers/HelpDrawer';
import LegalDrawer from './components/drawers/LegalDrawer';
import ApiKeyModal from './components/modals/ApiKeyModal';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
    const [showPinValidation, setShowPinValidation] = useState(false);
    
    const [currentStep, setCurrentStep] = useState<number>(() => {
        const savedStep = localStorage.getItem('currentStep');
        return savedStep ? JSON.parse(savedStep) : 1;
    });

    const initialFormData: FormData = {
        goal: null,
        productDescription: '',
        targetAudience: '',
        usp: [''],
        websiteUrl: '',
        keywords: '',
        creativeStyle: CreativeStyle.PROFESSIONAL,
        variantCount: 3,
        aiModel: AIModel.GEMINI_FLASH,
    };

    const [formData, setFormData] = useState<FormData>(() => {
        const savedFormData = localStorage.getItem('formData');
        return savedFormData ? JSON.parse(savedFormData) : initialFormData;
    });

    const [generatedCreatives, setGeneratedCreatives] = useState<AdCreative[] | null>(() => {
        const savedCreatives = localStorage.getItem('generatedCreatives');
        return savedCreatives ? JSON.parse(savedCreatives) : null;
    });

    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        const savedHistory = localStorage.getItem('generationHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for drawers and modals
    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
    const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false);
    const [isLegalDrawerOpen, setIsLegalDrawerOpen] = useState(false);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);


    useEffect(() => {
        localStorage.setItem('currentStep', JSON.stringify(currentStep));
    }, [currentStep]);

    useEffect(() => {
        localStorage.setItem('formData', JSON.stringify(formData));
    }, [formData]);
    
    useEffect(() => {
        localStorage.setItem('generationHistory', JSON.stringify(history));
    }, [history]);
    
    useEffect(() => {
        if (generatedCreatives) {
            localStorage.setItem('generatedCreatives', JSON.stringify(generatedCreatives));
        } else {
            localStorage.removeItem('generatedCreatives');
        }
    }, [generatedCreatives]);


    const handlePinSuccess = () => {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
        setShowPinValidation(false);
        handleRestart();
    };
    
    const handleRestart = () => {
        setCurrentStep(1);
        setFormData(initialFormData);
        setGeneratedCreatives(null);
        setError(null);
        localStorage.removeItem('formData');
        localStorage.removeItem('currentStep');
        localStorage.removeItem('generatedCreatives');
    };

    const updateFormData = (data: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleNextStep = () => setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length));
    const handlePrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    
    const handleSelectGoal = (goal: AdCreativeGoal) => {
        updateFormData({ goal });
        handleNextStep();
    };

    const preFlightCheck = () => {
        const apiKey = localStorage.getItem('gemini-api-key');
        if (!apiKey) {
            setError("Пожалуйста, введите ваш API-ключ в настройках.");
            setIsApiKeyModalOpen(true);
            return false;
        }
        setError(null);
        return true;
    }

    const handleGenerate = useCallback(async () => {
        if (!preFlightCheck()) return;

        setIsLoading(true);
        setError(null);
        setCurrentStep(4);
        try {
            const result = await geminiService.generateAdCreatives(formData);
            setGeneratedCreatives(result);
            const newHistoryEntry: HistoryEntry = { formData, creatives: result, timestamp: Date.now() };
            setHistory(prev => [newHistoryEntry, ...prev]);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
            setGeneratedCreatives(null);
        } finally {
            setIsLoading(false);
        }
    }, [formData]);

    const handleRefine = useCallback(async (prompt: string) => {
        if (!generatedCreatives) return;
        if (!preFlightCheck()) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.refineAdCreatives(generatedCreatives, prompt, formData);
            setGeneratedCreatives(result);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred while refining.");
        } finally {
            setIsLoading(false);
        }
    }, [generatedCreatives, formData]);

    const handleLoadFromHistory = (entry: HistoryEntry) => {
        setFormData(entry.formData);
        setGeneratedCreatives(entry.creatives);
        setCurrentStep(4);
        setIsHistoryDrawerOpen(false);
    };

    const handleClearHistory = () => {
        setHistory([]);
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Goal onSelectGoal={handleSelectGoal} />;
            case 2:
                return <Step2Info formData={formData} onUpdate={updateFormData} onNext={handleNextStep} onBack={handlePrevStep} />;
            case 3:
                return <Step3Style formData={formData} onUpdate={updateFormData} onGenerate={handleGenerate} onBack={handlePrevStep} />;
            case 4:
                return <Step4Result 
                            formData={formData} 
                            generatedCreatives={generatedCreatives} 
                            isLoading={isLoading} 
                            error={error} 
                            onRefine={handleRefine} 
                            onRestart={handleRestart}
                        />;
            default:
                return <div>Неизвестный шаг</div>;
        }
    };

    if (!isAuthenticated) {
        if (showPinValidation) {
            return <PinValidation onSuccess={handlePinSuccess} />;
        }
        return <LandingPage onStart={() => setShowPinValidation(true)} />;
    }

    return (
        <>
            <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
                <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">AI Ad Creative Generator</h1>
                        <p className="text-gray-400 text-sm sm:text-base">для Яндекс.Директ</p>
                    </div>
                     <button onClick={handleLogout} className="bg-gray-700 hover:bg-red-600 text-white text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-lg transition duration-300">
                        Выйти
                    </button>
                </header>
                
                <main className="max-w-7xl mx-auto">
                    {currentStep < 4 && (
                        <ol className="flex items-center w-full max-w-2xl mx-auto text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base mb-12">
                            {WIZARD_STEPS.map(step => (
                                 <li key={step.id} className={`flex md:w-full items-center ${currentStep >= step.id ? 'text-indigo-600 dark:text-indigo-500' : ''} after:content-[''] after:w-full after:h-1 after:border-b ${currentStep > step.id ? 'after:border-indigo-600' : 'after:border-gray-700'} after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
                                    <span className={`flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-500 ${currentStep >= step.id ? 'font-bold' : ''}`}>
                                        <span className={`mr-2 h-6 w-6 flex items-center justify-center rounded-full ${currentStep >= step.id ? 'bg-indigo-600 text-white' : 'bg-gray-700'}`}>{step.id}</span>
                                        {step.title}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}
                    <div className="bg-gray-800/50 rounded-lg p-4 sm:p-8 border border-gray-700/50 shadow-2xl">
                        <div className="animate-fade-in-up">
                            {renderStep()}
                        </div>
                    </div>
                </main>
            </div>
            
            <FloatingButtons 
                onHistoryClick={() => setIsHistoryDrawerOpen(true)}
                onHelpClick={() => setIsHelpDrawerOpen(true)}
                onLegalClick={() => setIsLegalDrawerOpen(true)}
                onSettingsClick={() => setIsApiKeyModalOpen(true)}
            />

            <HistoryDrawer 
                isOpen={isHistoryDrawerOpen}
                onClose={() => setIsHistoryDrawerOpen(false)}
                history={history}
                onLoad={handleLoadFromHistory}
                onClear={handleClearHistory}
            />
            
            <HelpDrawer isOpen={isHelpDrawerOpen} onClose={() => setIsHelpDrawerOpen(false)} />
            <LegalDrawer isOpen={isLegalDrawerOpen} onClose={() => setIsLegalDrawerOpen(false)} />
            <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
        </>
    );
};

export default App;