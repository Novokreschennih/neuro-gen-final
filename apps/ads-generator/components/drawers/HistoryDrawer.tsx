
import React from 'react';
import { HistoryEntry } from '../../types';
import Drawer from './Drawer';

interface HistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryEntry[];
    onLoad: (entry: HistoryEntry) => void;
    onClear: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, history, onLoad, onClear }) => {
    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="История генераций">
             <div className="flex flex-col h-full">
                {history.length > 0 && (
                     <div className="mb-4">
                        <button onClick={onClear} className="w-full text-sm text-red-400 hover:text-red-300 bg-red-900/50 hover:bg-red-900/80 py-2 px-4 rounded-lg">
                            Очистить историю
                        </button>
                    </div>
                )}
                {history.length === 0 ? (
                    <div className="flex-grow flex items-center justify-center">
                        <p className="text-sm text-gray-500 text-center">История пока пуста. Сгенерируйте креативы, и они появятся здесь.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {history.map((entry) => (
                            <li key={entry.timestamp}>
                                <button
                                    onClick={() => onLoad(entry)}
                                    className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <p className="text-sm font-semibold text-white truncate">{entry.formData.productDescription}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(entry.timestamp).toLocaleString()} - {entry.creatives.length} вариант(а)
                                    </p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Drawer>
    );
};

export default HistoryDrawer;
