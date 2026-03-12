# Sowi 인터뷰 앱 구현 계획서

**문서명**: Farm App Store - 농업 인력 인터뷰 앱 "Sowi" 구현 계획
**버전**: v1.0
**작성일**: 2026년 3월 12일
**기준 프로젝트**: `E:\Dev\farmnetai\farmnetai` (현재 코드베이스 기반)

---

## 1. 현재 프로젝트 구조 요약

```
farmnetai/
├── src/
│   ├── components/         ← UI 컴포넌트 (10개)
│   ├── hooks/              ← 커스텀 훅 (6개)
│   ├── services/           ← 비즈니스 로직 (5개)
│   ├── data/initialData.ts ← Farm App/Tools Store 초기 데이터
│   ├── App.tsx             ← 루트. ViewType으로 화면 전환
│   ├── types.ts            ← 타입 정의
│   └── firebase.ts         ← Firebase 설정
├── server.ts               ← Express + Gemini API 프록시
└── etc/                    ← 기획 문서
```

**핵심 패턴 확인**:
| 항목 | 현재 방식 |
|:--|:--|
| AI SDK | `@google/genai` (GoogleGenAI) |
| AI 호출 방식 | 매 요청마다 전체 history 전달 (stateless) |
| API 엔드포인트 | `server.ts`에 Express 라우트 추가 |
| 데이터 저장 | Firestore |
| 상태 관리 | Custom Hook 패턴 |
| 화면 전환 | `ViewType` 유니온 타입으로 `App.tsx`에서 분기 |
| 초기 데이터 | `seedDatabase.ts`로 Firestore에 시딩 |

---

## 2. 구현 목표

Farm App Store의 앱 카드를 클릭하면 "Sowi" 인터뷰 앱이 열린다.

```
[Farm App Store] → [인력 인터뷰 앱 카드 클릭] → [InterviewView 화면]
                                                       ↓
                                              [7단계 AI 인터뷰]
                                                       ↓
                                              [결과 Firestore 저장]
                                                       ↓
                                              [평가 리포트 표시]
```

---

## 3. 수정/생성할 파일 전체 목록

### 수정할 파일 (6개)

| 파일 | 변경 내용 |
|:--|:--|
| `src/types.ts` | `ViewType`에 `"interview"` 추가 + 인터뷰 관련 타입 추가 |
| `src/data/initialData.ts` | `INITIAL_FARM_APPS_STORE`에 Sowi 앱 항목 추가 |
| `src/services/seedDatabase.ts` | seed version 업그레이드 (재시딩 트리거) |
| `src/components/StoreView.tsx` | 앱 카드 클릭 시 `onAppClick` 콜백 추가 |
| `src/components/AppStoreItem.tsx` | `onClick` prop 추가 |
| `src/App.tsx` | `interview` view 처리 + `InterviewView` 렌더링 |
| `server.ts` | `/api/interview` 엔드포인트 추가 |

### 새로 만들 파일 (2개)

| 파일 | 내용 |
|:--|:--|
| `src/hooks/useInterview.ts` | 인터뷰 상태 + Gemini 통신 + Firestore 저장 |
| `src/components/InterviewView.tsx` | 인터뷰 UI (채팅 버블 + 진행 바 + 결과 카드) |

---

## 4. 단계별 구현 상세

### Step 1: 타입 확장 (`src/types.ts`)

```typescript
// 기존
export type ViewType = "chat" | "appstore" | "tools" | "education";

// 변경
export type ViewType = "chat" | "appstore" | "tools" | "education" | "interview";

// 추가할 타입
export interface InterviewMessage {
  role: "sowi" | "user";
  text: string;
  timestamp: Date;
}

export interface CategoryScore {
  score: number;   // 0~10
  reason: string;
}

export interface InterviewResult {
  totalScore: number;          // 0~100
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
  safetyFlagRequired: boolean; // Step 4 안전 점수 5점 미만
}

export interface InterviewSession {
  messages: InterviewMessage[];
  currentStep: number;         // 0~6
  isCompleted: boolean;
  result: InterviewResult | null;
  selectedAppId: string | null; // 어떤 앱에서 열렸는지
}
```

