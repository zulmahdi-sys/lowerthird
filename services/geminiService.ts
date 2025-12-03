import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLowerThirdContent = async (topic: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a creative and professional lower third headline and subheadline for a live stream about: "${topic}". 
      The headline should be a name or a catchy main title (max 25 chars).
      The subheadline should be a job title, topic description, or call to action (max 40 chars).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: {
              type: Type.STRING,
              description: "The main text, e.g., a name or main topic."
            },
            subheadline: {
              type: Type.STRING,
              description: "The secondary text, e.g., role or sub-topic."
            }
          },
          required: ["headline", "subheadline"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};
