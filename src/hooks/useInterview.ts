import { useState, useCallback } from "react";
import { InterviewMessage, InterviewResult, InterviewSession } from "../types";
import { User } from "firebase/auth";

function parseInterviewResult(text: string): InterviewResult | null {
  try {
    // 1. 마크다운 코드블록 안의 JSON 추출
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      const jsonStr = codeBlockMatch[1].trim();
      const objMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objMatch) return JSON.parse(objMatch[0]) as InterviewResult;
    }
    // 2. 텍스트 내 JSON 객체 직접 추출
    const objMatch = text.match(/\{[\s\S]*"totalScore"[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]) as InterviewResult;
    return null;
  } catch {
    return null;
  }
}

function hasResultJson(text: string): boolean {
  return text.includes("totalScore") && text.includes("categoryScores");
}

function extractStep(text: string, fallback: number): number {
  const match = text.match(/\[STEP:(\d)\]/);
  return match ? parseInt(match[1], 10) : fallback;
}

function extractName(text: string): string | null {
  const match = text.match(/\[NAME:([^\]]+)\]/);
  return match ? match[1].trim() : null;
}


const makeInitialSession = (): InterviewSession => ({
  messages: [],
  currentStep: 0,
  isCompleted: false,
  result: null,
  selectedAppId: null,
  sessionId: null,
  intervieweeName: null,
});

export function useInterview(
  user: User | null,
  onCreateSession?: (appId: string) => Promise<string | null>,
  onUpdateStep?: (sessionId: string, step: number) => Promise<void>,
  onUpdateTitle?: (sessionId: string, name: string) => Promise<void>,
  onCompleteSession?: (sessionId: string, result: InterviewResult, messages: InterviewMessage[]) => Promise<void>,
  onSaveMessages?: (sessionId: string, messages: InterviewMessage[]) => Promise<void>
) {
  const [session, setSession] = useState<InterviewSession>(makeInitialSession());
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const startInterview = useCallback(async (appId: string) => {
    setSession(makeInitialSession());
    setSaveStatus("idle");
    setIsLoading(true);

    // 로그인 사용자는 Firestore 세션 생성
    let sessionId: string | null = null;
    if (user && onCreateSession) {
      sessionId = await onCreateSession(appId);
    }

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: [], userMessage: "인터뷰를 시작해줘" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSession(prev => ({
        ...prev,
        selectedAppId: appId,
        sessionId,
        currentStep: 0,
        messages: [{ role: "sowi", text: data.text, timestamp: new Date() }],
      }));
    } catch (e: any) {
      console.error("Interview start error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [user, onCreateSession]);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMsg: InterviewMessage = {
      role: "user",
      text: userText,
      timestamp: new Date(),
    };

    const currentMessages = session.messages;
    const currentSessionId = session.sessionId;

    setSession(prev => ({ ...prev, messages: [...prev.messages, userMsg] }));
    setIsLoading(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: currentMessages,
          userMessage: userText,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const sowiText: string = data.text || "";
      const isFinished = hasResultJson(sowiText);
      let parsedResult: InterviewResult | null = null;

      // 이름 추출 처리
      const extractedName = extractName(sowiText);

      if (isFinished) {
        parsedResult = parseInterviewResult(sowiText);

        if (parsedResult) {
          setSaveStatus("saving");

          const allMessages = [
            ...currentMessages,
            userMsg,
            { role: "sowi" as const, text: sowiText, timestamp: new Date() },
          ];

          if (user && onCompleteSession && currentSessionId) {
            // 로그인 사용자: Firestore 세션 완료
            try {
              await onCompleteSession(currentSessionId, parsedResult, allMessages);
              console.log("✅ 인터뷰 세션 완료 저장:", currentSessionId);
              setSaveStatus("saved");
            } catch (firestoreErr: any) {
              console.error("❌ 세션 완료 저장 실패:", firestoreErr?.code, firestoreErr);
              setSaveStatus("error");
            }
          } else if (!user) {
            // 비로그인: 로컬스토리지에 임시 저장
            try {
              const localKey = `sowi_result_${Date.now()}`;
              localStorage.setItem(localKey, JSON.stringify({
                result: parsedResult,
                messages: allMessages.map(m => ({
                  role: m.role,
                  text: m.text,
                  timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : new Date().toISOString(),
                })),
                savedAt: new Date().toISOString(),
              }));
              console.log("✅ 로컬스토리지 임시 저장:", localKey);
              setSaveStatus("saved");
            } catch {
              setSaveStatus("error");
            }
          } else {
            setSaveStatus("saved");
          }
        }
      }

      const newStep = isFinished ? 6 : extractStep(sowiText, session.currentStep);

      // Step 업데이트 (Firestore)
      if (user && onUpdateStep && currentSessionId && !isFinished) {
        onUpdateStep(currentSessionId, newStep).catch(console.error);
      }

      // 진행 중 메시지 저장 (이어하기 지원)
      if (user && onSaveMessages && currentSessionId && !isFinished) {
        const updatedMessages = [
          ...currentMessages,
          userMsg,
          { role: "sowi" as const, text: sowiText, timestamp: new Date() },
        ];
        onSaveMessages(currentSessionId, updatedMessages).catch(console.error);
      }

      setSession(prev => {
        const updatedName = extractedName ?? prev.intervieweeName;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            { role: "sowi", text: sowiText, timestamp: new Date() },
          ],
          currentStep: newStep,
          isCompleted: isFinished,
          result: parsedResult,
          intervieweeName: updatedName,
        };
      });

      // 이름 추출 시 세션 제목 업데이트
      if (extractedName && user && onUpdateTitle && currentSessionId) {
        onUpdateTitle(currentSessionId, extractedName).catch(console.error);
      }

    } catch (e: any) {
      console.error("Interview send error:", e);
      setSession(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: "sowi",
            text: "죄송해요, 잠시 오류가 발생했어요. 다시 말씀해 주시겠어요?",
            timestamp: new Date(),
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [session.messages, session.currentStep, session.sessionId, isLoading, user, onUpdateStep, onUpdateTitle, onCompleteSession, onSaveMessages]);

  const resetInterview = useCallback(() => {
    setSession(makeInitialSession());
    setSaveStatus("idle");
  }, []);

  const resumeSession = useCallback(async (sessionDoc: { id: string; currentStep: number; intervieweeName: string | null; status: string; result?: InterviewResult | null }, messages: InterviewMessage[]) => {
    setSession({
      messages,
      currentStep: sessionDoc.currentStep,
      isCompleted: sessionDoc.status === "completed",
      result: sessionDoc.result || null,
      selectedAppId: null,
      sessionId: sessionDoc.id,
      intervieweeName: sessionDoc.intervieweeName,
    });
    setSaveStatus("idle");
  }, []);

  return { session, isLoading, saveStatus, startInterview, sendMessage, resetInterview, resumeSession };
}
