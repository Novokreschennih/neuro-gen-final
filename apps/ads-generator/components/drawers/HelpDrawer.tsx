
import React from 'react';
import Drawer from './Drawer';

interface HelpDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpDrawer: React.FC<HelpDrawerProps> = ({ isOpen, onClose }) => {
    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Руководство пользователя">
            <div className="space-y-6 text-gray-300">
                <section>
                    <h3 className="text-lg font-semibold text-white mb-2">Шаг 1: Выбор типа креатива</h3>
                    <p>Начните с выбора цели: вам нужны текстовые объявления для поиска или графические объявления с изображениями для рекламных сетей (РСЯ). Ваш выбор определит дальнейшие шаги.</p>
                </section>
                <section>
                    <h3 className="text-lg font-semibold text-white mb-2">Шаг 2: Анализ продукта</h3>
                    <p>Это самый важный этап. Вместо ручного заполнения, предоставьте AI контент для анализа:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Указать URL:</strong> Вставьте ссылку на вашу посадочную страницу. (Примечание: может не работать для некоторых сайтов из-за CORS).</li>
                        <li><strong>Загрузить файл:</strong> Скопируйте текст с вашего сайта и вставьте в файл .txt или .html, затем загрузите его. Это самый надежный способ.</li>
                    </ul>
                    <p className="mt-2">AI проанализирует контент и сам заполнит описание продукта, целевую аудиторию и УТП. Вы сможете проверить и отредактировать эти данные перед генерацией.</p>
                </section>
                <section>
                    <h3 className="text-lg font-semibold text-white mb-2">Шаг 3: Настройка генерации</h3>
                    <p>Здесь вы управляете стилем и объемом генерации:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Креативный стиль:</strong> Выберите тональность ваших объявлений.</li>
                        <li><strong>Количество вариантов:</strong> Укажите, сколько разных наборов объявлений вы хотите получить для A/B тестирования.</li>
                        <li><strong>AI Модель:</strong> Gemini Flash — быстрее, Gemini Pro — креативнее.</li>
                    </ul>
                </section>
                <section>
                    <h3 className="text-lg font-semibold text-white mb-2">Шаг 4: Результаты и доработка</h3>
                    <p>Вы увидите сгенерированные креативы в удобном формате с предпросмотром. Используйте кнопки "Копировать" для переноса текстов. Для графических объявлений доступно скачивание изображений.</p>
                    <p className="mt-2">Используйте <strong>AI-редактор</strong>, чтобы вносить правки. Просто напишите, что изменить (например, "сделай заголовки короче"), и AI обновит результаты.</p>
                </section>
            </div>
        </Drawer>
    );
};

export default HelpDrawer;
