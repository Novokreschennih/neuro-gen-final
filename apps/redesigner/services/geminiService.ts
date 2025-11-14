
import { GoogleGenAI, Type } from "@google/genai";
import type { DesignVariant } from '../types';

const getAIClient = (apiKey: string) => {
    return new GoogleGenAI({ apiKey });
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        html: { type: Type.STRING },
    },
    required: ["name", "html"]
};

const parseAndValidateResponse = (responseText: string, defaultName: string): DesignVariant => {
    try {
        const parsed = JSON.parse(responseText);
        if (typeof parsed.name !== 'string' || typeof parsed.html !== 'string') {
            throw new Error('Invalid response structure from AI. Missing name or html.');
        }
        return {
            id: crypto.randomUUID(),
            name: parsed.name || defaultName,
            html: parsed.html,
        };
    } catch (error) {
        console.error("Failed to parse AI response:", responseText, error);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }
};


const generateDesignPrompt = (code: string, style: string) => {
    const styleInstruction = style === "AI's Choice" 
        ? "First, analyze the provided content and determine a suitable, modern, and professional design style. Then, apply it." 
        : `Apply a '${style}' design style.`;

    return `
You are an expert UI/UX designer and frontend developer specializing in Tailwind CSS.
Your task is to take the user's content (which could be HTML or plain text) and turn it into a beautifully designed webpage.

**Instructions:**
1.  **Content Analysis:** First, analyze the input. If it's plain text, your primary task is to structure it into a semantic HTML document (e.g., using <h1>, <p>, <ul>). If it's already HTML, you will work with the existing structure.
2.  **Preserve Content:** Do NOT change the original text content.
3.  **Apply New Styles:** Completely replace all existing styles (inline styles, <style> tags, and class attributes if any) with new styles based on the requested theme.
4.  **Use Tailwind CSS ONLY:** All styling must be done using Tailwind CSS utility classes. Do not use custom CSS, inline styles, or <style> blocks.
5.  **Include Tailwind CDN:** CRITICAL: You MUST include the Tailwind CSS CDN script in the <head> of the generated HTML. Like this: <script src="https://cdn.tailwindcss.com"></script>.
6.  **Return Full HTML:** The output must be a single, complete, and valid HTML document.
7.  **Design Style:** ${styleInstruction}

**Original Content:**
\`\`\`
${code}
\`\`\`
`;
};

export const generateSingleDesign = async (apiKey: string, code: string, style: string, modelName: string): Promise<DesignVariant> => {
    const ai = getAIClient(apiKey);
    const prompt = generateDesignPrompt(code, style);

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema,
        },
    });

    return parseAndValidateResponse(response.text, 'Untitled Design');
};

const applyDesignPrompt = (referenceHtml: string, targetHtml: string) => {
    return `
You are an expert UI/UX designer specializing in creating design systems from existing webpages.
Your task is to transfer the visual design from a 'Reference' HTML to a 'Target' HTML.

**Instructions:**
1.  **Analyze Reference Design:** Carefully analyze the 'Reference HTML' to understand its design system. This includes its color palette, typography (fonts, sizes, weights), spacing (margins, paddings), component styles (buttons, cards, inputs), and overall layout principles.
2.  **Preserve Target Content & Structure:** The 'Target HTML' must keep all of its original text content and HTML structure. Do not add, remove, or reorder elements.
3.  **Apply Design System to Target:** Apply the design system you extracted from the 'Reference' to the 'Target' HTML.
4.  **Use Tailwind CSS ONLY:** All styling must be done using Tailwind CSS utility classes.
5.  **Include Tailwind CDN:** CRITICAL: You MUST include the Tailwind CSS CDN script in the <head> of the generated HTML.
6.  **Return Full HTML:** The output must be a single, complete, and valid HTML document.

**Reference HTML (Source of Style):**
\`\`\`html
${referenceHtml}
\`\`\`

**Target HTML (Source of Content & Structure):**
\`\`\`html
${targetHtml}
\`\`\`
`;
};

export const applyDesign = async (apiKey: string, referenceHtml: string, targetHtml:string, modelName: string): Promise<DesignVariant> => {
    const ai = getAIClient(apiKey);
    const prompt = applyDesignPrompt(referenceHtml, targetHtml);

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema,
        },
    });
    
    return parseAndValidateResponse(response.text, 'Applied Design');
};


const refineDesignPrompt = (originalHtml: string, instruction: string) => {
    return `
You are an expert UI/UX designer and frontend developer specializing in Tailwind CSS.
Your task is to iteratively refine the provided HTML code based on a user's instruction.

**Instructions:**
1.  **Analyze the Request:** Carefully read the user's instruction to understand the desired change.
2.  **Apply the Change:** Modify the Tailwind CSS classes in the 'Original HTML' to implement the instruction.
3.  **Maintain Consistency:** Ensure the change is applied while maintaining the overall stylistic integrity of the design.
4.  **Minimal Structural Changes:** Do NOT change the HTML structure or content unless it's absolutely necessary to fulfill the request. Focus on modifying Tailwind classes.
5.  **Return Full HTML:** The output must be a single, complete, and valid HTML document, including the Tailwind CDN script.

**User's Instruction:**
"${instruction}"

**Original HTML to Modify:**
\`\`\`html
${originalHtml}
\`\`\`
`;
};

export const refineDesign = async (apiKey: string, originalHtml: string, instruction: string, modelName: string): Promise<DesignVariant> => {
    const ai = getAIClient(apiKey);
    const prompt = refineDesignPrompt(originalHtml, instruction);
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema,
        },
    });
    
    return parseAndValidateResponse(response.text, 'Refined Design');
};