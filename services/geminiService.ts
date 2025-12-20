
import { GoogleGenAI, Modality, Type } from "@google/genai";

/**
 * دالة لإنشاء عميل جديد في كل مرة لضمان استخدام أحدث مفتاح API
 * وتجنب مشاكل فقدان الارتباط بعد النشر.
 */
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeWasteImage = async (base64Image: string, lang: 'ar' | 'fr') => {
  const ai = getAIClient();
  const prompt = lang === 'ar' 
    ? "قم بتحليل هذه الصورة كخبير بيئي. حدد نوع النفايات وأعطِ تعليمات دقيقة لإعادة التدوير. أجب بتنسيق JSON حصراً."
    : "Analysez cette image en tant qu'expert environnemental. Identifiez le type de déchet et donnez des instructions de recyclage précises. Répondez exclusivement au format JSON.";

  try {
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
            impact: { type: Type.STRING }
          },
          required: ["item", "category", "instructions", "impact"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};

export const getChatResponse = async (message: string, lang: 'ar' | 'fr') => {
  const ai = getAIClient();
  const systemInstruction = lang === 'ar'
    ? "أنت 'المساعد البيئي الذكي'. تخصصك هو الاستدامة، إعادة التدوير، وحماية البيئة. قدم نصائح عملية وملهمة باللغة العربية."
    : "Vous êtes l'Assistant Éco Intelligent. Votre spécialité est la durabilité, le recyclage et la protection de l'environnement. Donnez des conseils pratiques et inspirants en français.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } // Flash doesn't strictly need high budget for chat
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Chat Error:", error);
    return lang === 'ar' ? "عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي." : "Désolé, une erreur de connexion à l'IA s'est produite.";
  }
};

export const generateSpeech = async (text: string, lang: 'ar' | 'fr') => {
  const ai = getAIClient();
  const voiceName = lang === 'ar' ? 'Kore' : 'Puck';

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

export const decodeBase64Audio = async (base64: string): Promise<AudioBuffer> => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const dataInt16 = new Int16Array(bytes.buffer);
  const numChannels = 1;
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, 24000);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
