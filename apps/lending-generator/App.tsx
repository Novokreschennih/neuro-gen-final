
import React, { useState, useCallback, useEffect } from 'react';
import { FormData, Goal, DesignStyle, LeadMagnetFormat, AIModel, HistoryItem } from './types';
import { generateTextContent, generateHtmlLayout, refineHtml } from './services/geminiService';
import StepIndicator from './components/StepIndicator';
import { DESIGN_STYLES, LEAD_MAGNET_FORMATS, LOADING_MESSAGES, AI_MODELS_OPTIONS } from './constants';
import LegalModal from './components/LegalModal';
import { PinValidation } from './components/PinValidation';
import SettingsModal from './components/SettingsModal';
import { hasApiKey } from './services/apiKeyService';
import { SettingsIcon } from './components/icons/SettingsIcon';
import HistoryModal from './components/HistoryModal';
import { addHistoryItem } from './services/historyService';
import { HistoryIcon } from './components/icons/HistoryIcon';

declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
  }
}

const initialFormData: FormData = {
  goal: null,
  ideaDescription: '',
  leadMagnetFormat: null,
  designStyle: null,
  aiModel: AIModel.GEMINI_FLASH,
};


const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    return (
        <div className="w-full max-w-4xl mx-auto text-center animate-fade-in p-8">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 leading-tight">
                Создавайте Лендинги и Лид-магниты с Помощью AI
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Превратите вашу идею в готовый результат за несколько минут. Без кода и навыков дизайна.
            </p>
            <button
                onClick={onStart}
                className="mt-10 px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 animate-pulse"
            >
                Начать Создание →
            </button>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-indigo-400 mb-2">🚀 AI Копирайтинг</h3>
                    <p className="text-gray-400">Наш AI напишет убедительный и структурированный текст для вашего проекта, основываясь на ваших целях.</p>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-indigo-400 mb-2">🎨 Гибкий Дизайн</h3>
                    <p className="text-gray-400">Выберите один из множества стилей, а AI создаст уникальный и адаптивный визуал для вашего контента.</p>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-indigo-400 mb-2">💡 Мгновенный Результат</h3>
                    <p className="text-gray-400">Получите готовый HTML-файл или PDF, который можно сразу же использовать, и редактируйте его с помощью AI.</p>
                </div>
            </div>
        </div>
    );
};


