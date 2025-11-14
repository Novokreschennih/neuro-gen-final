import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ru';
type TranslationSet = { [key: string]: string | TranslationSet };

const enTranslations: TranslationSet = {
  "header": {
    "title": "AI Webpage Redesigner",
    "logout": "Logout",
    "settings": "API Key Settings",
    "help": "Help & Instructions",
    "legal": "Legal Information"
  },
  "selectors": {
    "aiModel": "AI Model",
    "designStyle": "Design Style"
  },
  "designStyles": {
    "aiChoice": "AI's Choice",
    "minimalist": "Minimalist",
    "monochromatic": "Monochromatic",
    "glassmorphism": "Glassmorphism",
    "aurora": "Aurora",
    "neumorphism": "Neumorphism",
    "brutalism": "Brutalism",
    "corporate": "Corporate",
    "playful": "Playful",
    "futuristic": "Futuristic"
  },
  "history": {
    "empty": "No history yet. Generate a design to see it here."
  },
  "previewCard": {
    "mobileView": "Mobile View",
    "desktopView": "Desktop View",
    "fullScreenView": "Full Screen View",
    "useAsReference": "Use as Reference"
  },
  "appliedPreview": {
    "reference": "Reference Design",
    "target": "Target Content",
    "result": "Result",
    "placeholder": "<!-- Result will appear here -->",
    "copy": "Copy Code",
    "download": "Download HTML",
    "copied": "Copied!",
    "copyFailed": "Copy Failed"
  },
  "fullScreenPreview": {
    "copied": "Copied!",
    "copyFailed": "Failed to copy",
    "copy": "Copy HTML",
    "download": "Download",
    "refining": "Refining design...",
    "placeholder": "Refine the design... e.g., 'Make all buttons blue' or 'Use a lighter color palette'",
    "useAsReference": "Use as Reference",
    "tabPreview": "Preview",
    "tabCode": "Code"
  },
  "loader": {
    "magic": "AI is working its magic..."
  },
  "codeInput": {
    "upload": "Upload File"
  },
  "app": {
    "loadingMessageRedesign": "Generating 3 design variants...",
    "loadingMessageApply": "Applying design styles...",
    "errorUnknown": "An unknown error occurred.",
    "errorRefinement": "An unknown error occurred during refinement.",
    "errorApiKeyMissing": "API Key is not set. Please set your API key in the settings.",
    "errorInvalidResponse": "The AI returned an invalid response format. Please try again.",
    "controlsTitle": "Controls",
    "tabGenerator": "Generator",
    "tabHistory": "History",
    "modeRedesign": "Redesign Page",
    "modeApply": "Apply Design",
    "htmlToRedesign": "HTML to Redesign",
    "referenceHtml": "Reference Design (Style Source)",
    "targetHtml": "Target Page (Content Source)",
    "placeholderRedesign": "Paste your HTML or just plain text here...",
    "placeholderReference": "Paste reference HTML...",
    "placeholderTarget": "Paste target HTML...",
    "generating": "Generating...",
    "generate": "✨ Generate",
    "welcomeTitle": "Start Creating",
    "welcomeMessage": "Paste your HTML code or just plain text into the field on the left, select a design style, and click 'Generate' to see the AI's magic.",
    "generateMore": "✨ Generate More",
    "loadingMessageMore": "Generating 3 more variants...",
    "collapseControls": "Collapse controls",
    "expandControls": "Expand controls"
  },
  "landingPage": {
    "title": "AI Webpage Redesigner",
    "subtitle": "Instantly transform your raw HTML into stunning, modern designs with the power of generative AI. Your vision, realized in seconds.",
    "feature1": {
      "title": "Instant Redesigns",
      "description": "Transform your HTML into beautiful, production-ready designs with a single click."
    },
    "feature2": {
      "title": "Style Transfer",
      "description": "Apply the look and feel from any webpage to your own content seamlessly."
    },
    "feature3": {
      "title": "Iterative Refinement",
      "description": "Chat with the AI to tweak colors, fonts, and layouts until it's perfect."
    },
    "ctaButton": "Get Started"
  },
  "pinCodePage": {
    "title": "Enter Access Code",
    "subtitle": "Please enter your PIN code to continue.",
    "placeholder": "----",
    "button": "Unlock",
    "verifying": "Verifying...",
    "error": "Invalid PIN Code. Please try again.",
    "errorNetwork": "Network error. Please check your connection and try again.",
    "errorUsedOrNotFound": "PIN not found or already used.",
    "errorAccessDenied": "Access denied for this PIN."
  },
  "apiKeyModal": {
    "title": "API Key Settings",
    "description": "Your Gemini API key is required to use the app. It's stored securely in your browser's local storage and is never sent anywhere else.",
    "getApiKeyLink": "Get your API Key from Google AI Studio",
    "label": "Your Gemini API Key",
    "placeholder": "Enter your API key",
    "saveButton": "Save Key"
  },
  "helpModal": {
    "title": "Help",
    "howItWorksTitle": "How The App Works",
    "howItWorksContent1": "This application leverages powerful language models from Google (Gemini) to transform your HTML code. When you provide HTML and select a style, we send it to the AI model with a special set of instructions, asking it to act as an expert UI/UX designer and rewrite your styles using Tailwind CSS.",
    "howItWorksContent2": "The process is fully automated. The AI analyzes your content structure and creatively applies the chosen style while preserving your original text and HTML tags. As a result, you receive several unique design variants in a matter of seconds.",
    "instructionsTitle": "Instructions",
    "instructionsPoint1": "1. Redesign Page:",
    "instructionsText1": "Paste your HTML code into the 'HTML to Redesign' field. Select a design style and an AI model, then click 'Generate'. You will receive multiple design options to choose from.",
    "instructionsPoint2": "2. Apply Design:",
    "instructionsText2": "This mode allows you to transfer a design from one page to another. Paste the HTML with the desired design into 'Reference Design', and the HTML with your content into 'Target Page'. The AI will apply the styles from the former to the latter.",
    "instructionsPoint3": "3. Iterative Refinement:",
    "instructionsText3": "After generating a design, open it in full-screen view. At the bottom, you will find an input field where you can give the AI commands in natural language (e.g., 'Make all buttons blue') to further refine the design.",
    "instructionsPoint4": "4. History:",
    "instructionsText4": "Every generation you create is saved in the 'History' tab. You can return to previous results at any time and continue working with them."
  },
  "legalModal": {
    "title": "Legal Information",
    "privacyTitle": "Privacy Policy",
    "privacyDate": "Last updated: July 25, 2024",
    "privacyIntro": "We take your privacy seriously. This Privacy Policy explains what data we collect, how we use it, and how we protect it when you use the 'AI Webpage Redesigner' ('Application').",
    "privacyDataTitle": "What Data We Process",
    "privacyDataContent": "<strong>Your HTML Content:</strong> To perform its functions (redesigning, applying styles), the Application processes the HTML content that you provide.",
    "privacyStorageTitle": "How We Use Data",
    "privacyStorageLocal": "<strong>All data is processed ephemerally:</strong> All operations involving your HTML content occur within your browser session on your device.",
    "privacyStorageContent": "<strong>Content Processing:</strong> The content of your HTML is sent to the Google Gemini API solely for the purpose of generating design variations. We do not store, analyze, or share your content anywhere else. It is only used for the API request and is not retained by us.",
    "privacyImportant": "<strong>Important:</strong> We do not have access to your HTML content after your session. All processing is handled between your client and the Google API.",
    "termsTitle": "Terms of Use",
    "termsIntro": "By using the Application, you agree to the following terms:",
    "termsAsIs": "<strong>'As Is' Provision:</strong> The Application is provided 'as is', without any warranties. We do not guarantee that its operation will be error-free or that it will meet all your requirements.",
    "termsApiUse": "<strong>Use of Google Gemini API:</strong> The Application uses the Google Gemini API to generate designs. Your use of this application is also subject to Google's terms of service. You are responsible for the content you process and must ensure it complies with all applicable policies.",
    "termsLiability": "<strong>Limitation of Liability:</strong> We are not liable for any direct or indirect damages (including data loss, service interruptions, or any other losses) arising from the use or inability to use the Application.",
    "termsAiResults": "<strong>AI-Generated Results:</strong> The design generation feature uses a third-party service (Google Gemini). We cannot guarantee the accuracy, relevance, or quality of the designs generated by the AI.",
    "termsChanges": "<strong>Changes to Terms:</strong> We reserve the right to change these terms at any time."
  }
};

