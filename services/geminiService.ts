import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserLevel, LearningMode, Attachment } from "../types";

const getSystemInstruction = (level: UserLevel, mode: LearningMode): string => {
  const baseIdentity = `You are C5 NextGen-AI, a state-of-the-art cognitive intelligence designed to be the ultimate thinking companion.
  
  CORE BEHAVIOR:
  - You are professional, fluid, and intellectually stimulating (similar to a highly advanced ChatGPT).
  - Your goal is to build long-term knowledge and clarify reasoning.
  - Do NOT use rigid headers or explicit separators unless formatting complex data.
  - Be concise but deep.
  
  LEVEL ADAPTATION (${level}):
  - Beginner: Accessible, illustrative, foundational.
  - Intermediate: Technical, logical, connects concepts.
  - Expert: High-level academic synthesis, critical analysis.

  MODE ADAPTATION (${mode}):
  - Standard: Helpful, balanced, smart.
  - Socratic: Lead with questions to build understanding.
  - Devil's Advocate: Challenge assumptions constructively.
  - Research: Formal, cited, methodology-focused.
  `;

  return baseIdentity;
};

export const sendMessageToC5 = async (
  prompt: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  level: UserLevel,
  mode: LearningMode,
  attachments: Attachment[] = []
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: API Key is missing. Please check your configuration.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = getSystemInstruction(level, mode);

  // Prepare contents
  const parts: any[] = [];
  
  // Add attachments first
  attachments.forEach(att => {
    // Strip the data:image/png;base64, prefix if present for the API
    const base64Data = att.data.split(',')[1] || att.data;
    parts.push({
      inlineData: {
        mimeType: att.type,
        data: base64Data
      }
    });
  });

  parts.push({ text: prompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
            role: 'user',
            parts: parts
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I processed that, but generated no text. Try asking differently.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `System Error: ${error.message || "Unknown error occurred."}`;
  }
};