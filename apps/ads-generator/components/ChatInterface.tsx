
import React, { useState } from 'react';

interface ChatInterfaceProps {
    onSendMessage: (message: string) => void;
    isRefining: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, isRefining }) => {
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<string[]>([]);

    const handleSend = () => {
        if (message.trim() && !isRefining) {
            onSendMessage(message);
            setHistory(prev => [...prev, message]);
            setMessage('');
        }
    };
    
    const quickPrompts = [
        "Сделай заголовки короче",
        "Перепиши в более официальном стиле",
        "Добавь еще 2 быстрые ссылки про гарантию",
        "Замени картинку на изображение семьи в доме",
    ];

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white">AI-редактор</h3>
                <p className="text-sm text-gray-400">Попросите AI внести правки в креативы.</p>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="text-sm text-gray-400 mb-4">Примеры запросов:</div>
                <div className="space-y-2">
                    {quickPrompts.map((prompt, i) => (
                        <button key={i} onClick={() => setMessage(prompt)} className="w-full text-left text-sm bg-gray-700 p-2 rounded-md hover:bg-gray-600 transition-colors">
                            "{prompt}"
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Напр., 'Сделай тексты более продающими'"
                        className="w-full bg-gray-700 border-gray-600 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                        disabled={isRefining}
                    />
                    <button onClick={handleSend} disabled={isRefining || !message.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isRefining ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