const GeneratorWizard: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [error, setError] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isLegalOpen, setIsLegalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    
    useEffect(() => {
       if (!hasApiKey()) {
          setIsSettingsOpen(true);
      }
    }, []);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = LOADING_MESSAGES.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                    return LOADING_MESSAGES[nextIndex];
                });
            }, 2500);
            return () => clearInterval(interval);
        }
    }, [isLoading]);
    
    const handleNextStep = () => setStep(prev => prev + 1);
    const handlePrevStep = () => {
      if (step > 1) {
        if (step === 4) {
            setGeneratedContent('');
            setChatHistory([]);
        }
        setStep(prev => prev - 1);
      }
    };

    const handleDataChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerationError = (err: any) => {
        const errorMessage = err.message || "Произошла неизвестная ошибка.";
        setError(errorMessage);
        if (errorMessage.includes("API-ключ Google Gemini не настроен")) {
            setIsSettingsOpen(true);
        }
    }
    
    const handleRestoreSession = (item: HistoryItem) => {
        setFormData(item.formData);
        setGeneratedContent(item.generatedContent);
        setChatHistory(item.chatHistory);
        setStep(4);
        setIsHistoryOpen(false);
    };

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setStep(4);
        const newChatHistory: { role: 'user' | 'ai', text: string }[] = [];
        setChatHistory(newChatHistory);
        try {
            const textContent = await generateTextContent(formData);
            const html = await generateHtmlLayout(textContent, formData);
            setGeneratedContent(html);
            addHistoryItem({ formData, generatedContent: html, chatHistory: newChatHistory });
        } catch (err: any) {
            handleGenerationError(err);
        } finally {
            setIsLoading(false);
        }
    }, [formData]);
    
    const handleRegenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedContent('');
        const newChatHistory: { role: 'user' | 'ai', text: string }[] = [];
        setChatHistory(newChatHistory);
        try {
            const textContent = await generateTextContent(formData);
            const html = await generateHtmlLayout(textContent, formData);
            setGeneratedContent(html);
            addHistoryItem({ formData, generatedContent: html, chatHistory: newChatHistory });
        } catch (err: any) {
             handleGenerationError(err);
        } finally {
            setIsLoading(false);
        }
    }, [formData]);

    const handleRefine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        
        setIsLoading(true);
        setError(null);
        const userMessage = chatInput;
        const currentChatHistory = [...chatHistory, { role: 'user' as const, text: userMessage }];
        setChatHistory(currentChatHistory);
        setChatInput('');

        try {
            const newHtml = await refineHtml(generatedContent, userMessage, formData);
            setGeneratedContent(newHtml);
            const finalChatHistory = [...currentChatHistory, { role: 'ai' as const, text: 'Изменения применены!' }];
            setChatHistory(finalChatHistory);
            addHistoryItem({ formData, generatedContent: newHtml, chatHistory: finalChatHistory });
        } catch (err: any) {
            handleGenerationError(err);
            const errorChatHistory = [...currentChatHistory, { role: 'ai' as const, text: 'Произошла ошибка при применении изменений.' }];
            setChatHistory(errorChatHistory);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1Goal onSelect={goal => { handleDataChange('goal', goal); handleNextStep(); }} />;
            case 2: return <Step2Info formData={formData} onChange={handleDataChange} onNext={handleNextStep} onBack={handlePrevStep} />;
            case 3: return <Step3Style formData={formData} onChange={handleDataChange} onGenerate={handleGenerate} onBack={handlePrevStep} />;
            case 4: return <Step4Result 
                            formData={formData}
                            isLoading={isLoading} 
                            loadingMessage={loadingMessage} 
                            content={generatedContent}
                            setContent={setGeneratedContent}
                            error={error} 
                            onBack={() => { setStep(3); setGeneratedContent(''); setChatHistory([]); }}
                            onRegenerate={handleRegenerate}
                            onRefine={handleRefine}
                            chatInput={chatInput}
                            setChatInput={setChatInput}
                            chatHistory={chatHistory}
                            onDownload={() => handleDownload(generatedContent, 'index.html')}
                            />;
            default: return <div>Неизвестный шаг</div>;
        }
    };

    return (
        <div className="w-full relative">
             <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)}
            />
            <HistoryModal 
                isOpen={isHistoryOpen} 
                onClose={() => setIsHistoryOpen(false)}
                onRestore={handleRestoreSession}
            />
            <HelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
            />
            <LegalModal
                isOpen={isLegalOpen}
                onClose={() => setIsLegalOpen(false)}
            />
            <header className="w-full max-w-6xl mx-auto text-center my-8 px-4">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                    AI Генератор Лид-магнитов и Лендингов
                </h1>
                <p className="mt-4 text-lg text-gray-400">От идеи до готового результата за несколько кликов</p>
            </header>
            <main className="w-full max-w-6xl mx-auto px-4">
                 {step < 4 && <StepIndicator currentStep={step} totalSteps={4} />}
                {renderStep()}
            </main>
            <FloatingActionButtons 
                onSettingsClick={() => setIsSettingsOpen(true)}
                onHistoryClick={() => setIsHistoryOpen(true)}
                onHelpClick={() => setIsHelpOpen(true)}
                onLegalClick={() => setIsLegalOpen(true)}
            />
        </div>
    );
};

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [view, setView] = useState<'landing' | 'pin' | 'app'>('landing');

    useEffect(() => {
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        if (authStatus) {
            setIsAuthenticated(true);
            setView('app');
        }
    }, []);
    
    const handlePinSuccess = () => {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        setView('app');
    };
    
    const renderContent = () => {
        if (view === 'app') {
             return <GeneratorWizard />;
        }
        if (view === 'pin') {
            return <PinValidation onSuccess={handlePinSuccess} />;
        }
        return <LandingPage onStart={() => setView('pin')} />;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
            {renderContent()}
        </div>
    );
};


const FloatingActionButtons: React.FC<{onSettingsClick: () => void; onHistoryClick: () => void; onHelpClick: () => void; onLegalClick: () => void;}> = ({ onSettingsClick, onHistoryClick, onHelpClick, onLegalClick }) => {
    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
            <button onClick={onSettingsClick} title="Настройки" className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <SettingsIcon />
            </button>
            <button onClick={onHistoryClick} title="История" className="w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-500 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-400">
                <HistoryIcon />
            </button>
            <button onClick={onHelpClick} title="Инструкция" className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-500 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-400">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button onClick={onLegalClick} title="Правовая информация" className="w-14 h-14 bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-600 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 2.056c4.522 0 8.32-2.944 9-7.135a12.02 12.02 0 00-3.382-7.859z" /></svg>
            </button>
        </div>
    );
}

