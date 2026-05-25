export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LearnerProfile {
  id: string;
  userId: string;
  nativeLanguage: string;
  targetDialect: string;
  preferredTopics: string[];
  anxietyLevel: number; // 1-10
  correctionPreference: 'gentle' | 'moderate' | 'strict';
}

export interface LearnerState {
  id: string;
  userId: string;
  knownWords: string[];
  knownStructures: string[];
  emergingStructures: string[];
  fossilizedErrors: string[];
  comprehensionScore: number;
  speakingConfidence: number;
  listeningConfidence: number;
}

export interface StoryModule {
  id: string;
  title: string;
  phaseA: string; // Anchor story
  phaseB: string; // Pattern breakdown
  phaseC: string; // Comprehension questions
  targetStructures: string[];
  knownVocabPct: number;
  unknownVocabPct: number;
  personalizedFor?: string;
  contentSource?: string;
  difficulty: CEFRLevel;
}

export interface SRSItem {
  id: string;
  userId: string;
  itemType:
    | 'cloze'
    | 'audio_recall'
    | 'shadowing'
    | 'conversation_prompt'
    | 'mistake_repair'
    | 'micro_story';
  content: string;
  answer?: string;
  sourceStory?: string;
  difficulty: number;
  stability: number;
  retrievability: number;
  nextReviewAt: Date;
  reviewCount: number;
}

export interface ReviewGradeRequest {
  srsItemId: string;
  rating: 1 | 2 | 3 | 4; // 1=forget, 2=hard, 3=good, 4=easy
  responseTime?: number;
  response?: string;
}

export interface DashboardStats {
  completedLessons: number;
  dueReviews: number;
  thisWeekProgress: number;
  totalStructuresLearned: number;
  averageComprehension: number;
}
