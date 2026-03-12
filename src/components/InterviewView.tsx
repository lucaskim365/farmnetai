import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  ChevronLeft,
  RotateCcw,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  PlayCircle,
  FileText,
} from "lucide-react";
import { InterviewSession, InterviewResult, InterviewSessionDoc } from "../types";

interface InterviewViewProps {
  session: InterviewSession;
  isLoading: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  onSendMessage: (text: string) => void;
  onReset: () => void;        // 앱스토어로 이동
  onBackToList: () => void;   // 인터뷰 목록으로 이동
  // 세션 목록 관련
  sessions: InterviewSessionDoc[];
  onNewInterview: () => void;
  onResumeSession: (s: InterviewSessionDoc) => void;
  onRenameSession: (id: string, title: string) => void;
  onDeleteSession: (id: string) => void;
  isLoggedIn: boolean;
}

const STEP_LABELS = ["소개", "기본 정보", "작업 이해도", "실무 경험", "안전 인식", "근무 태도", "완료"];

const GRADE_STYLE: Record<string, string> = {
  "상급": "text-green-400 bg-green-400/10 border-green-400/30",
  "중급": "text-blue-400 bg-blue-400/10 border-blue-400/30",
  "초급": "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  "입문": "text-red-400 bg-red-400/10 border-red-400/30",
};

const PRIORITY_COLOR: Record<string, string> = {
  "높음": "text-red-400 bg-red-400/10",
  "중간": "text-yellow-400 bg-yellow-400/10",
  "낮음": "text-zinc-400 bg-zinc-800",
};

const CATEGORY_LABELS: Record<string, string> = {
  taskUnderstanding: "작업 이해도",
  practicalExperience: "실무 경험",
  safetyAwareness: "안전 인식",
  workAttitude: "근무 태도",
  learningWillingness: "학습 의지",
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4ade80] rounded-full transition-all duration-500"
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400 w-8 text-right">{score}/10</span>
    </div>
  );
}

