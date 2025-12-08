import { GoogleGenAI } from "@google/genai";
import { FileData, GenerationResult } from "../types";

export const editImageWithGemini = async (
  imageData: FileData,
  prompt: string
): Promise<GenerationResult> => {
  // Use process.env.API_KEY as defined in vite.config.ts
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean base64 string (remove data URL prefix)
  const cleanBase64 = imageData.base64.split(",")[1];

  // Use Gemini 2.5 Flash Image for editing tasks
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: imageData.mimeType,
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];

  let generatedImageUrl: string | null = null;
  let generatedText: string | null = null;

  for (const part of parts) {
    if (part.inlineData?.data) {
      generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
    } else if (part.text) {
      generatedText = part.text;
    }
  }

  return {
    imageUrl: generatedImageUrl,
    text: generatedText,
  };
};

export const generateVideoWithGemini = async (
  imageData: FileData,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = imageData.base64.split(",")[1];

  // Initialize video generation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: cleanBase64,
      mimeType: imageData.mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!videoUri) {
    throw new Error("Failed to generate video");
  }

  // Append API key to access the video content
  return `${videoUri}&key=${process.env.API_KEY}`;
};