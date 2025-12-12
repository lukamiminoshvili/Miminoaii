import { GoogleGenAI, Chat } from "@google/genai";
import { FileData, GenerationResult } from "../types";

// --- EXISTING FUNCTIONS ---

export const editImageWithGemini = async (
  imageData: FileData,
  prompt: string
): Promise<GenerationResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please configure it in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = imageData.base64.split(",")[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: imageData.mimeType, data: cleanBase64 } },
        { text: prompt },
      ],
    },
  });

  return parseMultimodalResponse(response);
};

export const generateVideoWithGemini = async (
  imageData: FileData,
  prompt: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please configure it in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = imageData.base64.split(",")[1];

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

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!videoUri) {
    throw new Error("Failed to generate video.");
  }

  return `${videoUri}&key=${process.env.API_KEY}`;
};

export const startChatSession = (): Chat => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are Mimino, the user's best friend. You are extremely knowledgeable and know everything about the world, history, science, and pop culture. You are also a creative genius capable of creating photos and videos. Speak in a casual, friendly way. Always reply in the same language as the user (English or Georgian).",
    },
  });
};

// --- NEW MULTIMODAL CHAT HANDLER ---

export interface ChatResponse {
  text: string | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
}

export const handleMiminoMultimodalChat = async (
  chatSession: Chat,
  prompt: string,
  attachment: FileData | null
): Promise<ChatResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const lowerPrompt = prompt.toLowerCase();

  // 1. VIDEO GENERATION INTENT
  // If explicitly asking for video/animation and providing an image
  if (attachment && (lowerPrompt.includes('video') || lowerPrompt.includes('animate') || lowerPrompt.includes('movie'))) {
    try {
      const videoUrl = await generateVideoWithGemini(attachment, prompt);
      return { text: "Here is the animation you asked for! 🎬", mediaUrl: videoUrl, mediaType: 'video' };
    } catch (e: any) {
      return { text: `I tried to make a video but failed: ${e.message}`, mediaUrl: null, mediaType: null };
    }
  }

  // 2. IMAGE GENERATION/EDITING INTENT (Multimodal)
  // If there is an attachment OR the user specifically asks to "generate/create/draw" an image
  const isImageGen = !attachment && (lowerPrompt.includes('generate image') || lowerPrompt.includes('create a photo') || lowerPrompt.includes('draw'));
  const isImageEdit = !!attachment;

  if (isImageGen || isImageEdit) {
    try {
       const parts: any[] = [{ text: prompt }];
       
       if (attachment) {
         parts.unshift({
           inlineData: {
             mimeType: attachment.mimeType,
             data: attachment.base64.split(",")[1]
           }
         });
       }

       const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash-image', // Switch to image model
         contents: { parts },
       });

       const parsed = parseMultimodalResponse(response);
       return { 
         text: parsed.text || "Here is your image! 🎨", 
         mediaUrl: parsed.imageUrl, 
         mediaType: parsed.imageUrl ? 'image' : null 
       };

    } catch (e: any) {
       console.error(e);
       return { text: "I had trouble processing that image request.", mediaUrl: null, mediaType: null };
    }
  }

  // 3. STANDARD TEXT CHAT
  // Use the persistent chat session
  try {
    const response = await chatSession.sendMessage({ message: prompt });
    return { text: response.text || "...", mediaUrl: null, mediaType: null };
  } catch (e: any) {
    return { text: "Sorry, I lost my train of thought.", mediaUrl: null, mediaType: null };
  }
};

// Helper to extract image/text from response
const parseMultimodalResponse = (response: any): GenerationResult => {
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
  return { imageUrl: generatedImageUrl, text: generatedText };
};