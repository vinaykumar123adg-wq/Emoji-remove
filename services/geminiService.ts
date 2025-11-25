import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends an image and a text prompt to the Gemini 2.5 Flash Image model to generate an edited version.
 * 
 * @param base64Image The base64 encoded string of the original image (without data URI prefix).
 * @param mimeType The MIME type of the original image (e.g., 'image/jpeg', 'image/png').
 * @param prompt The user's text instruction for editing the image.
 * @returns A promise that resolves to the base64 string of the generated image or null if not found.
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  try {
    // Using 'gemini-2.5-flash-image' as per instructions for "Nano banana" requests
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate through parts to find the image part as per SDK guidelines
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }

    // If no image part is found, log a warning (could be a text refusal)
    console.warn("No image data found in response:", response);
    return null;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
