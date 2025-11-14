
import React, { useState } from 'react';
import { PrivacyPolicyContent, TermsOfUseContent } from './LegalContent';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Правовая информация</h2>
            <div className="border-b border-gray-700 mt-4">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'privacy'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                  }`}
                >
                  {/* FIX: Invalid JSX syntax `{{...}}` for text content. */}
                  Политика конфиденциальности
                </button>
                <button
                  onClick={() => setActiveTab('terms')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'terms'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                  }`}
                >
                  {/* FIX: Invalid JSX syntax `{{...}}` for text content. */}
                  Условия использования
                </button>
              </nav>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto pr-4">
            {activeTab === 'privacy' ? <PrivacyPolicyContent /> : <TermsOfUseContent />}
        </div>

        <div className="text-right mt-8">
          {/* FIX: Invalid JSX syntax `{{...}}` for text content. */}
          <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg">Понятно</button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