---

### Step 2: 앱 스토어 데이터 추가 (`src/data/initialData.ts`)

```typescript
// INITIAL_FARM_APPS_STORE 배열 맨 앞에 추가
{
  title: "인력 인터뷰",
  desc: "AI가 진행하는 농업 현장 인력 역량 평가",
  iconType: "UserCheck",       // lucide-react에 있는 아이콘
  color: "text-yellow-400",
  appType: "interview",        // 클릭 시 어떤 뷰를 열지 식별자
},
```

> **참고**: `StoreApp` 타입에 `appType?: string` 필드를 추가해야 함.
> `iconType: "UserCheck"` → `src/utils/iconMapper.ts`에 `UserCheck` 추가 필요.

---

### Step 3: 서버 엔드포인트 추가 (`server.ts`)

기존 `/api/chat`과 동일한 stateless 패턴 사용.
매 요청마다 전체 인터뷰 히스토리 + 새 메시지를 보내고 Gemini가 응답.

```typescript
// server.ts에 추가할 엔드포인트

const JUMP_SYSTEM_INSTRUCTION = `
너는 한국 농업 포털 플랫폼의 현장 인력 면접 담당자 "Sowi"다.

## 역할
- 노지·시설 농가에서 일할 현장 인력(알바/상용직)을 인터뷰한다
- 7단계(Step 0~6) 구조화된 질문으로 역량을 평가한다
- 답변을 5개 영역(작업 이해도, 실무 경험, 안전 인식, 근무 태도, 학습 의지)으로 분석한다

## 인터뷰 단계
- Step 0: 소개 및 개인정보 동의 확인
- Step 1: 기본 정보 & 농업 경험 (질문 3개)
- Step 2: 작업 이해도 평가 (질문 4개)
- Step 3: 실무 경험 & 숙련도 (질문 4개)
- Step 4: 안전·위생 인식 (질문 4개) ← 가장 중요
- Step 5: 성실성·근무 태도 (질문 3개)
- Step 6: 최종 평가 JSON 생성

## 진행 규칙
1. 반드시 Step 0부터 순서대로
2. 한 번에 하나의 질문만
3. 추상적인 답변엔 구체적 재질문
4. 답변이 짧으면 예시를 들어 다시 물어봄
5. Step 4에서 안전 수칙을 전혀 모르면 답변에 [안전교육필수] 태그 포함

## 말투
친절하고 자연스러운 반말체. 예: "네, 감사해요~ 다음으로..."

## Step 6 출력 형식
Step 6에서는 반드시 아래 JSON만 출력 (다른 텍스트 없이):
{
  "totalScore": 숫자,
  "grade": "상급|중급|초급|입문",
  "categoryScores": {
    "taskUnderstanding": { "score": 숫자, "reason": "..." },
    "practicalExperience": { "score": 숫자, "reason": "..." },
    "safetyAwareness": { "score": 숫자, "reason": "..." },
    "workAttitude": { "score": 숫자, "reason": "..." },
    "learningWillingness": { "score": 숫자, "reason": "..." }
  },
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendedTraining": [
    { "category": "...", "priority": "높음|중간|낮음", "reason": "..." }
  ],
  "suitableFarms": ["...", "..."],
  "safetyFlagRequired": true|false
}
`;

app.post("/api/interview", async (req, res) => {
  try {
    const { history, userMessage } = req.body;

    // history: InterviewMessage[] (role: "sowi"|"user", text: string)
    // Gemini 형식으로 변환
    const geminiHistory = (history || []).map((m: any) => ({
      role: m.role === "sowi" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",  // 또는 현재 사용 중인 모델
      contents: [
        ...geminiHistory,
        { role: "user", parts: [{ text: userMessage }] }
      ],
      systemInstruction: JUMP_SYSTEM_INSTRUCTION,
      // @ts-ignore
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
    });

    res.json({ text: response.text || "" });
  } catch (error: any) {
    console.error("Interview API Error:", error);
    res.status(500).json({ error: error.message || "인터뷰 응답 생성 실패" });
  }
});
```

