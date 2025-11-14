import React from 'react';
import Icon from './Icon';
import { useI18n } from '../hooks/useI18n';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  const InstructionItem: React.FC<{ point: string; text: string }> = ({ point, text }) => (
    <div>
      <p className="font-semibold text-gray-200">{point}</p>
      <p className="mt-1 text-gray-400">{text}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className='flex items-center'>
                <Icon name="help" className="w-7 h-7 text-indigo-400" />
                <h2 className="text-xl font-bold text-white ml-3">{t('helpModal.title')}</h2>
            </div>
             <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                <Icon name="close" className="w-6 h-6" />
            </button>
        </div>
        
        <div className="overflow-y-auto space-y-6 pr-2">
            <section>
                <h3 className="text-lg font-semibold text-indigo-300 mb-2">{t('helpModal.howItWorksTitle')}</h3>
                <div className="space-y-3 text-gray-300">
                    <p>{t('helpModal.howItWorksContent1')}</p>
                    <p>{t('helpModal.howItWorksContent2')}</p>
                </div>
            </section>
            
            <div className="border-t border-gray-700"></div>

            <section>
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">{t('helpModal.instructionsTitle')}</h3>
                <div className="space-y-4">
                    <InstructionItem point={t('helpModal.instructionsPoint1')} text={t('helpModal.instructionsText1')} />
                    <InstructionItem point={t('helpModal.instructionsPoint2')} text={t('helpModal.instructionsText2')} />
                    <InstructionItem point={t('helpModal.instructionsPoint3')} text={t('helpModal.instructionsText3')} />
                    <InstructionItem point={t('helpModal.instructionsPoint4')} text={t('helpModal.instructionsText4')} />
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
