
import { GoogleGenAI, Type } from "@google/genai";
import { FormData, Goal } from "../types";
import { getApiKey } from './apiKeyService';

const cleanJsonString = (str: string): string => {
  return str.replace(/^```json\s*|```\s*$/g, "").trim();
};

const getAuthenticatedAi = (): GoogleGenAI => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API-ключ Google Gemini не настроен. Пожалуйста, добавьте его в настройках.");
    }
    return new GoogleGenAI({ apiKey });
};

const handleApiError = (error: any, defaultMessage: string): Error => {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('permission denied') || error.message.includes('API_KEY_INVALID'))) {
        return new Error("Неверный API-ключ. Пожалуйста, проверьте его в настройках.");
    }
    return new Error(defaultMessage);
}

export const generateTextContent = async (formData: FormData): Promise<any> => {
  const ai = getAuthenticatedAi();
  
  const isLandingPage = formData.goal === Goal.LANDING_PAGE;

  const contentPrompt = isLandingPage
    ? `Ты — профессиональный маркетолог, копирайтер и бизнес-аналитик. Пользователь хочет создать лендинг и предоставил следующее описание: '${formData.ideaDescription}'.
        Твоя задача:
        1. **Проанализируй запрос:** Внимательно изучи описание. Определи название компании/продукта, суть предложения, целевую аудиторию и ключевые преимущества.
        2. **Структурируй контент:** Создай логичную структуру для лендинга.
        3. **Сгенерируй текст:** Напиши полный, убедительный и продающий текст для лендинга. Он должен включать следующие разделы: Заголовок (яркий и цепляющий), Подзаголовок (раскрывающий суть), Преимущества (3-5 ключевых пунктов в виде списка) и Призыв к действию (четкий и мотивирующий).
        Важно: Весь сгенерированный контент должен соответствовать предоставленной JSON-схеме.`
    : `Ты — эксперт по контент-маркетингу мирового класса. Пользователь хочет создать лид-магнит и предоставил следующую идею/запрос: '${formData.ideaDescription}'.
Твоя задача:
1.  **Проанализируй запрос:** Вникни в суть идеи пользователя. Если запрос нечеткий (например, "хочу что-то для маркетологов"), предложи конкретную, ценную и привлекательную тему (например, "Пошаговый гайд по созданию воронки продаж в социальных сетях").
2.  **Определи структуру:** Разработай логичную и понятную структуру для контента (например, чек-лист, пошаговое руководство, топ-10 советов, шаблон и т.д.).
3.  **Сгенерируй контент:** Напиши полный, экспертный и полезный текст для лид-магнита, который решит проблему целевой аудитории. Контент должен быть хорошо организован, легко читаем и включать заголовок, краткое введение, основную часть (разделенную на логические блоки с подзаголовками) и заключение с сильным призывом к действию.
Важно: Весь сгенерированный контент должен соответствовать JSON-схеме.`;

  const responseSchema = isLandingPage
    ? {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          subheadline: { type: Type.STRING },
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          cta: { type: Type.STRING },
        },
        required: ["headline", "subheadline", "features", "cta"],
      }
    : {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          introduction: { type: Type.STRING },
          mainContent: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                header: { type: Type.STRING },
                body: { type: Type.STRING },
              },
              required: ["header", "body"],
            },
          },
          conclusion: { type: Type.STRING },
          cta: { type: Type.STRING },
        },
        required: ["title", "introduction", "mainContent", "conclusion", "cta"],
      };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = cleanJsonString(response.text);
    return JSON.parse(jsonText);
  } catch (error) {
    throw handleApiError(error, "Не удалось сгенерировать текстовое содержимое от AI.");
  }
};