---

### Step 4: 인터뷰 훅 (`src/hooks/useInterview.ts`)

상태 관리 + Gemini 통신 + Firestore 저장을 담당.

```typescript
import { useState, useCallback } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { InterviewMessage, InterviewResult, InterviewSession } from "../types";
import { User } from "firebase/auth";

export function useInterview(user: User | null) {
  const [session, setSession] = useState<InterviewSession>({
    messages: [],
    currentStep: 0,
    isCompleted: false,
    result: null,
    selectedAppId: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // 인터뷰 시작: Sowi의 첫 인사 메시지 전송
  const startInterview = useCallback(async (appId: string) => {
    setSession({
      messages: [],
      currentStep: 0,
      isCompleted: false,
      result: null,
      selectedAppId: appId,
    });

    setIsLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: [], userMessage: "인터뷰를 시작해줘" }),
      });
      const data = await res.json();

      setSession(prev => ({
        ...prev,
        messages: [{ role: "sowi", text: data.text, timestamp: new Date() }],
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 사용자 메시지 전송 + Sowi 응답 수신
  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMsg: InterviewMessage = { role: "user", text: userText, timestamp: new Date() };

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
    }));
    setIsLoading(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: session.messages,
          userMessage: userText,
        }),
      });
      const data = await res.json();
      const sowiText: string = data.text || "";

      // Step 진행 감지 (메시지 수 기반 간단 추정)
      const newMsgCount = session.messages.length + 2;
      const estimatedStep = Math.min(Math.floor(newMsgCount / 5), 6);

      // Step 6 JSON 감지 → 인터뷰 완료
      const isFinished = sowiText.trim().startsWith("{") && sowiText.includes("totalScore");
      let parsedResult: InterviewResult | null = null;

      if (isFinished) {
        try {
          parsedResult = JSON.parse(sowiText) as InterviewResult;
          // Firestore에 저장
          if (user) {
            await addDoc(collection(db, "interview_evaluations"), {
              userId: user.uid,
              result: parsedResult,
              messages: session.messages.map(m => ({ role: m.role, text: m.text })),
              completedAt: serverTimestamp(),
              interviewVersion: "sowi_v1.0",
            });
          }
        } catch {
          console.error("결과 JSON 파싱 실패");
        }
      }

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, { role: "sowi", text: sowiText, timestamp: new Date() }],
        currentStep: isFinished ? 6 : estimatedStep,
        isCompleted: isFinished,
        result: parsedResult,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [session.messages, isLoading, user]);

  const resetInterview = useCallback(() => {
    setSession({
      messages: [],
      currentStep: 0,
      isCompleted: false,
      result: null,
      selectedAppId: null,
    });
  }, []);

  return { session, isLoading, startInterview, sendMessage, resetInterview };
}
```

---

### Step 5: 인터뷰 뷰 컴포넌트 (`src/components/InterviewView.tsx`)

기존 `ChatView.tsx` 패턴을 참고해 작성.

```typescript
interface InterviewViewProps {
  session: InterviewSession;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onReset: () => void;
}
```

**화면 구성**:

```
┌──────────────────────────────────────┐
│  🌾 농업 인력 역량 인터뷰 - Sowi      │  ← 헤더
│  ━━━━━━━░░░░░░░░  Step 2 / 6        │  ← 진행 바
├──────────────────────────────────────┤
│                                      │
│  [Sowi] 💬                           │  ← AI 메시지 (왼쪽)
│  안녕하세요! 저는 Sowi입니다...       │
│                                      │
│            [사용자] 💬               │  ← 유저 메시지 (오른쪽)
│            네, 진행해주세요          │
│                                      │
│  [⏳ Sowi가 답변 중...]              │  ← 로딩 인디케이터
│                                      │
├──────────────────────────────────────┤
│  ┌──────────────────────┐  [전송 ➡] │  ← 입력창
│  │ 답변을 입력하세요...  │           │
│  └──────────────────────┘           │
└──────────────────────────────────────┘
```

**결과 화면 (isCompleted=true)**:

