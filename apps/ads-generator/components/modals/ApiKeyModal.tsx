
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setApiKey(localStorage.getItem('gemini-api-key') || '');
            setSaved(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('gemini-api-key', apiKey);
        setSaved(true);
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    const handleDelete = () => {
        localStorage.removeItem('gemini-api-key');
        setApiKey('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Настройки API-ключа">
            <div className="space-y-4 text-gray-300">
                <p>
                    Введите ваш персональный API-ключ для Google Gemini. Ключ будет сохранен локально в вашем браузере.
                </p>
                <div>
                    <label htmlFor="apiKeyInput" className="block text-sm font-medium text-gray-400 mb-1">
                        Gemini API Key
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            id="apiKeyInput"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Введите ваш API-ключ"
                            className="w-full bg-gray-700 border-gray-600 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                        />
                        {apiKey && (
                             <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-sm">
                                Удалить
                            </button>
                        )}
                    </div>
                </div>

                <div className="pt-2">
                    <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        {saved ? 'Сохранено!' : 'Сохранить и закрыть'}
                    </button>
                </div>
                 <p className="text-xs text-gray-500 text-center">
                    Ваш ключ хранится только в вашем браузере и не передается на наши серверы.
                </p>
            </div>
        </Modal>
    );
};

export default ApiKeyModal;