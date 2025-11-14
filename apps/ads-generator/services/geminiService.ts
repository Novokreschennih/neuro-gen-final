
import { GoogleGenAI, Type } from "@google/genai";
import { AIModel, AdCreative, FormData } from '../types';

const getGenAIClient = () => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
        throw new Error('API-ключ не найден. Пожалуйста, добавьте его в настройках.');
    }
    return new GoogleGenAI({ apiKey });
};


const extractedInfoSchema = {
    type: Type.OBJECT,
    properties: {
        productDescription: { type: Type.STRING, description: 'Краткое, но емкое описание продукта или услуги, предлагаемых на странице.' },
        targetAudience: { type: Type.STRING, description: 'Описание целевой аудитории, на которую нацелен продукт.' },
        usp: {
            type: Type.ARRAY,
            description: 'Массив из 3-5 ключевых преимуществ или уникальных торговых предложений (УТП).',
            items: { type: Type.STRING }
        }
    },
    required: ['productDescription', 'targetAudience', 'usp'],
};

const adCreativeSchema = {
  type: Type.OBJECT,
  properties: {
    headline1: { type: Type.STRING, description: 'Первый заголовок, максимум 56 символов.' },
    headline2: { type: Type.STRING, description: 'Второй заголовок, максимум 30 символов.' },
    adText: { type: Type.STRING, description: 'Текст объявления, максимум 81 символ.' },
    sitelinks: {
      type: Type.ARRAY,
      description: 'От 2 до 4 быстрых ссылок.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Заголовок быстрой ссылки, максимум 30 символов.' },
          description: { type: Type.STRING, description: 'Описание быстрой ссылки, максимум 60 символов.' },
        },
        required: ['title', 'description'],
      },
    },
    clarifications: {
      type: Type.ARRAY,
      description: 'От 2 до 4 уточнений.',
      items: {
        type: Type.STRING,
        description: 'Текст уточнения, максимум 25 символов.',
      },
    },
    displayLink: { type: Type.STRING, description: 'Отображаемая ссылка, максимум 20 символов. Должна быть релевантна сайту.' },
  },
  required: ['headline1', 'headline2', 'adText', 'sitelinks', 'clarifications', 'displayLink'],
};

