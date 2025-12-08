import { GoogleGenerativeAI } from "@google/generative-ai";
import { FileData, GenerationResult } from "../types";

const createClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

export const editImageWithGemini = async (
  imageData: FileData,
  prompt: string
): Promise<GenerationResult> => {
  const genAI = createClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const cleanBase64 = imageData.base64.split(",")[1];

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
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
    ],
  });

  const response = result.response;
  const parts = response.candidates?.[0]?.content?.parts ?? [];

  let generatedImageUrl: string | null = null;
  let generatedText: string | null = null;

  for (const part of parts) {
    if (part.inlineData?.data) {
      generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
    if (part.text) {
      generatedText = part.text;
    }
  }

  return {
    imageUrl: generatedImageUrl,
    text: generatedText,
  };
};
