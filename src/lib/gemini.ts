import { GoogleGenAI } from "@google/genai";
import { SoundType } from "../types";

let ai: GoogleGenAI | null = null;

function getApiKey(): string {
  return process.env.GEMINI_API_KEY ?? '';
}

function getFallbackClassification(db: number, frequencyData: number[]): SoundType {
  const peak = Math.max(...frequencyData, 0);
  const average = frequencyData.length > 0
    ? frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length
    : 0;
  const lowBand = frequencyData.slice(0, 12).reduce((sum, value) => sum + value, 0);
  const midBand = frequencyData.slice(12, 40).reduce((sum, value) => sum + value, 0);
  const highBand = frequencyData.slice(40, 80).reduce((sum, value) => sum + value, 0);

  if (db < 20 || average < 10) return 'quiet';
  if (db > 85 && highBand > midBand * 1.2) return 'siren';
  if (db > 80 && peak > 230) return 'alarm';
  if (db > 70 && lowBand > highBand * 1.6) return 'door knock';
  if (midBand > lowBand * 1.1 && midBand > highBand * 0.9) return 'human speech';
  if (highBand > lowBand * 1.8) return 'baby crying';
  if (lowBand > midBand * 1.4) return 'dog barking';
  return db > 65 ? 'loud noise' : 'quiet';
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }

  return ai;
}

export async function classifySound(db: number, frequencyData: number[]): Promise<SoundType> {
  const client = getAiClient();
  if (!client) {
    return getFallbackClassification(db, frequencyData);
  }

  try {
    const response = await client.models.generateContent({
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
    return label || getFallbackClassification(db, frequencyData);
  } catch (error) {
    console.error('Gemini classification error:', error);
    return getFallbackClassification(db, frequencyData);
  }
}