```
┌──────────────────────────────────────┐
│  ✅ 인터뷰 완료!                      │
│  종합 점수: 68 / 100  [중급]         │
├──────────────────────────────────────┤
│  📊 영역별 점수                       │
│  작업 이해도    ████████░░  7/10     │
│  실무 경험      ██████░░░░  6/10     │
│  안전 인식      █████████░  9/10     │
│  근무 태도      ███████░░░  7/10     │
│  학습 의지      ████████░░  8/10     │
├──────────────────────────────────────┤
│  💪 강점         ⚠️ 보완점           │
│  · 시설 채소 경험  · 농약 희석 미숙  │
│  · 안전 의식 높음  · 농기계 경험 없음 │
├──────────────────────────────────────┤
│  📚 추천 교육                        │
│  [높음] 농약 안전 사용               │
│  [중간] 소형 농기계 조작             │
├──────────────────────────────────────┤
│  [다시 인터뷰]    [앱 스토어로 돌아가기] │
└──────────────────────────────────────┘
```

---

### Step 6: StoreView & AppStoreItem 클릭 연결

**`AppStoreItem.tsx` 수정** - 카드 전체 클릭 가능하도록:

```typescript
// onClick prop 추가
interface AppStoreItemProps {
  // ...기존...
  onClick?: () => void;  // 추가
}

// div에 onClick 추가
<div
  className="bg-[#1e1e1e] border border-zinc-800/50 ..."
  onClick={onClick}  // 추가
>
```

**`StoreView.tsx` 수정** - `onAppClick` prop 추가:

```typescript
interface StoreViewProps {
  // ...기존...
  onAppClick?: (app: StoreApp) => void;  // 추가
}

// AppStoreItem에 onClick 연결
<AppStoreItem
  // ...기존...
  onClick={() => onAppClick?.(app)}  // 추가
/>
```

---

### Step 7: App.tsx 연결

```typescript
// 추가할 import
import InterviewView from "./components/InterviewView";
import { useInterview } from "./hooks/useInterview";

// 훅 추가 (App 컴포넌트 내부)
const { session, isLoading: interviewLoading, startInterview, sendMessage, resetInterview } = useInterview(user);

// 앱 클릭 핸들러 추가
const handleAppClick = (app: StoreApp) => {
  if ((app as any).appType === "interview") {
    setActiveView("interview");
    startInterview(app.id);
  }
  // 다른 appType은 추후 확장
};

// JSX 렌더링에 interview 분기 추가
{activeView === "interview" ? (
  <InterviewView
    session={session}
    isLoading={interviewLoading}
    onSendMessage={sendMessage}
    onReset={() => {
      resetInterview();
      setActiveView("appstore");
    }}
  />
) : activeView === "education" ? (
  // ... 기존 코드 ...
```

---

## 5. Firestore 데이터 구조

```
interview_evaluations/
  └─ {docId}/
      ├─ userId: string         ← Firebase Auth UID
      ├─ completedAt: Timestamp
      ├─ interviewVersion: "sowi_v1.0"
      ├─ result/
      │   ├─ totalScore: number (0-100)
      │   ├─ grade: "상급"|"중급"|"초급"|"입문"
      │   ├─ categoryScores/
      │   │   ├─ taskUnderstanding: { score, reason }
      │   │   ├─ practicalExperience: { score, reason }
      │   │   ├─ safetyAwareness: { score, reason }
      │   │   ├─ workAttitude: { score, reason }
      │   │   └─ learningWillingness: { score, reason }
      │   ├─ strengths: string[]
      │   ├─ weaknesses: string[]
      │   ├─ recommendedTraining: object[]
      │   ├─ suitableFarms: string[]
      │   └─ safetyFlagRequired: boolean
      └─ messages: object[]     ← 전체 대화 기록 (분석용)
```

---

## 6. 구현 순서 (권장)

