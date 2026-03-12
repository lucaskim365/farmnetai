import { Timestamp } from "firebase/firestore";

export interface ChatMessage {
  id?: string;
  role: "user" | "model";
  text: string;
  timestamp?: Timestamp | null;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface FileAttachment {
  file: File;
  preview: string | null;
  isImage: boolean;
}

export interface ChatRoom {
  id: string;
  title: string;
  createdAt: Timestamp | null;
  userId: string;
}

export interface StoreApp {
  id: string;
  title: string;
  desc: string;
  iconType: string;
  color: string;
  appType?: string;
}

export type ViewType = "chat" | "appstore" | "tools" | "education" | "interview" | "myfarm";

// ─── Sowi 인터뷰 타입 ───────────────────────────────────────

export interface InterviewMessage {
  role: "sowi" | "user";
  text: string;
  timestamp: Date;
}

export interface CategoryScore {
  score: number;  // 0~10
  reason: string;
}

export interface InterviewResult {
  totalScore: number;
  grade: "상급" | "중급" | "초급" | "입문";
  categoryScores: {
    taskUnderstanding: CategoryScore;
    practicalExperience: CategoryScore;
    safetyAwareness: CategoryScore;
    workAttitude: CategoryScore;
    learningWillingness: CategoryScore;
  };
  strengths: string[];
  weaknesses: string[];
  recommendedTraining: Array<{
    category: string;
    priority: "높음" | "중간" | "낮음";
    reason: string;
  }>;
  suitableFarms: string[];
  safetyFlagRequired: boolean;
}

export interface InterviewSession {
  messages: InterviewMessage[];
  currentStep: number;  // 0~6
  isCompleted: boolean;
  result: InterviewResult | null;
  selectedAppId: string | null;
  sessionId: string | null;        // Firestore session doc ID
  intervieweeName: string | null;  // [NAME:xxx] 태그로 추출
}

export interface InterviewSessionDoc {
  id: string;
  title: string;              // "2026-03-12 김철수"
  intervieweeName: string;
  status: "in_progress" | "completed";
  currentStep: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  result?: InterviewResult;
  messageCount?: number;
}

