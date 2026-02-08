
export type StoryType = 
  | 'Short story' 
  | 'Movie scene' 
  | 'Dialogue' 
  | 'Voice-over' 
  | 'TikTok/Reels' 
  | 'Love Story' 
  | 'Horror Story' 
  | 'Kids Story'
  | 'Viral Strategist';

export type Mood = 'Happy' | 'Sad' | 'Romantic' | 'Horror' | 'Motivational';
export type Language = 'English' | 'Simple English' | 'Urdu';
export type Length = 'Short' | 'Medium' | 'Long';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  country?: string;
  profession?: string;
  referral?: string;
  createdAt: number;
  lastLoginAt: number;
  bio?: string;
  website?: string;
  deviceInfo?: string;
  browserInfo?: string;
  totalGenerations: number;
  credits: number;
  authProvider: 'google' | 'email';
  password?: string; // For mock login purposes
}

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits: number;
  badge?: string;
  features: string[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: 'LOGIN' | 'GENERATE' | 'TTS' | 'UPDATE_PROFILE' | 'LOGOUT' | 'PURCHASE';
  details: string;
  timestamp: number;
  metadata?: any;
}

export interface GenerationSettings {
  type: StoryType;
  mood: Mood;
  language: Language;
  length: Length;
}

export interface GeneratedContent {
  title: string;
  content: string;
  timestamp: number;
  viralTitles?: string[];
  hashtags?: string[];
}

export interface ViralMetadata {
  titles: string[];
  hashtags: string[];
}