function SaveBadge({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  const styles = {
    saving: "text-zinc-500 bg-zinc-800",
    saved:  "text-green-400 bg-green-400/10",
    error:  "text-red-400 bg-red-400/10",
  };
  const labels = {
    saving: "⏳ 저장 중...",
    saved:  "✅ 결과가 저장됐어요",
    error:  "⚠️ 저장 실패 (네트워크 확인)",
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function ResultCard({ result, saveStatus, onReset }: { result: InterviewResult; saveStatus: "idle" | "saving" | "saved" | "error"; onReset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto py-6 px-2 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-[#4ade80]" size={28} />
          <div>
            <h2 className="text-xl font-bold text-zinc-100">인터뷰 완료!</h2>
            <p className="text-xs text-zinc-500">Sowi 농업 인력 역량 평가</p>
          </div>
        </div>
        <SaveBadge status={saveStatus} />
      </div>

      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-1">종합 점수</p>
          <p className="text-4xl font-bold text-zinc-100">
            {result.totalScore}
            <span className="text-lg text-zinc-500 ml-1">/ 100</span>
          </p>
        </div>
        <span className={`px-4 py-1.5 rounded-full border text-sm font-bold ${GRADE_STYLE[result.grade] || "text-zinc-400"}`}>
          {result.grade}
        </span>
      </div>

      {result.safetyFlagRequired && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <p className="text-sm text-red-300">안전 교육이 필수로 권장됩니다. 농약·농기계 관련 안전 수칙 교육을 먼저 이수해 주세요.</p>
        </div>
      )}

      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">영역별 점수</h3>
        {Object.entries(result.categoryScores).map(([key, val]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 w-24 shrink-0">{CATEGORY_LABELS[key]}</span>
            <ScoreBar score={val.score} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-semibold text-[#4ade80]">💪 강점</h3>
          {result.strengths.map((s, i) => (
            <p key={i} className="text-xs text-zinc-400 leading-relaxed">· {s}</p>
          ))}
        </div>
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-semibold text-yellow-400">⚠️ 보완점</h3>
          {result.weaknesses.map((w, i) => (
            <p key={i} className="text-xs text-zinc-400 leading-relaxed">· {w}</p>
          ))}
        </div>
      </div>

      {result.recommendedTraining.length > 0 && (
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300">📚 추천 교육</h3>
          {result.recommendedTraining.map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${PRIORITY_COLOR[t.priority]}`}>
                {t.priority}
              </span>
              <div>
                <p className="text-sm text-zinc-200">{t.category}</p>
                <p className="text-xs text-zinc-500">{t.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {result.suitableFarms.length > 0 && (
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">🌾 적합한 농가 유형</h3>
          <div className="flex flex-wrap gap-2">
            {result.suitableFarms.map((f, i) => (
              <span key={i} className="text-xs bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 px-3 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
        >
          <RotateCcw size={15} />
          다시 인터뷰
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-xl bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/20 text-sm font-medium transition-colors"
        >
          앱 스토어로
        </button>
      </div>
    </div>
  );
}

// ─── 세션 목록 아이템 ────────────────────────────────────────
function SessionItem({
  session,
  onResume,
  onRename,
  onDelete,
}: {
  key?: React.Key;
  session: InterviewSessionDoc;
  onResume: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleRenameConfirm = () => {
    if (editTitle.trim()) onRename(editTitle.trim());
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-zinc-800 group hover:border-zinc-700 transition-colors">
      <div className="w-8 h-8 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center shrink-0">
        <Sprout size={14} className="text-[#4ade80]" />
      </div>

      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={!editing ? onResume : undefined}
      >
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleRenameConfirm(); if (e.key === "Escape") setEditing(false); }}
              className="flex-1 bg-zinc-800 text-sm text-zinc-200 px-2 py-1 rounded-lg outline-none border border-zinc-600 min-w-0"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); handleRenameConfirm(); }} className="text-green-400 hover:text-green-300">
              <Check size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setEditing(false); }} className="text-zinc-500 hover:text-zinc-300">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-200 truncate">{session.title}</p>
            <p className="text-xs text-zinc-600">
              {session.status === "completed" ? "완료" : `Step ${session.currentStep} / 6 진행 중`}
            </p>
          </>
        )}
      </div>

      {!editing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {session.status === "in_progress" ? (
            <button
              onClick={(e) => { e.stopPropagation(); onResume(); }}
              title="이어하기"
              className="p-1.5 text-zinc-500 hover:text-[#4ade80] transition-colors"
            >
              <PlayCircle size={15} />
            </button>
          ) : session.result ? (
            <button
              onClick={(e) => { e.stopPropagation(); setShowResultModal(true); }}
              title="결과 리포트 보기"
              className="p-1.5 text-zinc-500 hover:text-[#4ade80] transition-colors"
            >
              <FileText size={15} />
            </button>
          ) : null}
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            title="이름 수정"
            className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="삭제"
            className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {/* 결과 리포트 모달 */}
      {showResultModal && session.result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setShowResultModal(false); }}>
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex justify-end p-4 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-zinc-800">
              <button onClick={() => setShowResultModal(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="pb-8 px-4">
              <ResultCard 
                result={session.result} 
                saveStatus="idle" 
                onReset={() => setShowResultModal(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 메인 InterviewView ──────────────────────────────────────
export function InterviewView({
  session,
  isLoading,
  saveStatus,
  onSendMessage,
  onReset,
  onBackToList,
  sessions,
  onNewInterview,
  onResumeSession,
  onRenameSession,
  onDeleteSession,
  isLoggedIn,
}: InterviewViewProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isActive = session.messages.length > 0 || isLoading;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const progressPercent = Math.min((session.currentStep / 6) * 100, 100);

  // [STEP:N], [NAME:xxx] 태그 제거 후 표시
  const cleanText = (text: string) =>
    text
      .replace(/\[STEP:\d\]/g, "")
      .replace(/\[NAME:[^\]]+\]/g, "")
      .replace(/\[안전교육필수\]/g, "⚠️ [안전 교육 필수]")
      .trim();

  // ── 세션 목록 화면 (인터뷰 미활성 상태) ─────────────────
  if (!isActive) {
    return (
      <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
        {/* 헤더 */}
        <div className="shrink-0 px-4 pt-2 pb-4 border-b border-zinc-800/60">
          <div className="flex items-center justify-between">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
            >
              <ChevronLeft size={16} />
              앱 스토어
            </button>
            <div className="flex items-center gap-2">
              <Sprout size={16} className="text-[#4ade80]" />
              <span className="text-sm font-semibold text-zinc-300">Sowi 인력 인터뷰</span>
            </div>
            <button
              onClick={onNewInterview}
              className="flex items-center gap-1.5 text-xs text-[#4ade80] hover:text-[#22c55e] transition-colors"
            >
              <Plus size={14} />
              새 인터뷰
            </button>
          </div>
        </div>

        {/* 세션 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-zinc-600 py-16">
              <Sprout size={36} className="text-zinc-700" />
              <p className="text-sm">로그인하면 인터뷰 기록을 저장하고</p>
              <p className="text-sm">이어서 진행할 수 있어요.</p>
              <button
                onClick={onNewInterview}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] text-sm font-medium hover:bg-[#4ade80]/20 transition-colors"
              >
                비로그인으로 시작하기
              </button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-zinc-600 py-16">
              <Sprout size={36} className="text-zinc-700" />
              <p className="text-sm">아직 인터뷰 기록이 없어요.</p>
              <button
                onClick={onNewInterview}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] text-sm font-medium hover:bg-[#4ade80]/20 transition-colors"
              >
                첫 인터뷰 시작하기
              </button>
            </div>
          ) : (
            <>
              {sessions.map(s => (
                <SessionItem
                  key={s.id}
                  session={s}
                  onResume={() => onResumeSession(s)}
                  onRename={title => onRenameSession(s.id, title)}
                  onDelete={() => onDeleteSession(s.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── 인터뷰 진행 화면 ─────────────────────────────────────
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      {/* 헤더 */}
      <div className="shrink-0 px-4 pt-2 pb-4 border-b border-zinc-800/60">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            {session.intervieweeName ? session.intervieweeName : "목록"}
          </button>
          <div className="flex items-center gap-2">
            <Sprout size={16} className="text-[#4ade80]" />
            <span className="text-sm font-semibold text-zinc-300">Sowi 인력 인터뷰</span>
          </div>
          <div className="w-20" />
        </div>

        {/* 진행 바 */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-600">
            <span>{STEP_LABELS[session.currentStep] ?? "완료"}</span>
            <span>Step {session.currentStep} / 6</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4ade80] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {session.messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-zinc-600">
            <Sprout size={40} className="text-zinc-700" />
            <p className="text-sm">Sowi가 인터뷰를 준비 중입니다...</p>
          </div>
        )}

        {session.messages.map((msg, idx) => {
          const isSowi = msg.role === "sowi";
          const isResultJson = isSowi && msg.text.includes("totalScore") && msg.text.includes("categoryScores");
          if (isResultJson) return null;

          return (
            <div key={idx} className={`flex gap-3 ${isSowi ? "justify-start" : "justify-end"}`}>
              {isSowi && (
                <div className="w-7 h-7 rounded-full bg-[#4ade80]/20 border border-[#4ade80]/30 flex items-center justify-center shrink-0 mt-1">
                  <Sprout size={14} className="text-[#4ade80]" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  isSowi
                    ? "bg-[#1e1e1e] border border-zinc-800 text-zinc-200 rounded-tl-sm"
                    : "bg-[#4ade80]/10 border border-[#4ade80]/20 text-zinc-100 rounded-tr-sm"
                }`}
              >
                {cleanText(msg.text)}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-[#4ade80]/20 border border-[#4ade80]/30 flex items-center justify-center shrink-0">
              <Sprout size={14} className="text-[#4ade80]" />
            </div>
            <div className="bg-[#1e1e1e] border border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-zinc-500" />
              <span className="text-xs text-zinc-500">Sowi가 답변 중...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 결과 카드 or 입력창 */}
      {session.isCompleted && session.result ? (
        <div className="flex-1 overflow-y-auto border-t border-zinc-800/60">
          <ResultCard result={session.result} saveStatus={saveStatus} onReset={onReset} />
        </div>
      ) : (
        <div className="shrink-0 px-4 py-4 border-t border-zinc-800/60">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="답변을 입력하세요... (Enter로 전송)"
              rows={2}
              disabled={isLoading || session.isCompleted}
              className="flex-1 bg-[#1e1e1e] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none transition-colors disabled:opacity-40"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#4ade80] hover:bg-[#22c55e] disabled:bg-zinc-800 disabled:text-zinc-600 text-black flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-zinc-700 mt-2 text-center">
            Enter로 전송 · Shift+Enter로 줄바꿈
          </p>
        </div>
      )}
    </div>
  );
}
