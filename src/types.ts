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
}

export type ViewType = "chat" | "appstore" | "tools" | "education";

