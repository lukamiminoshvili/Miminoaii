import { GoogleGenAI } from "@google/genai";
import { FileData, GenerationResult } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const editImageWithGemini = async (
  imageData: FileData,
  prompt: string
): Promise<GenerationResult> => {
  const ai = createClient();
  const model = "gemini-2.5-flash-image";

  try {
    // Clean base64 string (remove data URL prefix)
    const cleanBase64 = imageData.base64.split(",")[1];

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: imageData.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let generatedImageUrl: string | null = null;
    let generatedText: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          } else if (part.text) {
            generatedText = part.text;
          }
        }
      }
    }

    return {
      imageUrl: generatedImageUrl,
      text: generatedText,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};
