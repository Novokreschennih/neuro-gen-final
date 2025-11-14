
import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';
import { getHistory, deleteHistoryItem } from '../services/historyService';
import { TrashIcon } from './icons/TrashIcon';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onRestore }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);
  
  const handleDelete = (id: string) => {
    if(window.confirm("Вы уверены, что хотите удалить эту запись из истории?")) {
        const updatedHistory = deleteHistoryItem(id);
        setHistory(updatedHistory);
    }
  }

  const generateTitle = (item: HistoryItem) => {
    const goal = item.formData.goal === 'landing_page' ? 'Лендинг' : 'Лид-магнит';
    const description = item.formData.ideaDescription.substring(0, 40);
    return `${goal}: ${description}${item.formData.ideaDescription.length > 40 ? '...' : ''}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">История Генераций</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
            {history.length > 0 ? (
                history.map(item => (
                    <div key={item.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center transition-colors hover:bg-gray-600/50">
                        <div>
                            <p className="font-semibold text-white">{generateTitle(item)}</p>
                            <p className="text-sm text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => onRestore(item)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1 px-3 rounded-lg text-sm">
                                Восстановить
                            </button>
                             <button onClick={() => handleDelete(item.id)} title="Удалить" className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-400 text-center py-8">История пуста. Создайте что-нибудь!</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