export const generateHtmlLayout = async (textContent: any, formData: FormData): Promise<string> => {
    const ai = getAuthenticatedAi();
    
    const prompt = `
    Ты — эксперт UI/UX дизайнер и frontend-разработчик, специализирующийся на Tailwind CSS. 
    Создай полный, единый HTML-код для ${formData.goal === Goal.LANDING_PAGE ? 'лендинга' : 'HTML-документа'} используя следующий контент в формате JSON и стиль '${formData.designStyle}'.

    Контент:
    ${JSON.stringify(textContent, null, 2)}

    Требования:
    1.  Код должен быть в одном HTML-файле.
    2.  Используй CDN для Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script> в <head>.
    3.  HTML должен быть полностью адаптивным (mobile-first).
    4.  Дизайн должен быть эстетически привлекательным, современным и соответствовать стилю '${formData.designStyle}'.
    5.  Используй семантические HTML-теги.
    6.  Если дизайн предполагает наличие изображений, используй плейсхолдеры с \`https://picsum.photos\`. Формат URL: \`https://picsum.photos/seed/RANDOM_WORD/WIDTH/HEIGHT\`, где \`RANDOM_WORD\` — уникальное случайное английское слово (например, 'abstract', 'tech', 'nature'), а \`WIDTH\` и \`HEIGHT\` — подходящие размеры (например, 800/600, 1200/800). Всегда добавляй осмысленный \`alt\` атрибут.
    7.  Верни только чистый HTML-код без каких-либо объяснений, комментариев или \`\`\`html ... \`\`\` оберток.
    8.  Для всех ссылок и кнопок, которые подразумевают переход, используй осмысленные плейсхолдеры в атрибуте \`href\`. Формат плейсхолдера: \`href="{{Описание назначения ссылки}}"\`. Описание должно быть кратким и ясным, исходя из текста кнопки. Например, для кнопки "Скачать чек-лист" плейсхолдер будет \`href="{{Ссылка на скачивание чек-листа}}"\`. Для главной кнопки призыва к действию (получение лид-магнита или основная цель лендинга) используй \`href="{{Ссылка на телеграм бота для выдачи лид-магнита}}"\`. Не используй \`href="#"\`.
    `;

    try {
        const response = await ai.models.generateContent({
            model: formData.aiModel,
            contents: prompt,
             config: {
                temperature: 0.5,
            }
        });
        return response.text.replace(/^```html\s*|```\s*$/g, "").trim();
    } catch (error) {
       throw handleApiError(error, "Не удалось сгенерировать HTML-макет от AI.");
    }
};


export const refineHtml = async (currentHtml: string, userRequest: string, formData: FormData): Promise<string> => {
    const ai = getAuthenticatedAi();

    const prompt = `
    Ты — опытный фронтенд-разработчик, мастер Tailwind CSS.
    Вот текущий HTML-код страницы:
    \`\`\`html
    ${currentHtml}
    \`\`\`
    
    Внеси следующее изменение, запрошенное пользователем: "${userRequest}".

    Важные правила:
    1.  Сохраняй общую структуру, адаптивность и стили страницы.
    2.  Изменения должны быть точными и соответствовать запросу.
    3.  Разрешено добавлять, изменять или удалять изображения. Для новых или измененных изображений используй плейсхолдеры \`https://picsum.photos\`. Если пользователь просит "заменить картинку" или что-то подобное, просто измени \`seed\` в URL \`https://picsum.photos/seed/NEW_RANDOM_WORD/WIDTH/HEIGHT\`, чтобы получить новое изображение. Не генерируй изображения с помощью других AI, используй только \`picsum.photos\`.
    4.  Убедись, что все ссылки и кнопки используют осмысленные плейсхолдеры в атрибуте \`href\` в формате \`href="{{Описание назначения ссылки}}"\`, а не \`href="#"\`. Описание должно соответствовать контексту. Для главной кнопки призыва к действию должен использоваться плейсхолдер \`href="{{Ссылка на телеграм бота для выдачи лид-магнита}}"\`.
    5.  Убедись, что Tailwind CSS CDN скрипт остается в <head>.
    6.  Верни полный, обновленный HTML-код страницы.
    7.  Ответ должен содержать только сам HTML-код, без \`\`\`html ... \`\`\` и каких-либо комментариев.
    `;

    try {
        const response = await ai.models.generateContent({
            model: formData.aiModel,
            contents: prompt
        });
        return response.text.replace(/^```html\s*|```\s*$/g, "").trim();
    } catch (error) {
        throw handleApiError(error, "Не удалось отредактировать HTML с помощью AI.");
    }
};