export const extractInfoFromContent = async (content: string, model: AIModel): Promise<Partial<FormData>> => {
    const ai = getGenAIClient();
    const systemInstruction = `Ты — эксперт-маркетолог и аналитик. Твоя задача — внимательно изучить предоставленный контент с веб-страницы (лендинга) и извлечь из него ключевую информацию. Ты должен четко определить продукт, его целевую аудиторию и основные преимущества. Результат верни в виде JSON-объекта, строго соответствующего схеме.`;

    const userPrompt = `Проанализируй следующий контент и извлеки из него описание продукта, целевую аудиторию и ключевые УТП.\n\nКОНТЕНТ:\n---\n${content}\n---`;

    try {
        const response = await ai.models.generateContent({
            model: model === AIModel.GEMINI_PRO ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: extractedInfoSchema,
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error extracting info from content:", error);
        throw new Error("Не удалось проанализировать контент. Убедитесь, что он содержит достаточно информации о продукте.");
    }
};

export const generateAdCreatives = async (formData: FormData): Promise<AdCreative[]> => {
  const ai = getGenAIClient();
  const model = formData.aiModel === AIModel.GEMINI_PRO ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  
  const systemInstruction = `Ты — опытный директолог и копирайтер, специализирующийся на создании высококонверсионных рекламных объявлений для Яндекс.Директ.
Твоя задача — сгенерировать ${formData.variantCount} уникальных вариантов рекламных объявлений на основе предоставленной информации.
Ты должен строго соблюдать ограничения по длине для каждого поля.
Результат должен быть представлен в виде JSON-массива объектов, соответствующего предоставленной схеме. Не добавляй никаких объяснений или вступлений, только JSON.`;

  const userPrompt = `
    Сгенерируй рекламные креативы для Яндекс.Директ.
    
    Информация о продукте:
    - Продукт/Услуга: ${formData.productDescription}
    - Целевая аудитория: ${formData.targetAudience}
    - Ключевые преимущества/УТП: ${formData.usp.join(', ')}
    - Ссылка на сайт (для контекста): ${formData.websiteUrl || 'Не указана'}
    - Ключевые слова (для контекста): ${formData.keywords || 'Не указаны'}
    
    Требования к генерации:
    - Креативный стиль: ${formData.creativeStyle}
    - Количество вариантов для генерации: ${formData.variantCount}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: adCreativeSchema,
        },
      },
    });

    const jsonString = response.text.trim();
    const creatives = JSON.parse(jsonString);

    if (formData.goal === 'image_ad') {
        const imagePromises = creatives.map((creative: AdCreative) => 
            generateImageForAd(`Рекламное изображение для: ${creative.headline1} - ${creative.adText}. Целевая аудитория: ${formData.targetAudience}`)
        );
        const images = await Promise.all(imagePromises);
        images.forEach((img, index) => {
            creatives[index].imageUrl = img;
        });
    }

    return creatives;
  } catch (error) {
    console.error("Error generating ad creatives:", error);
    throw new Error("Не удалось сгенерировать креативы. Проверьте входные данные и попробуйте снова.");
  }
};


export const generateImageForAd = async (prompt: string): Promise<string> => {
    const ai = getGenAIClient();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Создай яркое, кликабельное, релевантное рекламное изображение для РСЯ. Изображение должно быть фотографического качества, без текста. Промпт: ${prompt}`,
            config: {
                numberOfImages: 1,
                aspectRatio: '16:9',
                outputMimeType: 'image/jpeg',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error('No image was generated.');
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Не удалось сгенерировать изображение.");
    }
};

export const refineAdCreatives = async (currentCreatives: AdCreative[], userRequest: string, formData: FormData): Promise<AdCreative[]> => {
    const ai = getGenAIClient();
    const model = formData.aiModel === AIModel.GEMINI_PRO ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    if (/замени|поменяй|смени|другую|новую/i.test(userRequest) && /картинку|изображение/i.test(userRequest)) {
        console.log("Image regeneration request detected.");
        const imagePrompt = `Перегенерируй изображение на основе запроса: "${userRequest}". Исходная информация: продукт - ${formData.productDescription}, ЦА - ${formData.targetAudience}.`;
        const newImages = await Promise.all(
          currentCreatives.map(() => generateImageForAd(imagePrompt))
        );
        return currentCreatives.map((creative, index) => ({
          ...creative,
          imageUrl: newImages[index] || creative.imageUrl,
        }));
    }

    const systemInstruction = `Ты — AI-ассистент для редактирования рекламных креативов Яндекс.Директ.
    Пользователь предоставляет JSON-массив с текущими креативами и текстовый запрос на их изменение.
    Твоя задача — внимательно прочитать запрос, внести необходимые правки в JSON и вернуть ПОЛНЫЙ обновленный JSON-массив в том же формате.
    Строго соблюдай ограничения по длине символов для каждого поля.
    Не добавляй никаких комментариев, объяснений или вступлений. Твой ответ — это только итоговый JSON.`;
    
    const prompt = `
      Запрос пользователя: "${userRequest}"
      
      Текущий JSON с креативами:
      ${JSON.stringify(currentCreatives, null, 2)}
    `;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: adCreativeSchema,
            },
        }
      });
      
      const jsonString = response.text.trim();
      const updatedCreatives = JSON.parse(jsonString);

      // Preserve images if they were not part of the text refinement
      return updatedCreatives.map((creative: AdCreative, index: number) => ({
        ...creative,
        imageUrl: currentCreatives[index]?.imageUrl,
      }));

    } catch (error) {
        console.error("Error refining ad creatives:", error);
        throw new Error("Не удалось применить правки. Пожалуйста, попробуйте переформулировать запрос.");
    }
};