const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Как пользоваться генератором</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="space-y-4 text-gray-300">
                    <div>
                        <h3 className="font-bold text-lg text-indigo-400">Шаг 1: Выберите Цель</h3>
                        <p>Решите, что вы хотите создать: эффективный лендинг для вашего продукта или полезный лид-магнит для привлечения аудитории.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-indigo-400">Шаг 2: Опишите Идею</h3>
                        <p>Это самый важный этап! Просто напишите своими словами, что вы хотите получить. Чем подробнее будет ваше описание, тем лучше AI поймет задачу. Не бойтесь экспериментировать!</p>
                    </div>
                     <div>
                        <h3 className="font-bold text-lg text-indigo-400">Шаг 3: Настройте Внешний Вид</h3>
                        <p>Выберите подходящий формат (для лид-магнита) и визуальный стиль, который соответствует вашему бренду. AI использует это как основу для создания дизайна.</p>
                    </div>
                     <div>
                        <h3 className="font-bold text-lg text-indigo-400">Шаг 4: Магия AI и Редактирование</h3>
                        <p>Получите готовый результат! Если нужно что-то изменить, просто напишите команду в чат-редакторе. Например: <span className="bg-gray-700 px-2 py-1 rounded">'Сделай заголовок крупнее'</span>, <span className="bg-gray-700 px-2 py-1 rounded">'Замени картинку на другую'</span> или <span className="bg-gray-700 px-2 py-1 rounded">'Измени цвет фона на темно-синий'</span>.</p>
                    </div>
                </div>
                 <div className="text-right mt-8">
                    <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg">Понятно</button>
                </div>
            </div>
        </div>
    );
}


const Step1Goal: React.FC<{ onSelect: (goal: Goal) => void }> = ({ onSelect }) => (
  <div className="text-center animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">Что вы хотите создать?</h2>
    <div className="flex flex-col md:flex-row gap-6 justify-center">
      <button onClick={() => onSelect(Goal.LANDING_PAGE)} className="transform transition-transform duration-300 hover:scale-105 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 px-10 rounded-lg text-xl shadow-lg">
        Создать Лендинг
      </button>
      <button onClick={() => onSelect(Goal.LEAD_MAGNET)} className="transform transition-transform duration-300 hover:scale-105 bg-purple-600 hover:bg-purple-500 text-white font-bold py-6 px-10 rounded-lg text-xl shadow-lg">
        Создать Лид-магнит
      </button>
    </div>
  </div>
);


const Step2Info: React.FC<{ formData: FormData; onChange: (f: keyof FormData, v: any) => void; onNext: () => void; onBack: () => void; }> = ({ formData, onChange, onNext, onBack }) => {
    const isLandingPage = formData.goal === Goal.LANDING_PAGE;
    
    const isFormValid = formData.ideaDescription.trim() !== '';

    const title = isLandingPage ? "Расскажите о вашем проекте" : "Какую пользу вы хотите дать?";
    const description = isLandingPage 
      ? 'Опишите ваш продукт, целевую аудиторию и уникальное предложение. AI проанализирует это и создаст текст для лендинга. <br/>Например: "Онлайн-курс по SMM для начинающих. Аудитория - фрилансеры. Уникальность - личная поддержка от куратора".'
      : 'Опишите вашу идею для лид-магнита или спросите совета у AI. <br/>Например: "чек-лист для проверки сайта перед запуском".';
    const placeholder = isLandingPage ? "Опишите ваш лендинг здесь..." : "Напишите здесь...";
    
    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-center">{title}</h2>
            <p className="text-gray-400 text-center mb-6" dangerouslySetInnerHTML={{ __html: description }}></p>
            <div className="space-y-4">
                 <textarea 
                    placeholder={placeholder} 
                    value={formData.ideaDescription} 
                    onChange={e => onChange('ideaDescription', e.target.value)} 
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-md h-40 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
                />
            </div>
            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Назад</button>
                <button onClick={onNext} disabled={!isFormValid} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">Далее</button>
            </div>
        </div>
    );
};


