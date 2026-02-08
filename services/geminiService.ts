
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GenerationSettings, ViralMetadata, GeneratedContent } from "../types";

export type GenMode = 'new' | 'rewrite' | 'continue';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestions?: string[];
}

export const validateTopic = async (topic: string): Promise<ValidationResult> => {
  // Always use a named parameter and obtain API key directly from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an intelligent assistant for a script generator.
    Check if the user input is gibberish, random numbers, or an unsupported/nonsensical topic.
    If it is invalid, return isValid: false and provide 5 relevant creative script topic suggestions.
    If it is valid, return isValid: true.
    Ignore filler words. Be friendly and helpful.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Validate this topic: "${topic}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
            suggestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ['isValid'],
        }
      }
    });
    // Use .text property directly
    return JSON.parse(response.text || '{"isValid": true}');
  } catch (e) {
    return { isValid: true }; // Fallback to avoid blocking user
  }
};

export const generateStory = async (
  prompt: string, 
  settings: GenerationSettings, 
  mode: GenMode = 'new', 
  context?: string
): Promise<GeneratedContent> => {
  // Always use a named parameter and obtain API key directly from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const typeSpecificInstructions = {
    'Short story': 'FORMAT: Prose. STRUCTURE: Beginning, rising action, climax, and resolution. Focus on vivid descriptions.',
    'Movie scene': 'FORMAT: Professional Screenplay. REQUIRED: INT./EXT. sluglines, SCENE HEADINGS, CHARACTER NAMES, and [Parentheticals].',
    'Dialogue': 'FORMAT: Script-style Dialogue. Minimize descriptions. Focus 90% on verbal interaction.',
    'Voice-over': 'FORMAT: Audio Script. Include time markers (e.g. 0:05) and [SFX] instructions.',
    'TikTok/Reels': 'FORMAT: Viral Short Script. REQUIRED: 3-second HOOK, VISUAL cues, and VOICE-OVER lines. End with a CTA.',
    'Love Story': 'FORMAT: Emotional Narrative. Focus on chemistry and the "spark".',
    'Horror Story': 'FORMAT: Suspenseful Narrative. Build dread through pacing and sensory isolation.',
    'Kids Story': 'FORMAT: Simple Whimsical Prose. Clear moral lesson and colorful descriptions.',
    'Viral Strategist': 'FORMAT: High-performance Viral Script. Use psychological triggers and rapid-fire pacing.'
  };

  const systemInstruction = `
    You are a professional Creative Writer and Viral Strategist.
    Current Specialized Model: "${settings.type}"
    Rules:
    1. Start with a powerful hook in the first 2–3 lines.
    2. Structure output into clear scenes or sections.
    3. Use emotional pacing, suspense, and twists.
    4. Highlight hooks and key moments.
    5. End with a strong closing or twist.
    
    If platform is TikTok/Reels: Add on-screen caption text and voice-over friendly lines.

    Along with content, generate:
    1. 3 scroll-stopping title variations.
    2. 10 trending hashtags.

    TASK: Output a JSON object.
  `;

  let userPrompt = mode === 'new' ? prompt : (mode === 'rewrite' ? `Rewrite: ${prompt}. Original: ${context}` : `Continue: ${context}`);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          viralTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['title', 'content', 'viralTitles', 'hashtags'],
      },
    },
  });

  // Use .text property directly
  const result = JSON.parse(response.text || '{}');
  return {
    title: result.title || 'Untitled',
    content: result.content || '',
    viralTitles: result.viralTitles || [],
    hashtags: result.hashtags || [],
    timestamp: Date.now()
  };
};

export const generateViralMetadata = async (script: string): Promise<ViralMetadata> => {
  // Always use a named parameter and obtain API key directly from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this script for viral titles and hashtags: ${script}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['titles', 'hashtags'],
      },
    },
  });
  // Use .text property directly
  return JSON.parse(response.text || '{"titles":[], "hashtags":[]}');
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
  // Always use a named parameter and obtain API key directly from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000, numChannels: number = 1): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);
  view.setUint32(0, 0x52494646, false); // RIFF
  view.setUint32(4, 36 + pcmData.length, true);
  view.setUint32(8, 0x57415645, false); // WAVE
  view.setUint32(12, 0x666d7420, false); // fmt
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false); // data
  view.setUint32(40, pcmData.length, true);
  new Uint8Array(buffer, 44).set(pcmData);
  return new Blob([buffer], { type: 'audio/wav' });
}
