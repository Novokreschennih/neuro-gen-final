import React from 'react';
import Icon from './Icon';
import { useI18n } from '../hooks/useI18n';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  if (!isOpen) return null;
  
  // A helper to render text with <strong> tags from the translation string
  const TextWithStrong: React.FC<{ textKey: string }> = ({ textKey }) => {
    const text = t(textKey);
    const parts = text.split(/<strong>(.*?)<\/strong>/g);
    return (
      <p>
        {parts.map((part, index) =>
          index % 2 === 1 ? <strong key={index} className="font-semibold text-gray-200">{part}</strong> : part
        )}
      </p>
    );
  };


  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl border border-gray-700 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className='flex items-center'>
                <Icon name="shield" className="w-7 h-7 text-indigo-400" />
                <h2 className="text-xl font-bold text-white ml-3">{t('legalModal.title')}</h2>
            </div>
             <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                <Icon name="close" className="w-6 h-6" />
            </button>
        </div>
        
        <div className="overflow-y-auto space-y-6 pr-2 text-gray-300">
            {/* Privacy Policy */}
            <section>
                <h3 className="text-lg font-semibold text-indigo-300 mb-2">{t('legalModal.privacyTitle')}</h3>
                <p className="text-sm text-gray-500 mb-3">{t('legalModal.privacyDate')}</p>
                <div className="space-y-3">
                    <p>{t('legalModal.privacyIntro')}</p>
                    
                    <h4 className="font-semibold text-gray-200 pt-2">{t('legalModal.privacyDataTitle')}</h4>
                    <TextWithStrong textKey="legalModal.privacyDataContent" />
                    
                    <h4 className="font-semibold text-gray-200 pt-2">{t('legalModal.privacyStorageTitle')}</h4>
                    <TextWithStrong textKey="legalModal.privacyStorageLocal" />
                    <TextWithStrong textKey="legalModal.privacyStorageContent" />
                    <TextWithStrong textKey="legalModal.privacyImportant" />
                </div>
            </section>
            
            <div className="border-t border-gray-700"></div>

            {/* Terms of Use */}
            <section>
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">{t('legalModal.termsTitle')}</h3>
                <div className="space-y-4">
                    <p>{t('legalModal.termsIntro')}</p>
                    <ul className="space-y-3 pl-4 list-disc list-outside">
                       <li><TextWithStrong textKey="legalModal.termsAsIs" /></li>
                       <li><TextWithStrong textKey="legalModal.termsApiUse" /></li>
                       <li><TextWithStrong textKey="legalModal.termsLiability" /></li>
                       <li><TextWithStrong textKey="legalModal.termsAiResults" /></li>
                       <li><TextWithStrong textKey="legalModal.termsChanges" /></li>
                    </ul>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
