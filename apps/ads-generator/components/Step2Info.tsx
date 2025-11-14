
import React, { useState, useCallback } from 'react';
import { FormData, AIModel } from '../types';
import { extractInfoFromContent } from '../services/geminiService';

interface Step2InfoProps {
  formData: Partial<FormData>;
  onUpdate: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2Info: React.FC<Step2InfoProps> = ({ formData, onUpdate, onNext, onBack }) => {
  const [analysisMode, setAnalysisMode] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState(formData.websiteUrl || '');
  const [fileContent, setFileContent] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [extractedData, setExtractedData] = useState<{
    productDescription: string;
    targetAudience: string;
    usp: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    setExtractedData(null);
    
    const contentToAnalyze = analysisMode === 'url' ? `Контент со страницы ${url}. Проанализируй его.` : fileContent;
    
    if (!contentToAnalyze.trim()) {
        setError('Пожалуйста, укажите URL или загрузите файл с контентом.');
        setIsAnalyzing(false);
        return;
    }

    // A simple proxy is needed for real-world scenarios to avoid CORS issues.
    // For this demo, we'll assume the user provides text content from the file upload.
    // We'll add a placeholder for URL fetching.
    if (analysisMode === 'url') {
        setError('Анализ по URL временно недоступен. Пожалуйста, скопируйте текст со страницы и загрузите его как файл.');
        setIsAnalyzing(false);
        return;
    }

    try {
        const result = await extractInfoFromContent(contentToAnalyze, formData.aiModel || AIModel.GEMINI_FLASH);
        setExtractedData({
            productDescription: result.productDescription || '',
            targetAudience: result.targetAudience || '',
            usp: result.usp || [''],
        });
    } catch (e: any) {
        setError(e.message || "Произошла неизвестная ошибка при анализе.");
    } finally {
        setIsAnalyzing(false);
    }
  }, [analysisMode, url, fileContent, formData.aiModel]);

  const handleConfirm = () => {
    if (extractedData) {
        onUpdate({ ...extractedData, websiteUrl: url });
        onNext();
    }
  };

  if (extractedData) {
    return <ReviewAndEditStep data={extractedData} setData={setExtractedData} onConfirm={handleConfirm} onBack={() => setExtractedData(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4 text-center">Расскажите о вашем продукте</h2>
      <p className="text-lg text-gray-400 mb-12 text-center">Предоставьте ссылку на ваш сайт или загрузите файл с описанием.</p>
      
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
        <div className="flex justify-center border-b border-gray-700 mb-6">
          <button onClick={() => setAnalysisMode('url')} className={`px-6 py-3 font-medium ${analysisMode === 'url' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Указать URL</button>
          <button onClick={() => setAnalysisMode('file')} className={`px-6 py-3 font-medium ${analysisMode === 'file' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Загрузить файл</button>
        </div>

        {analysisMode === 'url' && (
          <div className="space-y-4">
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-300">Ссылка на посадочную страницу</label>
            <input
              type="url"
              name="websiteUrl"
              id="websiteUrl"
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}

        {analysisMode === 'file' && (
          <div className="space-y-4">
            <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-300">Загрузите файл (txt, md, html)</label>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              accept=".txt,.md,.html"
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
            />
          </div>
        )}
        
        {error && <p className="mt-4 text-center text-red-400">{error}</p>}

        <div className="mt-6">
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center disabled:bg-green-800/50">
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Анализ...
              </>
            ) : "Проанализировать и извлечь данные"}
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
          Назад
        </button>
      </div>
    </div>
  );
};

// --- Sub-component for Reviewing and Editing ---

const ReviewAndEditStep: React.FC<{
    data: { productDescription: string; targetAudience: string; usp: string[] };
    setData: React.Dispatch<React.SetStateAction<any>>;
    onConfirm: () => void;
    onBack: () => void;
}> = ({ data, setData, onConfirm, onBack }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleUspChange = (index: number, value: string) => {
        const newUsp = [...data.usp];
        newUsp[index] = value;
        setData((prev: any) => ({ ...prev, usp: newUsp }));
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4 text-center">Проверьте извлеченные данные</h2>
            <p className="text-lg text-gray-400 mb-12 text-center">AI проанализировал ваш контент. Вы можете отредактировать данные перед генерацией.</p>
      
            <div className="space-y-6 bg-gray-800 p-8 rounded-lg border border-gray-700">
                <div>
                    <label htmlFor="productDescription" className="block text-sm font-medium text-gray-300">Продукт/Услуга</label>
                    <textarea id="productDescription" name="productDescription" rows={3}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={data.productDescription} onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-300">Целевая аудитория</label>
                    <textarea id="targetAudience" name="targetAudience" rows={3}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={data.targetAudience} onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Ключевые преимущества / УТП</label>
                    <div className="space-y-2 mt-1">
                        {data.usp.map((uspItem, index) => (
                            <input key={index} type="text" value={uspItem} onChange={(e) => handleUspChange(index, e.target.value)}
                                className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                    Назад к анализу
                </button>
                <button onClick={onConfirm} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                    Подтвердить и Далее
                </button>
            </div>
        </div>
    );
}

export default Step2Info;
