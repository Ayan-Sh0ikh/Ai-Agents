export enum UserLevel {
  BEGINNER = 'Beginner', // Green
  INTERMEDIATE = 'Intermediate', // Yellow
  EXPERT = 'Expert', // Red
}

export enum LearningMode {
  STANDARD = 'Standard',
  SOCRATIC = 'Socratic Tutor',
  DEVILS_ADVOCATE = 'Devil\'s Advocate',
  EXPLAIN_BACK = 'Explain-Back Test',
  RESEARCH = 'Research & Citations',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  levelUsed?: UserLevel;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // Base64
  category?: string;
}

export interface SkillNode {
  subject: string;
  score: number; // 0-100
  fullMark: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export type EducationLevel = 
  | '1st to 10th' 
  | '11th to 12th' 
  | 'Diploma' 
  | 'Bachelor\'s' 
  | 'Master\'s' 
  | 'PhD';

export interface UserProfile {
  name: string;
  birthDate: string;
  educationLevel: EducationLevel;
}

export type AppState = 'AUTH' | 'ONBOARDING' | 'APP';
