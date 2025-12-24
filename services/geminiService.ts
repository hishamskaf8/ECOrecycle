
import { GoogleGenAI, Type } from "@google/genai";

const initAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Critical: API_KEY is missing.");
    throw new Error("config_error");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeWasteImage = async (base64Image: string, lang: 'ar' | 'fr') => {
  try {
    const ai = initAI();
    const prompt = lang === 'ar' 
      ? "بصفتك خبير بيئي، حلل هذه الصورة. حدد المادة بدقة، فئتها، وكيفية إعادة تدويرها، وتأثيرها البيئي، والمدة التقريبية التي تستغرقها للتحلل في الطبيعة، واقترح فكرة إبداعية واحدة لإعادة استخدامها منزلياً. أجب بصيغة JSON فقط."
      : "En tant qu'expert environnemental, analysez cette image. Identifiez l'objet, sa catégorie, son mode de recyclage, son impact, son temps de décomposition estimé dans la nature et proposez une idée créative de réutilisation (DIY) à domicile. Répondez uniquement en JSON.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            category: { type: Type.STRING },
            instructions: { type: Type.STRING },
            impact: { type: Type.STRING },
            decompositionTime: { type: Type.STRING },
            diyTip: { type: Type.STRING }
          },
          required: ["item", "category", "instructions", "impact", "decompositionTime", "diyTip"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const getChatResponse = async (message: string, lang: 'ar' | 'fr') => {
  try {
    const ai = initAI();
    const systemInstruction = lang === 'ar'
      ? "أنت 'سيمبيوز'، مساعد بيئي ذكي. وظيفتك هي تقديم خبرة في الاستدامة والتدوير. كن محفزاً وعلمياً."
      : "Tu es 'Symbiose', un assistant IA écologique. Ta mission est d'éduquer sur la durabilité. Sois inspirant et précis.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { 
        systemInstruction,
        temperature: 0.7,
        topP: 0.95
      }
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return lang === 'ar' 
      ? "عذراً، واجهت مشكلة في الاتصال بعقلي الاصطناعي."
      : "Désolé, j'ai du mal à me connecter à mon cerveau IA.";
  }
};