const ruTranslations: TranslationSet = {
  "header": {
    "title": "AI Редизайнер Веб-страниц",
    "logout": "Выйти",
    "settings": "Настройки API ключа",
    "help": "Справка и Инструкции",
    "legal": "Правовая информация"
  },
  "selectors": {
    "aiModel": "Модель ИИ",
    "designStyle": "Стиль дизайна"
  },
  "designStyles": {
    "aiChoice": "На усмотрение ИИ",
    "minimalist": "Минималистичный",
    "monochromatic": "Монохромный",
    "glassmorphism": "Глассморфизм",
    "aurora": "Аврора",
    "neumorphism": "Неоморфизм",
    "brutalism": "Брутализм",
    "corporate": "Корпоративный",
    "playful": "Игривый",
    "futuristic": "Футуристичный"
  },
  "history": {
    "empty": "Истории пока нет. Сгенерируйте дизайн, чтобы увидеть его здесь."
  },
  "previewCard": {
    "mobileView": "Мобильный вид",
    "desktopView": "Десктопный вид",
    "fullScreenView": "Полноэкранный вид",
    "useAsReference": "Использовать как шаблон"
  },
  "appliedPreview": {
    "reference": "Эталонный дизайн",
    "target": "Целевой контент",
    "result": "Результат",
    "placeholder": "<!-- Результат появится здесь -->",
    "copy": "Копировать код",
    "download": "Скачать HTML",
    "copied": "Скопировано!",
    "copyFailed": "Ошибка копирования"
  },
  "fullScreenPreview": {
    "copied": "Скопировано!",
    "copyFailed": "Ошибка копирования",
    "copy": "Копировать HTML",
    "download": "Скачать",
    "refining": "Улучшение дизайна...",
    "placeholder": "Улучшите дизайн... например, 'Сделай все кнопки синими' или 'Используй более светлую палитру'",
    "useAsReference": "Использовать как шаблон",
    "tabPreview": "Просмотр",
    "tabCode": "Код"
  },
  "loader": {
    "magic": "ИИ творит свою магию..."
  },
  "codeInput": {
    "upload": "Загрузить файл"
  },
  "app": {
    "loadingMessageRedesign": "Генерация 3 вариантов дизайна...",
    "loadingMessageApply": "Применение стилей дизайна...",
    "errorUnknown": "Произошла неизвестная ошибка.",
    "errorRefinement": "Произошла ошибка во время улучшения.",
    "errorApiKeyMissing": "API ключ не установлен. Пожалуйста, установите ваш API ключ в настройках.",
    "errorInvalidResponse": "ИИ вернул неверный или некорректный ответ. Пожалуйста, попробуйте еще раз.",
    "controlsTitle": "Управление",
    "tabGenerator": "Генератор",
    "tabHistory": "История",
    "modeRedesign": "Редизайн страницы",
    "modeApply": "Применить дизайн",
    "htmlToRedesign": "HTML для редизайна",
    "referenceHtml": "Эталонный дизайн (Источник стиля)",
    "targetHtml": "Целевая страница (Источник контента)",
    "placeholderRedesign": "Вставьте ваш HTML или просто текст сюда...",
    "placeholderReference": "Вставьте эталонный HTML...",
    "placeholderTarget": "Вставьте целевой HTML...",
    "generating": "Генерация...",
    "generate": "✨ Сгенерировать",
    "welcomeTitle": "Начните творить",
    "welcomeMessage": "Вставьте ваш HTML-код или просто текст в поле слева, выберите стиль дизайна и нажмите 'Сгенерировать', чтобы увидеть магию ИИ.",
    "generateMore": "✨ Сгенерировать ещё",
    "loadingMessageMore": "Генерация ещё 3 вариантов...",
    "collapseControls": "Свернуть панель",
    "expandControls": "Развернуть панель"
  },
  "landingPage": {
    "title": "AI Редизайнер Веб-страниц",
    "subtitle": "Мгновенно превращайте ваш HTML в потрясающие современные дизайны с помощью генеративного ИИ. Ваше видение, реализованное за секунды.",
    "feature1": {
      "title": "Мгновенный редизайн",
      "description": "Превратите ваш HTML в красивые, готовые к использованию дизайны одним щелчком мыши."
    },
    "feature2": {
      "title": "Перенос стиля",
      "description": "Применяйте внешний вид и ощущение любой веб-страницы к вашему собственному контенту без проблем."
    },
    "feature3": {
      "title": "Итеративное улучшение",
      "description": "Общайтесь с ИИ, чтобы настраивать цвета, шрифты и макеты до тех пор, пока всё не станет идеальным."
    },
    "ctaButton": "Начать"
  },
  "pinCodePage": {
    "title": "Введите код доступа",
    "subtitle": "Пожалуйста, введите ваш PIN-код для продолжения.",
    "placeholder": "----",
    "button": "Войти",
    "verifying": "Проверка...",
    "error": "Неверный PIN-код. Пожалуйста, попробуйте еще раз.",
    "errorNetwork": "Сетевая ошибка. Проверьте подключение к интернету и попробуйте снова.",
    "errorUsedOrNotFound": "PIN-код не найден или уже был использован.",
    "errorAccessDenied": "Доступ запрещен для этого PIN-кода."
  },
  "apiKeyModal": {
    "title": "Настройки API ключа",
    "description": "Ваш API ключ от Gemini необходим для работы приложения. Он надежно хранится в локальном хранилище вашего браузера и никогда никуда не отправляется.",
    "getApiKeyLink": "Получите ваш API ключ в Google AI Studio",
    "label": "Ваш Gemini API ключ",
    "placeholder": "Введите ваш API ключ",
    "saveButton": "Сохранить ключ"
  },
  "helpModal": {
    "title": "Справка",
    "howItWorksTitle": "Как работает приложение",
    "howItWorksContent1": "Это приложение использует мощные языковые модели от Google (Gemini) для преобразования вашего HTML-кода. Когда вы предоставляете HTML и выбираете стиль, мы отправляем его модели ИИ со специальным набором инструкций, прося ее выступить в роли опытного UI/UX дизайнера и переписать ваши стили с использованием Tailwind CSS.",
    "howItWorksContent2": "Процесс полностью автоматизирован. ИИ анализирует структуру вашего контента и творчески применяет выбранный стиль, сохраняя при этом ваш исходный текст и HTML-теги. В результате вы получаете несколько уникальных вариантов дизайна за считанные секунды.",
    "instructionsTitle": "Инструкция",
    "instructionsPoint1": "1. Редизайн страницы:",
    "instructionsText1": "Вставьте ваш HTML-код в поле 'HTML для редизайна'. Выберите стиль дизайна и модель ИИ, затем нажмите 'Сгенерировать'. Вы получите несколько вариантов дизайна на выбор.",
    "instructionsPoint2": "2. Применение стиля:",
    "instructionsText2": "Этот режим позволяет переносить дизайн с одной страницы на другую. Вставьте HTML с желаемым дизайном в 'Эталонный дизайн', а HTML с вашим контентом — в 'Целевая страница'. ИИ применит стили с первого на второй.",
    "instructionsPoint3": "3. Итеративное улучшение:",
    "instructionsText3": "После генерации дизайна, откройте его в полноэкранном режиме. Внизу вы найдете поле для ввода, где вы можете давать ИИ команды на естественном языке (например, 'Сделай все кнопки синими') для дальнейшей доработки дизайна.",
    "instructionsPoint4": "4. История:",
    "instructionsText4": "Каждая ваша генерация сохраняется во вкладке 'История'. Вы можете в любой момент вернуться к предыдущим результатам и продолжить работу с ними."
  },
   "legalModal": {
    "title": "Правовая информация",
    "privacyTitle": "Политика конфиденциальности",
    "privacyDate": "Дата последнего обновления: 25 июля 2024 г.",
    "privacyIntro": "Мы серьезно относимся к вашей конфиденциальности. Настоящая Политика конфиденциальности объясняет, какие данные мы обрабатываем, как мы их используем и защищаем при использовании вами приложения 'AI Редизайнер Веб-страниц' ('Приложение').",
    "privacyDataTitle": "Какие данные мы обрабатываем",
    "privacyDataContent": "<strong>Контент вашего HTML:</strong> Для выполнения своих функций (редизайн, применение стилей) Приложение обрабатывает содержимое HTML, которое вы предоставляете.",
    "privacyStorageTitle": "Как мы используем данные",
    "privacyStorageLocal": "<strong>Все данные обрабатываются временно:</strong> Все операции, связанные с вашим HTML-контентом, происходят исключительно в рамках сессии вашего браузера на вашем устройстве.",
    "privacyStorageContent": "<strong>Обработка контента:</strong> Содержимое вашего HTML отправляется в Google Gemini API исключительно с целью генерации вариантов дизайна. Мы не храним, не анализируем и не передаем содержимое ваших файлов куда-либо еще. Оно используется только для API-запроса и не сохраняется нами.",
    "privacyImportant": "<strong>Важно:</strong> Мы не имеем доступа к вашему HTML-контенту после завершения сессии. Вся обработка происходит между вашим клиентом и Google API.",
    "termsTitle": "Условия использования",
    "termsIntro": "Используя Приложение, вы соглашаетесь со следующими условиями:",
    "termsAsIs": "<strong>Предоставление 'Как есть':</strong> Приложение предоставляется 'как есть', без каких-либо гарантий. Мы не гарантируем, что его работа будет безошибочной или что оно будет соответствовать всем вашим требованиям.",
    "termsApiUse": "<strong>Использование API Google Gemini:</strong> Приложение использует Google Gemini API для генерации дизайнов. Ваше использование приложения также подпадает под условия обслуживания Google. Вы несете ответственность за контент, который вы обрабатываете, и должны убедиться, что он соответствует всем применимым политикам.",
    "termsLiability": "<strong>Ограничение ответственности:</strong> Мы не несем ответственности за любой прямой или косвенный ущерб (включая потерю данных, сбои в работе или любые другие убытки), возникший в результате использования или невозможности использования Приложения.",
    "termsAiResults": "<strong>Результаты работы ИИ:</strong> Функция генерации дизайна использует сторонний сервис (Google Gemini). Мы не можем гарантировать точность, релевантность или качество дизайнов, сгенерированных ИИ.",
    "termsChanges": "<strong>Изменения в Условиях:</strong> Мы оставляем за собой право изменять эти условия в любое время."
  }
};


const translations: { [key in Language]: TranslationSet } = {
    en: enTranslations,
    ru: ruTranslations,
};

interface II18nContext {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<II18nContext | undefined>(undefined);

const getNestedTranslation = (obj: TranslationSet, key: string): string => {
    // Navigate through the object based on the dot-separated key
    const result = key.split('.').reduce((o: any, i) => (o ? o[i] : undefined), obj);
    return typeof result === 'string' ? result : key;
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('ru');

    const t = (key: string): string => {
        const langTranslations = translations[language];
        if (!langTranslations) {
            // Fallback to English if the selected language somehow isn't available
            return getNestedTranslation(translations['en'], key);
        }
        return getNestedTranslation(langTranslations, key);
    };

    const value = {
        language,
        setLanguage,
        t,
    };
    
    // Using React.createElement to avoid JSX parsing issues in .ts files in this environment.
    return React.createElement(I18nContext.Provider, { value }, children);
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};