const Step3Style: React.FC<{ formData: FormData; onChange: (f: keyof FormData, v: any) => void; onGenerate: () => void; onBack: () => void; }> = ({ formData, onChange, onGenerate, onBack }) => {
    const isLeadMagnet = formData.goal === Goal.LEAD_MAGNET;
    const isFormValid = formData.designStyle !== null && formData.aiModel !== null && (isLeadMagnet ? formData.leadMagnetFormat !== null : true);

    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center">Выберите формат, стиль и AI-модель</h2>
        
        {isLeadMagnet && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Формат лид-магнита</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {LEAD_MAGNET_FORMATS.map(format => (
                <button key={format} onClick={() => onChange('leadMagnetFormat', format)} className={`py-2 px-4 rounded-lg font-semibold border-2 transition-colors ${formData.leadMagnetFormat === format ? 'bg-indigo-500 border-indigo-500' : 'bg-gray-700 border-gray-600 hover:border-indigo-500'}`}>
                  {format}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Стиль дизайна</h3>
             <div className="flex flex-wrap gap-3 justify-center">
              {DESIGN_STYLES.map(style => (
                <button 
                    key={style} 
                    onClick={() => onChange('designStyle', style)} 
                    className={`py-2 px-4 rounded-lg font-semibold border-2 transition-colors text-sm md:text-base transform hover:scale-105 ${formData.designStyle === style ? 'bg-indigo-500 border-indigo-500 shadow-lg' : 'bg-gray-700 border-gray-600 hover:border-indigo-500'}`}
                >
                  {style}
                </button>
              ))}
            </div>
        </div>

        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center">AI Модель для Дизайна</h3>
             <div className="flex flex-wrap gap-4 justify-center">
              {AI_MODELS_OPTIONS.map(model => (
                <button 
                    key={model.value} 
                    onClick={() => onChange('aiModel', model.value)} 
                    className={`py-3 px-6 rounded-lg font-semibold border-2 transition-colors text-base transform hover:scale-105 ${formData.aiModel === model.value ? 'bg-indigo-500 border-indigo-500 shadow-lg' : 'bg-gray-700 border-gray-600 hover:border-indigo-500'}`}
                >
                  {model.label}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">Pro-модель генерирует более креативные результаты, но может работать дольше.</p>
        </div>

        <div className="flex justify-between items-center mt-8">
          <button onClick={onBack} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Назад</button>
          <div className='text-center'>
            <button 
                onClick={onGenerate} 
                disabled={!isFormValid} 
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg text-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                title={!isFormValid ? "Пожалуйста, заполните все опции" : "Сгенерировать"}
            >
                ✨ Сгенерировать
            </button>
          </div>
        </div>
      </div>
    );
};


const Step4Result: React.FC<{
    formData: FormData;
    isLoading: boolean;
    loadingMessage: string;
    content: string;
    setContent: (val: string) => void;
    error: string | null;
    onBack: () => void;
    onRegenerate: () => void;
    onRefine: (e: React.FormEvent) => void;
    chatInput: string;
    setChatInput: (val: string) => void;
    chatHistory: {role: 'user' | 'ai', text: string}[];
    onDownload: () => void;
}> = ({ formData, isLoading, loadingMessage, content, setContent, error, onBack, onRegenerate, onRefine, chatInput, setChatInput, chatHistory, onDownload }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [previewDeviceMode, setPreviewDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
    const [mainViewMode, setMainViewMode] = useState<'preview' | 'code'>('preview');

    const handleCopyCode = () => {
        if (!content) return;
        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy code:", err);
            alert("Не удалось скопировать код. Пожалуйста, скопируйте вручную.");
        });
    };
    
    const handleDownloadPdf = () => {
        const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
        const loader = document.createElement('div');
        loader.innerText = 'Генерация PDF...';
        loader.style.position = 'fixed';
        loader.style.top = '50%';
        loader.style.left = '50%';
        loader.style.transform = 'translate(-50%, -50%)';
        loader.style.padding = '20px';
        loader.style.background = 'rgba(0,0,0,0.8)';
        loader.style.color = 'white';
        loader.style.borderRadius = '10px';
        loader.style.zIndex = '1000';
        document.body.appendChild(loader);

        if (iframe && iframe.contentWindow) {
            const iframeBody = iframe.contentWindow.document.body;
            
            window.html2canvas(iframeBody, {
                scale: 2,
                useCORS: true,
                windowWidth: iframeBody.scrollWidth,
                windowHeight: iframeBody.scrollHeight,
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                let heightLeft = pdfHeight;
                let position = 0;
                
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();

                while (heightLeft >= 0) {
                  position = heightLeft - pdfHeight;
                  pdf.addPage();
                  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                  heightLeft -= pdf.internal.pageSize.getHeight();
                }

                pdf.save('lead-magnet.pdf');
            }).catch(err => {
                console.error("PDF generation failed:", err);
                alert("Не удалось сгенерировать PDF. Ошибка в консоли.");
            }).finally(() => {
                document.body.removeChild(loader);
            });
        } else {
             document.body.removeChild(loader);
        }
    };

    if (isLoading && !content) {
        return (
            <div className="text-center py-16 animate-fade-in flex flex-col items-center">
                 <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
                <h2 className="text-2xl font-bold mt-6">Генерация...</h2>
                <p className="text-gray-400 mt-2">{loadingMessage}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16 animate-fade-in">
                <h2 className="text-2xl font-bold text-red-500">Произошла ошибка</h2>
                <p className="text-gray-400 mt-2">{error}</p>
                <button onClick={onBack} className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2 md:gap-4">
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">‹ Назад</button>
                 <button 
                    onClick={onRegenerate} 
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-500"
                    disabled={isLoading}
                    title="Сгенерировать новый вариант с теми же настройками"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden md:inline">Перегенерировать</span>
                </button>
                 <div className="hidden md:flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
                    <button onClick={() => setMainViewMode('preview')} title="Предпросмотр" className={`p-2 rounded-md transition-colors ${mainViewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button onClick={() => setMainViewMode('code')} title="Код" className={`p-2 rounded-md transition-colors ${mainViewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </button>
                </div>
                 {mainViewMode === 'preview' && (
                    <div className="hidden md:flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
                        <button onClick={() => setPreviewDeviceMode('desktop')} title="Десктопный вид" className={`p-2 rounded-md transition-colors ${previewDeviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </button>
                        <button onClick={() => setPreviewDeviceMode('mobile')} title="Мобильный вид" className={`p-2 rounded-md transition-colors ${previewDeviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </button>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <button onClick={onDownload} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">Скачать HTML</button>
                {formData.goal === Goal.LEAD_MAGNET && (
                     <button onClick={handleDownloadPdf} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Скачать PDF</button>
                )}
                 <button 
                    onClick={handleCopyCode} 
                    className={`font-bold py-2 px-4 rounded-lg transition-colors duration-200 ${
                        isCopied 
                            ? 'bg-emerald-600 text-white cursor-default' 
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                    disabled={isCopied}
                >
                    {isCopied ? 'Скопировано!' : 'Копировать код'}
                </button>
            </div>
          </div>
            <div className="flex flex-col gap-4 h-[80vh]">
                <div className="flex-grow bg-gray-800 rounded-lg shadow-inner overflow-hidden p-2 md:p-4">
                    {mainViewMode === 'preview' ? (
                        <div className="w-full h-full flex justify-center items-start overflow-auto">
                            <div className={`relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out mx-auto ${
                                previewDeviceMode === 'mobile' ? 'w-[375px] h-[812px] max-w-full max-h-full' : 'w-full h-full'
                            }`}>
                                <iframe id="preview-iframe" srcDoc={content} className="w-full h-full border-0" title="Preview" />
                            </div>
                        </div>
                    ) : (
                         <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full bg-gray-900 text-gray-200 font-mono text-sm p-4 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            spellCheck="false"
                        />
                    )}
                </div>
                <div className="flex-shrink-0 h-64 flex flex-col bg-gray-700 p-4 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-2">Редактировать с помощью AI</h3>
                    <p className="text-sm text-gray-400 mb-4">Опишите изменения на естественном языке. AI внесет правки в ваш текущий код.</p>
                    <div className="flex-grow bg-gray-800 rounded-md p-2 mb-4 overflow-y-auto">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`p-2 my-1 rounded-lg text-sm ${msg.role === 'user' ? 'bg-indigo-500/50 text-right' : 'bg-gray-600/50 text-left'}`}>
                                {msg.text}
                            </div>
                        ))}
                         {isLoading && chatInput && <div className="p-2 my-1 rounded-lg text-sm bg-gray-600/50 text-left animate-pulse">AI думает...</div>}
                    </div>
                    <form onSubmit={onRefine} className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Например, 'Сделай кнопку зеленой'"
                            className="flex-grow p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500" disabled={isLoading || !chatInput.trim()}>
                            {isLoading ? '...' : 'Отправить'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default App;