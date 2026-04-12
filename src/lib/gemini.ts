import { GoogleGenAI, Type } from "@google/genai";
import { SoundType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function classifySound(db: number, frequencyData: number[]): Promise<SoundType> {
  // In a production app, we might send a 1-2 second audio buffer.
  // For this prototype, we'll send the spectral features to Gemini.
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Classify this sound based on its features:
      - Volume: ${db} dB
      - Spectral data (first 10 bins): ${frequencyData.slice(0, 10).join(', ')}
      
      Possible types: baby crying, dog barking, siren, alarm, door knock, human speech, loud noise, quiet.
      Return ONLY the classification label.`,
      config: {
        responseMimeType: "text/plain",
      }
    });

    const label = response.text?.toLowerCase().trim() as SoundType;
    return label || 'quiet';
  } catch (error) {
    console.error('Gemini classification error:', error);
    return 'quiet';
  }
}