```
1일차:
  ① src/types.ts            → ViewType + Interview 타입 추가
  ② src/data/initialData.ts → Sowi 앱 카드 데이터 추가
  ③ server.ts               → /api/interview 엔드포인트 추가
  → 테스트: curl -X POST /api/interview 로 Gemini 응답 확인

2일차:
  ④ src/hooks/useInterview.ts    → 상태/통신/저장 훅 구현
  ⑤ src/components/AppStoreItem.tsx → onClick prop 추가
  ⑥ src/components/StoreView.tsx    → onAppClick prop 추가

3일차:
  ⑦ src/components/InterviewView.tsx → 채팅 UI + 결과 카드 구현
  ⑧ src/App.tsx                       → interview 뷰 연결
  ⑨ src/services/seedDatabase.ts      → version "3.0.0"으로 올려 재시딩
  → 전체 플로우 테스트
```

---

## 7. 기존 패턴과의 차이점 및 주의사항

| 항목 | 기존 Chat | Interview |
|:--|:--|:--|
| AI 엔드포인트 | `/api/chat` | `/api/interview` (별도) |
| System Instruction | FarmNet 농업 비서 | Sowi 인터뷰 담당자 |
| 히스토리 저장 | Firestore (실시간) | `useState`로 메모리 유지, 완료 시에만 Firestore 저장 |
| 결과 파싱 | 없음 | Step 6 JSON 파싱 필요 |
| 인증 필요 여부 | 필요 (채팅방 생성) | 익명도 가능, 저장 시에만 로그인 요구 |

### ⚠️ 주의사항

1. **모델명**: 현재 `server.ts`가 `"gemini-3-flash-preview"` 사용 중. 인터뷰용은 정확한 모델명 확인 후 사용 (현재 사용 가능: `"gemini-2.5-flash-preview-04-17"` 또는 `"gemini-2.0-flash"`)

2. **seed 재실행**: `initialData.ts`에 Sowi 앱 추가 후 기존 DB에는 반영 안 됨. `seedDatabase.ts`의 version을 `"3.0.0"`으로 올리거나, Firestore 콘솔에서 직접 문서 추가

3. **iconMapper 업데이트**: `src/utils/adminTools.ts` 또는 `iconMapper.ts`에 `UserCheck` 아이콘 매핑 추가 필요

4. **Step 감지 방식**: 현재 계획은 메시지 수 기반 추정. 더 정확하려면 Gemini 응답에 `[STEP:N]` 태그를 포함시키도록 System Instruction에 명시

5. **비용**: 인터뷰 1회당 약 6,000~8,000 토큰 소비. 기존 `/api/chat`과 동일한 키로 사용하므로 별도 키 분리 고려

---

## 8. 확장 가능성

현재 프로젝트의 `ViewType` 패턴을 유지하므로 추후 확장이 쉬움:

```typescript
// 추후 다른 앱들도 같은 방식으로 확장 가능
if (app.appType === "interview") → "interview" 뷰
if (app.appType === "soilTest")  → "soilTest" 뷰  (v2)
if (app.appType === "diary")     → "diary" 뷰      (v2)
```

`StoreApp` 타입에 `appType?: string` 하나만 추가하면 모든 앱이 독립 뷰를 가질 수 있는 구조.

---

## 9. 파일별 변경 요약 (diff 수준)

```
src/types.ts                   +40줄  (ViewType + 5개 인터뷰 타입)
src/data/initialData.ts        +7줄   (Sowi 앱 1개)
server.ts                      +55줄  (시스템 프롬프트 + /api/interview 라우트)
src/hooks/useInterview.ts      신규   (~80줄)
src/components/InterviewView.tsx 신규 (~180줄)
src/components/AppStoreItem.tsx +3줄  (onClick prop)
src/components/StoreView.tsx    +5줄  (onAppClick prop)
src/App.tsx                    +20줄  (훅 연결 + interview 뷰 분기)
src/services/seedDatabase.ts   +1줄   (version 변경)
src/utils/iconMapper.ts        +2줄   (UserCheck 추가)
────────────────────────────────────────
총 변경량: 약 400줄 (신규 파일 포함)
```

---

**다음 단계**: 위 계획을 확인 후 구현 시작. `src/types.ts` → `server.ts` → `useInterview.ts` → `InterviewView.tsx` → `App.tsx` 순서로 진행 권장.
