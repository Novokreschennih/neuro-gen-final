
import React from 'react';
import Drawer from './Drawer';

interface LegalDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const LegalDrawer: React.FC<LegalDrawerProps> = ({ isOpen, onClose }) => {
    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Политика и Условия">
            <div className="space-y-6 text-gray-300">
                <section>
                    <h3 className="text-lg font-semibold text-white mb-2">Политика конфиденциальности</h3>
                    <p>Мы ценим вашу конфиденциальность. Это приложение разработано с принципом "Privacy-First".</p>
                    <ul className="list-disc list-inside mt-2 space-y-2">
                        <li>
                            <strong>Локальная обработка:</strong> Все данные, которые вы вводите (информация о продукте, контент для анализа, ваш API-ключ), обрабатываются и хранятся исключительно локально в вашем браузере.
                        </li>
                        <li>
                            <strong>Данные не покидают ваш компьютер:</strong> Информация отправляется напрямую из вашего браузера в Google Gemini API для генерации и не сохраняется на наших серверах.
                        </li>
                         <li>
                            <strong>Хранилище браузера:</strong> Для вашего удобства, история генераций, введенные данные и ваш API-ключ сохраняются в `localStorage` вашего браузера. Эта информация не покидает ваш компьютер. Очистка кэша браузера или использование соответствующих кнопок в приложении удалит эти данные.
                        </li>
                    </ul>
                </section>
                <section>
                    <h3 className="text-lg font-semibold text-white mb-2">Условия использования</h3>
                    <p>Используя это приложение, вы соглашаетесь со следующими условиями:</p>
                     <ul className="list-disc list-inside mt-2 space-y-2">
                        <li>
                            <strong>Ответственность:</strong> Приложение является инструментом-помощником. Вы несете полную ответственность за проверку, редактирование и использование сгенерированных рекламных материалов в своих кампаниях, а также за управление вашим API-ключом Google Gemini.
                        </li>
                        <li>
                            <strong>Качество генерации:</strong> Качество результатов зависит от предоставленных данных и возможностей модели Google Gemini. Мы не гарантируем 100% точность или эффективность сгенерированных креативов.
                        </li>
                        <li>
                            <strong>Доступность сервиса:</strong> Работа приложения зависит от доступности Google Gemini API. Возможны временные сбои, не зависящие от нас.
                        </li>
                    </ul>
                </section>
            </div>
        </Drawer>
    );
};

export default LegalDrawer;