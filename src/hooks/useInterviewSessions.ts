import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { User } from "firebase/auth";
import { InterviewSessionDoc, InterviewMessage, InterviewResult } from "../types";

export function useInterviewSessions(user: User | null) {
  const [sessions, setSessions] = useState<InterviewSessionDoc[]>([]);
  // 실시간 세션 목록 구독
  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "interview_sessions"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as InterviewSessionDoc[];
      setSessions(docs);
    });

    return () => unsub();
  }, [user]);

  // 새 세션 생성 → sessionId 반환
  const createSession = useCallback(
    async (appId: string): Promise<string | null> => {
      if (!user) return null;
      try {
        const docRef = await addDoc(
          collection(db, "users", user.uid, "interview_sessions"),
          {
            title: "인터뷰 진행 중",
            intervieweeName: "",
            status: "in_progress",
            currentStep: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            appId,
          }
        );
        return docRef.id;
      } catch (e) {
        console.error("createSession error:", e);
        return null;
      }
    },
    [user]
  );

  // 세션 제목/이름 업데이트
  const updateSessionTitle = useCallback(
    async (sessionId: string, intervieweeName: string) => {
      if (!user) return;
      const today = new Date().toISOString().slice(0, 10);
      const title = `${today} ${intervieweeName}`;
      try {
        await updateDoc(
          doc(db, "users", user.uid, "interview_sessions", sessionId),
          { title, intervieweeName, updatedAt: serverTimestamp() }
        );
      } catch (e) {
        console.error("updateSessionTitle error:", e);
      }
    },
    [user]
  );

  // 메시지 진행 중 저장 (이어하기 지원)
  const saveMessages = useCallback(
    async (sessionId: string, messages: InterviewMessage[]) => {
      if (!user) return;
      const serialized = messages.map((m) => ({
        role: m.role,
        text: m.text,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : new Date().toISOString(),
      }));
      try {
        await updateDoc(
          doc(db, "users", user.uid, "interview_sessions", sessionId),
          { messages: serialized, messageCount: serialized.length, updatedAt: serverTimestamp() }
        );
      } catch (e) {
        console.error("saveMessages error:", e);
      }
    },
    [user]
  );

  // 세션 step 업데이트 (진행 중 저장)
  const updateSessionStep = useCallback(
    async (sessionId: string, currentStep: number) => {
      if (!user) return;
      try {
        await updateDoc(
          doc(db, "users", user.uid, "interview_sessions", sessionId),
          { currentStep, updatedAt: serverTimestamp() }
        );
      } catch (e) {
        console.error("updateSessionStep error:", e);
      }
    },
    [user]
  );

  // 세션 완료 처리
  const completeSession = useCallback(
    async (sessionId: string, result: InterviewResult, messages: InterviewMessage[]) => {
      if (!user) return;
      const serializedMessages = messages.map((m) => ({
        role: m.role,
        text: m.text,
        timestamp:
          m.timestamp instanceof Date
            ? m.timestamp.toISOString()
            : new Date().toISOString(),
      }));
      try {
        await updateDoc(
          doc(db, "users", user.uid, "interview_sessions", sessionId),
          {
            status: "completed",
            currentStep: 6,
            result,
            messages: serializedMessages,
            messageCount: serializedMessages.length,
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );
      } catch (e) {
        console.error("completeSession error:", e);
        throw e;
      }
    },
    [user]
  );

  // 세션 이름 수정 (사용자가 수동으로)
  const renameSession = useCallback(
    async (sessionId: string, newTitle: string) => {
      if (!user) return;
      try {
        await updateDoc(
          doc(db, "users", user.uid, "interview_sessions", sessionId),
          { title: newTitle, updatedAt: serverTimestamp() }
        );
      } catch (e) {
        console.error("renameSession error:", e);
      }
    },
    [user]
  );

  // 세션 삭제
  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;
      try {
        await deleteDoc(
          doc(db, "users", user.uid, "interview_sessions", sessionId)
        );
      } catch (e) {
        console.error("deleteSession error:", e);
      }
    },
    [user]
  );

  // 세션 메시지 불러오기 (저장된 세션 재개 시)
  const loadSessionMessages = useCallback(
    async (sessionId: string): Promise<InterviewMessage[]> => {
      if (!user) return [];
      try {
        const snap = await getDoc(
          doc(db, "users", user.uid, "interview_sessions", sessionId)
        );
        if (!snap.exists()) return [];
        const data = snap.data();
        if (!data.messages) return [];
        return (data.messages as any[]).map((m) => ({
          role: m.role as "sowi" | "user",
          text: m.text,
          timestamp: new Date(m.timestamp),
        }));
      } catch (e) {
        console.error("loadSessionMessages error:", e);
        return [];
      }
    },
    [user]
  );

  return {
    sessions,
    createSession,
    saveMessages,
    updateSessionTitle,
    updateSessionStep,
    completeSession,
    renameSession,
    deleteSession,
    loadSessionMessages,
  };
}
