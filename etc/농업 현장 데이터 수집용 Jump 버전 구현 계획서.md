<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# 농업 현장 데이터 수집용 Sowi 버전 구현 계획서

**문서명**: Farm Worker Interview System (농업 종사자 인터뷰 시스템)
**버전**: v1.0
**작성일**: 2026년 3월 12일
**대상**: 노지·시설 농가 현장 인력 (알바/상용직)
**기술 스택**: Google Gemini 2.5 API + Node.js Backend + Firestore

***

## 📋 목차

1. [프로젝트 개요](#1-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EA%B0%9C%EC%9A%94)
2. [시스템 아키텍처](#2-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98)
3. [인터뷰 설계](#3-%EC%9D%B8%ED%84%B0%EB%B7%B0-%EC%84%A4%EA%B3%84)
4. [루브릭 및 평가 체계](#4-%EB%A3%A8%EB%B8%8C%EB%A6%AD-%EB%B0%8F-%ED%8F%89%EA%B0%80-%EC%B2%B4%EA%B3%84)
5. [Gemini API 구현](#5-gemini-api-%EA%B5%AC%ED%98%84)
6. [백엔드 구현](#6-%EB%B0%B1%EC%97%94%EB%93%9C-%EA%B5%AC%ED%98%84)
7. [데이터 구조](#7-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EA%B5%AC%EC%A1%B0)
8. [보안 및 개인정보](#8-%EB%B3%B4%EC%95%88-%EB%B0%8F-%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4)
9. [프론트엔드 명세](#9-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EB%AA%85%EC%84%B8)
10. [테스트 전략](#10-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EC%A0%84%EB%9E%B5)
11. [운영 및 확장](#11-%EC%9A%B4%EC%98%81-%EB%B0%8F-%ED%99%95%EC%9E%A5)
12. [일정 및 마일스톤](#12-%EC%9D%BC%EC%A0%95-%EB%B0%8F-%EB%A7%88%EC%9D%BC%EC%8A%A4%ED%86%A4)
13. [환경 변수 목록](#13-%ED%99%98%EA%B2%BD-%EB%B3%80%EC%88%98-%EB%AA%A9%EB%A1%9D)
14. [예상 비용](#14-%EC%98%88%EC%83%81-%EB%B9%84%EC%9A%A9)
15. [리스크 및 대응](#15-%EB%A6%AC%EC%8A%A4%ED%81%AC-%EB%B0%8F-%EB%8C%80%EC%9D%91)
16. [성공 기준 (최종)](#16-%EC%84%B1%EA%B3%B5-%EA%B8%B0%EC%A4%80-%EC%B5%9C%EC%A2%85)

***

## 1. 프로젝트 개요

### 1.1 프로젝트 목적

**핵심 목표**: 농업 포털 플랫폼의 인력 매칭·교육 기능을 위한 **농업 종사자 면접 평가 데이터 수집 시스템** 구축

**해결하려는 문제**:

- 농가가 인력을 채용할 때 지원자의 실제 농작업 역량을 사전에 파악하기 어려움
- 농업 종사자가 자신의 부족한 역량을 객관적으로 진단받기 어려움
- 농업 교육 프로그램이 현장 필요와 맞지 않는 경우가 많음

**Sowi 농업 버전의 역할**:

- ❌ 채용 결정을 대신하지 않음
- ❌ 교육 콘텐츠를 직접 제공하지 않음
- ✅ 구조화된 면접을 통해 **고품질 역량 평가 데이터**를 수집
- ✅ 수집된 데이터를 농가·교육기관·정부 지원 프로그램에 연결


### 1.2 대상 사용자

**1차 대상 (인터뷰 대상자)**:

- 노지·시설 농가 현장 인력 (알바/상용직)
- 연령대: 20대~60대
- 스마트폰 기본 사용 가능자
- 농업 경험: 0년~5년

**2차 대상 (데이터 활용자)**:

- 농가 고용주 (인력 매칭)
- 농업 교육 기관 (맞춤형 교육 설계)
- 지자체·농업 지원 기관 (정책 설계)


### 1.3 성공 지표 (KPI)

| 지표 | 목표치 | 측정 방법 |
| :-- | :-- | :-- |
| 인터뷰 완주율 | 60% 이상 | Step 7 완료 / 전체 시작 |
| Step 4(안전) 응답률 | 70% 이상 | 안전 질문 답변 / 전체 |
| 데이터 품질 점수 | 80점 이상 | 구체성·완전성 자동 평가 |
| 농가 활용 의사 | 70% 만족 | 시범 농가 설문 |
| 교육 추천 정확도 | 75% 이상 | 사후 교육 이수 추적 |


***

## 2. 시스템 아키텍처

### 2.1 전체 구조

```
[농업 종사자]
    ↓ (모바일 웹/앱)
[Streamlit UI / React 웹]
    ↓ (HTTP)
[Node.js Backend API]
    ↓
[Gemini 2.5 Flash API] ← 인터뷰 진행 & JSON 생성
    ↓
[Backend Validation Layer] ← 데이터 검증·암호화
    ↓
[Firestore Database] ← 구조화된 데이터 저장
    ↓
[농업 포털 매칭 시스템] ← 데이터 활용
```


### 2.2 인증 및 세션 관리

**인증 방식**: JWT 기반 익명 토큰 (회원가입 불필요)

```javascript
// 인터뷰 시작 시 익명 토큰 발급
app.post('/api/auth/anonymous', async (req, res) => {
  const userId = crypto.randomUUID();
  const token = jwt.sign({ userId, role: 'interviewee' }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, userId });
});

// 미들웨어: 모든 /api/interview/* 에 적용
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '인증 토큰 없음' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: '토큰 만료 또는 유효하지 않음' });
  }
}
```

**세션 영속성 (Redis 기반)**:

```javascript
const redis = require('ioredis');
const client = new redis(process.env.REDIS_URL);

// 세션 저장 (TTL 2시간)
async function saveSession(userId, session) {
  const serializable = {
    step: session.step,
    scores: session.scores,
    history: session.chat.getHistory(), // 대화 기록 직렬화
  };
  await client.setex(`session:${userId}`, 7200, JSON.stringify(serializable));
}

// 세션 복구 (이어하기)
async function restoreSession(userId) {
  const data = await client.get(`session:${userId}`);
  if (!data) return null;
  const saved = JSON.parse(data);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: SYSTEM_INSTRUCTION });
  const chat = model.startChat({ history: saved.history });
  return { chat, step: saved.step, scores: saved.scores };
}
```

> ⚠️ **중요**: 메모리 `Map()`으로 세션을 저장하면 서버 재시작 또는 다중 인스턴스 환경(Cloud Run)에서 세션 소실이 발생함. 반드시 Redis 또는 Firestore 기반 세션으로 교체 필요.

### 2.3 핵심 설계 원칙

**원칙 1: Gemini는 인터페이스, 저장은 Backend**

- Gemini API는 대화 진행 + JSON 생성까지만
- 개인정보 암호화·DB 저장은 Node.js 서버가 담당

**원칙 2: 모바일 퍼스트**

- 농업 현장에서 스마트폰으로 쉽게 접근
- 간단한 대화형 UI (카카오톡 스타일)
- 음성 입력 지원 (STT)

**원칙 3: 점진적 프로파일링**

- 한 번에 많이 묻지 않음 (피로도 ↓)
- 7단계, 각 단계 3~5분
- 중간 저장 가능 (이어하기 기능)

**원칙 4: 농업 현장 맥락 반영**

- PESTEL 분석 데이터에서 추출한 농업 환경 정보를 시스템 프롬프트에 삽입
- 계절·지역·작물별 질문 변화
- 안전·법규 중심 평가

***

## 3. 인터뷰 설계

### 3.1 인터뷰 단계 (7 Step)

| Step | 목적 | 소요 시간 | 핵심 질문 수 |
| :-- | :-- | :-- | :-- |
| 0 | 신뢰 확보 \& 개인정보 동의 | 1분 | - |
| 1 | 기본 정보 \& 농업 경험 | 3분 | 3개 |
| 2 | 작업 이해도 평가 | 5분 | 4개 |
| 3 | 실무 경험 \& 숙련도 | 5분 | 4개 |
| 4 | 안전·위생 인식 | 5분 | 4개 |
| 5 | 성실성·근무 태도 | 4분 | 3개 |
| 6 | 요약 \& 교육 추천 | 2분 | - |
| **총계** |  | **25분** | **18개** |

### 3.2 Step별 상세 설계

#### Step 0: 신뢰 확보 \& 동의

**목적**: 인터뷰의 목적과 데이터 사용처를 투명하게 고지

**대화 흐름**:

```
Sowi: 안녕하세요. 저는 농업 일자리 매칭을 돕는 면접 도우미 Sowi입니다.

이 인터뷰는 약 25분 정도 걸리며, 여러분의 농업 작업 경험과 역량을 파악해서
1) 적합한 농가와 매칭하거나
2) 필요한 교육 과정을 추천하는 데 사용됩니다.

수집된 정보는 암호화되어 안전하게 보관되며, 본인이 원하면 언제든 삭제할 수 있습니다.

진행하시겠습니까? (예/아니오)
```

**동의 받지 못하면**: 즉시 종료

#### Step 1: 기본 정보 \& 농업 경험

**수집 항목**:

- 이름 (또는 닉네임)
- 연락처 (선택)
- 농업 경험 기간 (0년, 1년 미만, 1~3년, 3~5년, 5년 이상)
- 주요 경험 작물/환경 (노지 채소, 시설 채소, 과수, 축산, 기타)

**질문 예시**:

```
Q1: 성함이나 편하게 부를 수 있는 이름을 알려주세요.

Q2: 농사일 경험이 얼마나 되시나요?
    (예: 처음입니다 / 1년 정도 / 3년 이상)

Q3: 주로 어떤 작물이나 환경에서 일해보셨나요?
    (예: 노지 고추, 비닐하우스 토마토, 과수원 등)
```

**JSON 매핑**:

```json
{
  "basic_info": {
    "name": "김철수",
    "contact": "010-1234-5678",
    "experience_years": "1-3",
    "work_environment": "시설 채소"
  }
}
```


#### Step 2: 작업 이해도 평가

**평가 목표**: 기본 농작업 공정을 얼마나 정확히 이해하고 있는지

**질문 예시**:

```
Q1: 토마토 모종을 심을 때, 가장 먼저 해야 하는 일이 뭘까요?

Q2: "멀칭"이라는 말을 들어보셨나요? 어떤 작업인지 설명해주실 수 있나요?

Q3: 여름철 하우스에서 일할 때, 온도를 낮추려면 어떻게 해야 할까요?

Q4: 수확한 작물을 선별할 때, 보통 어떤 기준으로 나누나요?
```

**평가 기준** (Gemini가 자동 채점):

- 0~3점: 작업을 거의 모르거나 설명 불가
- 4~6점: 대략적인 개념은 알지만 구체적 방법 모름
- 7~8점: 작업 순서와 방법을 명확히 설명
- 9~10점: 세부 도구·주의사항까지 언급


#### Step 3: 실무 경험 \& 숙련도

**평가 목표**: 실제로 해본 경험이 있는지, 얼마나 능숙한지

**질문 예시**:

```
Q1: 비료나 농약을 직접 뿌려본 적이 있나요? 어떤 도구를 사용하셨나요?

Q2: 예취기나 분무기 같은 농기계를 다뤄보셨나요? 사용할 때 주의한 점은?

Q3: 하루에 가장 많이 수확해본 양이 얼마나 되나요? (예: 고추 20kg, 상추 50묶음)

Q4: 작업 중에 어려웠던 점이나 실수했던 경험을 말씀해주세요.
```

**평가 기준**:

- 0~3점: 거의 해본 적 없거나 관찰만 함
- 4~6점: 몇 번 해봤지만 능숙하지 않음
- 7~8점: 혼자서도 작업 가능, 속도는 보통
- 9~10점: 숙련되어 빠르고 정확하게 작업


#### Step 4: 안전·위생 인식 (가장 중요)

**평가 목표**: 본인과 동료의 안전을 지킬 수 있는지

**질문 예시**:

```
Q1: 농약을 뿌릴 때 반드시 착용해야 하는 보호 장비는 무엇인가요?

Q2: 여름철 폭염에 일할 때, 어떻게 몸 상태를 관리하시나요?

Q3: 무거운 상자를 들어 올릴 때, 허리를 다치지 않으려면 어떻게 해야 할까요?

Q4: 예취기 날이 회전 중일 때, 절대 하면 안 되는 행동은?
```

**평가 기준**:

- 0~4점: 안전 수칙을 거의 모르거나 무시
- 5~7점: 기본 안전 수칙은 알지만 실천 여부 불확실
- 8~9점: 안전 수칙을 정확히 알고 실천한다고 답변
- 10점: 구체적인 사례와 함께 안전 의식 높음

**❗ 특별 규칙**: 이 단계에서 5점 미만이면 "안전 교육 필수" 플래그 자동 설정

#### Step 5: 성실성·근무 태도

**평가 목표**: 농번기 장시간 근무, 팀워크, 지시 이행 의지

**질문 예시**:

```
Q1: 농번기에는 새벽부터 저녁까지 일해야 할 때도 있습니다. 
    이런 근무가 가능하신가요? 어떤 마음가짐으로 임하시나요?

Q2: 농장주나 선임 일꾼이 작업 지시를 했을 때, 이해가 안 되면 어떻게 하시나요?

Q3: 팀으로 일할 때, 본인이 맡은 역할은 무엇이었나요? 
    (예: 따라가면서 배우는 편, 적극적으로 돕는 편)
```

**평가 기준**:

- 0~4점: 장시간 근무 어려움, 소극적 태도
- 5~7점: 가능하지만 조건부, 보통 성실도
- 8~10점: 적극적 의지, 협업·학습 태도 좋음


#### Step 6: 요약 \& 교육 추천

**Gemini가 자동 생성하는 내용**:

```json
{
  "summary": {
    "total_score": 68,
    "strengths": [
      "시설 채소 작업 경험 1~3년으로 기본기 갖춤",
      "안전 수칙을 잘 알고 있으며 보호장비 착용 습관화"
    ],
    "weaknesses": [
      "농약 희석 비율 계산에 대한 이해 부족",
      "예취기 같은 소형 농기계 사용 경험 없음"
    ],
    "recommended_training": [
      {
        "category": "농약 안전 사용",
        "priority": "높음",
        "reason": "농약 관련 질문에서 구체적 방법 미흡"
      },
      {
        "category": "소형 농기계 조작",
        "priority": "중간",
        "reason": "예취기·분무기 실습 필요"
      }
    ],
    "suitable_farms": [
      "시설 채소 농가 (경력자 보조)",
      "유기농 농가 (안전 의식 높음)"
    ]
  }
}
```

**사용자에게 보여주는 화면**:

```
✅ 인터뷰 완료!

종합 점수: 68/100 (중급)

강점:
- 시설 채소 작업 경험이 탄탄합니다
- 안전 수칙을 잘 알고 계십니다

보완하면 좋은 점:
- 농약 희석 계산 방법을 익히시면 더 좋습니다
- 소형 농기계 실습을 추천드립니다

추천 교육:
1. [높음] 농약 안전 사용 교육 (2시간)
2. [중간] 소형 농기계 조작 교육 (4시간)

이 결과를 저장하고 농가 매칭에 사용하시겠습니까?
```


***

## 4. 루브릭 및 평가 체계

### 4.1 5단계 평가 루브릭

**Gemini에게 지시할 평가 기준** (시스템 프롬프트에 삽입):

```
너는 농업 현장 인력을 평가하는 면접관이다.
모든 답변을 아래 5개 영역으로 나눠서 0~10점으로 채점한다.

1. 작업 이해도 (Task Understanding) - 0~10점
   - 기본 농작업 공정(파종, 정식, 제초, 수확, 선별)을 얼마나 정확히 아는가?
   - 도구·자재 이름을 정확히 말하는가?
   - 작업 순서를 논리적으로 설명하는가?

2. 실무 경험·숙련도 (Practical Experience) - 0~10점
   - 실제로 해본 경험이 있는가?
   - 구체적인 사례(작물명, 수량, 도구)를 언급하는가?
   - 작업 속도·정확도를 스스로 평가할 수 있는가?

3. 안전·위생 인식 (Safety Awareness) - 0~10점
   - 보호장비(PPE) 필요성을 아는가?
   - 농약·예취기 등 위험 작업 시 안전 수칙을 아는가?
   - 폭염·무거운 짐 등 신체 보호 방법을 아는가?

4. 성실성·근무 태도 (Work Attitude) - 0~10점
   - 농번기 장시간·새벽 근무 의지가 있는가?
   - 지시를 잘 따르고 질문하는 태도가 좋은가?
   - 팀 작업에서 협력적인가?

5. 학습 의지 (Learning Willingness) - 0~10점
   - 모르는 것을 솔직히 인정하는가?
   - 새로운 작업을 배우려는 의지가 있는가?
   - 자신의 부족한 점을 개선하려는 태도가 있는가?

각 답변마다:
- 점수 (0~10)
- 한 줄 근거
- 구체적 예시 언급 여부 (true/false)
- 안전 관련 언급 여부 (true/false)
를 JSON으로 출력한다.
```


### 4.2 종합 점수 계산

**가중치 적용**:

```javascript
const weights = {
  task_understanding: 0.20,
  practical_experience: 0.25,
  safety_awareness: 0.30,  // 가장 중요
  work_attitude: 0.15,
  learning_willingness: 0.10
};

const totalScore = (
  scores.task_understanding * weights.task_understanding +
  scores.practical_experience * weights.practical_experience +
  scores.safety_awareness * weights.safety_awareness +
  scores.work_attitude * weights.work_attitude +
  scores.learning_willingness * weights.learning_willingness
) * 10; // 0~100점 환산
```


### 4.3 등급 분류

| 점수 | 등급 | 설명 | 권장 포지션 |
| :-- | :-- | :-- | :-- |
| 80~100 | 상급 | 숙련된 현장 인력 | 팀장급, 단독 작업 가능 |
| 60~79 | 중급 | 기본기 있는 인력 | 경력자 보조, 단순 작업 리드 |
| 40~59 | 초급 | 경험 부족하지만 가능성 있음 | 교육 후 보조 작업 |
| 0~39 | 입문 | 경험 거의 없음 | 집중 교육 필요 |


***

## 5. Gemini API 구현

### 5.1 System Instruction (핵심 프롬프트)

```javascript
const SYSTEM_INSTRUCTION = `
너는 한국 농업 포털 플랫폼의 현장 인력 면접 담당자 "Sowi"다.

## 역할
- 노지·시설 농가에서 일할 현장 인력(알바/상용직)을 인터뷰한다
- 7단계 구조화된 질문으로 역량을 평가한다
- 답변을 5개 영역(작업 이해도, 실무 경험, 안전 인식, 근무 태도, 학습 의지)으로 분석한다
- 최종적으로 JSON 형태의 평가 리포트를 생성한다

## 금지 사항
- 채용 결정을 대신하지 않는다
- 교육 콘텐츠를 직접 제공하지 않는다
- 사용자의 답변을 임의로 추측하거나 보완하지 않는다
- 데이터를 직접 저장하지 않는다 (서버가 담당)

## 인터뷰 진행 규칙
1. 반드시 Step 0부터 순서대로 진행
2. 한 번에 하나의 질문만 한다
3. 추상적인 답변에는 "구체적으로 어떻게 하셨나요?" 같은 재질문
4. 답변이 짧거나 애매하면 예시를 들어 다시 물어본다
5. Step 4(안전)에서 5점 미만이면 "⚠️ 안전 교육 필수" 플래그

## 농업 환경 맥락 (PESTEL 기반)
- 정부 지원: 청년 농업인 지원금 85.6% 증가, 정책 의존도 높음
- 인구: 0~5세 인구 37.9% 감소 → 장기적 인력 부족 심각
- 기술: AI·스마트팜 CAGR 40.5% 성장 → 기술 활용 의지 평가 중요
- 환경: ESG·K-ESG Lite 요구 증가 → 안전·위생 더 중요
- 법률: 최저임금 10,320원 → 생산성 중요, 플랫폼 규제 강화

이 맥락을 바탕으로 질문을 조정한다.
(예: "정부 지원 교육 받아보신 적 있나요?" 같은 질문 추가)

## 출력 형식
매 답변마다 다음 JSON 구조를 내부적으로 업데이트:
{
  "step": 2,
  "question_id": "Q2-3",
  "user_answer": "...",
  "scores": {
    "task_understanding": { "score": 7, "reason": "..." },
    "practical_experience": { "score": 6, "reason": "..." },
    "safety_awareness": { "score": 8, "reason": "...", "mentioned_safety": true },
    ...
  },
  "next_question": "..."
}

Step 6(최종 요약)에서는 전체 평가 리포트 JSON 생성.
`;
```


### 5.2 Gemini JSON Mode 활용 (구조화 출력)

Gemini 2.5는 `responseMimeType: "application/json"` + `responseSchema`를 지원. 별도 파싱 없이 보장된 JSON 출력 가능:

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: SYSTEM_INSTRUCTION,
  generationConfig: {
    temperature: 0.4,          // 낮을수록 일관된 평가 (0.7은 너무 창의적)
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        step: { type: "number" },
        next_question: { type: "string" },
        scores: {
          type: "object",
          properties: {
            task_understanding: {
              type: "object",
              properties: { score: { type: "number" }, reason: { type: "string" } }
            },
            // ... 나머지 4개 영역
          }
        }
      }
    }
  }
});
```

> 단, JSON mode는 대화형 응답(next_question)과 채점을 동시에 요청할 때 응답이 딱딱해질 수 있음. **채점 단계와 대화 단계를 분리**하는 것을 권장 (채점은 각 Step 완료 후 별도 호출).

### 5.3 Multi-Turn Chat 구현 (Node.js)

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 세션별 히스토리 저장 (메모리 또는 Firestore)
const sessions = new Map();

async function startInterview(userId) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION
  });
  
  const chat = model.startChat({
    history: [],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });
  
  sessions.set(userId, { chat, step: 0, scores: {} });
  
  // Step 0 시작
  const result = await chat.sendMessage("인터뷰를 시작합니다.");
  return result.response.text();
}

async function sendMessage(userId, userMessage) {
  const session = sessions.get(userId);
  if (!session) throw new Error("세션 없음");
  
  const result = await session.chat.sendMessage(userMessage);
  const response = result.response.text();
  
  // Step 진행 상황 추적
  session.step = extractStep(response); // 정규식으로 Step 번호 추출
  
  // Firestore에 중간 저장 (이어하기 기능)
  await saveSessionToFirestore(userId, session);
  
  return response;
}

async function finalizeInterview(userId, userEmail) {
  const session = sessions.get(userId);
  
  // Step 6 완료 확인
  if (session.step !== 6) {
    throw new Error("인터뷰 미완료");
  }
  
  // Gemini에게 최종 요약 요청
  const summaryPrompt = `
  모든 답변을 종합해서 다음 JSON 형식으로 최종 평가를 생성해줘:
  {
    "total_score": 0-100,
    "category_scores": {...},
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "recommended_training": [...],
    "suitable_farms": [...]
  }
  `;
  
  const result = await session.chat.sendMessage(summaryPrompt);
  const summaryJson = parseJSON(result.response.text());
  
  // Backend에서 검증·암호화·저장
  return await saveFarmWorkerData(userId, userEmail, summaryJson);
}
```


### 5.4 JSON Schema 강제 (Fallback 파싱)

Gemini 2.5는 JSON mode를 지원하지만, 완벽하지 않으므로 **후처리**:

```javascript
function parseJSON(text) {
  // 1. 마크다운 코드 블록 제거
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // 2. JSON 추출 시도
  try {
    return JSON.parse(text);
  } catch (e) {
    // 3. 정규식으로 JSON 부분만 추출
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("JSON 파싱 실패");
  }
}
```


***

## 6. 백엔드 구현

### 6.1 보안 미들웨어 (Rate Limiting + 입력 검증)

```javascript
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Rate Limiting: IP당 1시간에 10회 인터뷰 시작 (어뷰징 방지)
const startLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: '요청 한도 초과. 1시간 후 다시 시도하세요.' }
});

// Rate Limiting: 메시지는 분당 30회 (DoS 방지)
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: '메시지 전송 빈도가 너무 높습니다.' }
});

// 입력 검증
const validateMessage = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })  // 최대 2000자
    .escape(),  // XSS 방지
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];
```

### 6.2 API 엔드포인트 설계

```javascript
// server.js (Express)
const express = require('express');
const app = express();

// 인터뷰 시작
app.post('/api/interview/start', startLimiter, authMiddleware, async (req, res) => {
  const { userId } = req.body;
  
  // 개인정보 동의 확인
  if (!req.body.consent) {
    return res.status(400).json({ error: "동의 필요" });
  }
  
  const firstMessage = await startInterview(userId);
  res.json({ message: firstMessage, step: 0 });
});

// 메시지 전송
app.post('/api/interview/message', messageLimiter, authMiddleware, validateMessage, async (req, res) => {
  const { userId, message } = req.body;
  
  const response = await sendMessage(userId, message);
  const session = sessions.get(userId);
  
  res.json({ 
    message: response, 
    step: session.step,
    progress: (session.step / 6) * 100 
  });
});

// 최종 저장
app.post('/api/interview/finalize', async (req, res) => {
  const { userId, email } = req.body;
  
  // 이메일 검증
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "유효하지 않은 이메일" });
  }
  
  try {
    const result = await finalizeInterview(userId, email);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```


### 6.2 Firestore 데이터 저장

```javascript
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function saveFarmWorkerData(userId, email, evaluationData) {
  // 1. 이메일 암호화 (AES-256)
  const encryptedEmail = encrypt(email);
  
  // 2. 데이터 구조화
  const docData = {
    userId,
    email: encryptedEmail,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    evaluation: {
      total_score: evaluationData.total_score,
      category_scores: evaluationData.category_scores,
      strengths: evaluationData.strengths,
      weaknesses: evaluationData.weaknesses,
      recommended_training: evaluationData.recommended_training,
      suitable_farms: evaluationData.suitable_farms
    },
    metadata: {
      pestel_context_version: "v5.0.0", // PESTEL 데이터 버전
      interview_version: "farm_v1.0",
      completion_rate: 100
    }
  };
  
  // 3. Firestore 저장
  const docRef = await db.collection('farm_worker_evaluations').add(docData);
  
  // 4. 접근 로그 기록
  await db.collection('access_logs').add({
    docId: docRef.id,
    action: 'create',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    userId
  });
  
  return { id: docRef.id, ...docData };
}
```


### 6.3 데이터 삭제 API (개인정보보호법 필수)

```javascript
// 사용자 데이터 완전 삭제 (개인정보보호법 제36조: 열람·정정·삭제 요구권)
app.delete('/api/user/data', authMiddleware, async (req, res) => {
  const { userId } = req.user;

  try {
    // 1. Firestore 문서 삭제
    const snapshot = await db.collection('farm_worker_evaluations')
      .where('userId', '==', userId).get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // 2. Redis 세션 삭제
    await client.del(`session:${userId}`);

    // 3. 접근 로그에 삭제 기록 (법적 증빙용, 로그 자체는 30일 보관)
    await db.collection('access_logs').add({
      action: 'user_data_deletion',
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: '모든 개인정보가 삭제되었습니다.' });
  } catch (e) {
    res.status(500).json({ error: '삭제 처리 중 오류. 고객센터 문의 바랍니다.' });
  }
});

// 데이터 열람 API (개인정보보호법 제35조)
app.get('/api/user/data', authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const snapshot = await db.collection('farm_worker_evaluations')
    .where('userId', '==', userId).get();

  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    email: '[암호화됨]' // 이메일은 복호화해서 반환하지 않음
  }));

  res.json({ data });
});
```

### 6.4 암호화 함수

```javascript
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```


***

## 7. 데이터 구조

### 7.1 Firestore Collection 구조

```
farm_worker_evaluations/
  └─ {docId}/
      ├─ userId: string
      ├─ email: string (encrypted)
      ├─ timestamp: timestamp
      ├─ evaluation/
      │   ├─ total_score: number (0-100)
      │   ├─ category_scores/
      │   │   ├─ task_understanding: { score: number, reason: string }
      │   │   ├─ practical_experience: { score: number, reason: string }
      │   │   ├─ safety_awareness: { score: number, reason: string }
      │   │   ├─ work_attitude: { score: number, reason: string }
      │   │   └─ learning_willingness: { score: number, reason: string }
      │   ├─ strengths: array[string]
      │   ├─ weaknesses: array[string]
      │   ├─ recommended_training: array[object]
      │   └─ suitable_farms: array[string]
      └─ metadata/
          ├─ pestel_context_version: string
          ├─ interview_version: string
          └─ completion_rate: number
```


### 7.2 최종 JSON Payload 예시

```json
{
  "userId": "user_12345",
  "email": "encrypted_string_here",
  "timestamp": "2026-03-12T14:30:00Z",
  "evaluation": {
    "total_score": 68,
    "category_scores": {
      "task_understanding": {
        "score": 7,
        "reason": "기본 작업 공정을 알지만 일부 용어 미숙"
      },
      "practical_experience": {
        "score": 6,
        "reason": "1~3년 경험, 구체적 사례 언급 부족"
      },
      "safety_awareness": {
        "score": 9,
        "reason": "보호장비 착용, 안전 수칙 정확히 설명"
      },
      "work_attitude": {
        "score": 7,
        "reason": "장시간 근무 가능, 협력 태도 양호"
      },
      "learning_willingness": {
        "score": 8,
        "reason": "모르는 것 솔직히 인정, 배우려는 의지 높음"
      }
    },
    "strengths": [
      "시설 채소 작업 경험 1~3년",
      "안전 수칙 준수 의식 높음"
    ],
    "weaknesses": [
      "농약 희석 비율 계산 미숙",
      "소형 농기계 사용 경험 없음"
    ],
    "recommended_training": [
      {
        "category": "농약 안전 사용",
        "priority": "높음",
        "reason": "농약 관련 질문에서 구체적 방법 미흡",
        "duration": "2시간"
      },
      {
        "category": "소형 농기계 조작",
        "priority": "중간",
        "reason": "예취기·분무기 실습 필요",
        "duration": "4시간"
      }
    ],
    "suitable_farms": [
      "시설 채소 농가 (경력자 보조)",
      "유기농 농가 (안전 의식 중요)"
    ]
  },
  "metadata": {
    "pestel_context_version": "v5.0.0",
    "interview_version": "farm_v1.0",
    "completion_rate": 100
  }
}
```


***

## 8. 보안 및 개인정보

### 8.1 개인정보 처리 방침 (요약)

**수집 항목**:

- 필수: 이름/닉네임, 농업 경험 정보, 평가 답변
- 선택: 이메일, 전화번호

**수집 목적**:

- 농가-인력 매칭
- 맞춤형 교육 추천
- 정책 연구 (익명화 후)

**보관 기간**:

- 동의 철회 시까지 또는 최대 3년

**제3자 제공**:

- 사용자 동의 없이 외부 제공 안 함
- 매칭 시에만 농가에 제공 (이름·점수·강점/약점만)

**암호화**:

- 이메일·전화번호: AES-256 암호화
- 평가 답변: 암호화 안 함 (분석 필요)


### 8.2 동의 문구 (UI에 표시)

```
농업 인력 인터뷰 개인정보 수집·이용 동의

[수집 항목]
- 필수: 이름/닉네임, 농업 경험, 인터뷰 답변
- 선택: 이메일, 전화번호

[이용 목적]
- 농가와 인력 매칭
- 적합한 교육 과정 추천
- 농업 인력 정책 개선 연구 (익명화)

[보관 기간]
동의 철회 시 또는 최대 3년

[암호화]
이메일·전화번호는 AES-256으로 암호화되어 저장됩니다.

[철회 방법]
고객센터(support@농업포털.com) 또는 앱 내 설정에서 삭제 요청

위 내용에 동의하십니까? ☐ 동의함
```


### 8.3 개인정보보호법(PIPA) 준수 체크리스트

| 조항 | 요구사항 | 구현 방법 | 상태 |
| :-- | :-- | :-- | :-- |
| 제15조 | 수집·이용 목적 명시 및 동의 | Step 0 동의 + 동의 문구 UI | ✅ 계획됨 |
| 제22조 | 별도 동의 (선택 항목) | 이메일·전화번호 선택 동의 분리 | ✅ 계획됨 |
| 제29조 | 안전조치 의무 (암호화) | AES-256, HTTPS, 접근 로그 | ✅ 계획됨 |
| 제35조 | 개인정보 열람 요구권 | GET /api/user/data | ✅ 계획됨 |
| 제36조 | 정정·삭제 요구권 | DELETE /api/user/data | ✅ 계획됨 |
| 제39조의3 | 동의 없는 이용 정지 | 동의 철회 즉시 처리 | ⬜ 미구현 |
| 제32조의2 | 개인정보 보호책임자 지정 | 담당자 지정 필요 | ⬜ 미구현 |
| 제30조 | 개인정보 처리방침 공개 | 웹사이트 하단 링크 | ⬜ 미구현 |

> ⚠️ **주의**: 개인정보 처리방침은 서비스 오픈 전 법무 검토 필수. 농업 종사자 대상이므로 고령 사용자를 위한 쉬운 언어 사용 권장.

### 8.4 접근 권한 관리

| 역할 | 접근 범위 | 암호화 키 보유 |
| :-- | :-- | :-- |
| 시스템 관리자 | 전체 데이터 | ✅ |
| 농가 (매칭 시) | 이름·점수·강점/약점만 | ❌ |
| 교육 기관 | 교육 추천 필드만 | ❌ |
| 연구원 (정책) | 익명화된 통계만 | ❌ |


***

## 9. 프론트엔드 명세

### 9.1 기술 스택

| 항목 | 선택 | 이유 |
| :-- | :-- | :-- |
| 프레임워크 | React (Vite) | 모바일 최적화, 빠른 빌드 |
| 상태 관리 | Zustand | 가볍고 직관적 |
| UI 라이브러리 | Tailwind CSS | 빠른 반응형 스타일링 |
| 채팅 UI | 카카오톡 스타일 버블 | 사용자 친숙도 높음 |
| 배포 | Vercel / Firebase Hosting | CI/CD 자동화 |

### 9.2 주요 화면 구성

```
┌─────────────────────────────┐
│  🌾 농업인 역량 인터뷰         │
│  ━━━━━━━━━━━━░░░░ 3/7 단계  │  ← 진행 표시바
├─────────────────────────────┤
│                              │
│  [Sowi] 💬                   │
│  비료나 농약을 직접 뿌려본    │
│  적이 있나요?                 │
│                              │
│         [사용자] 💬           │
│         네, 분무기로 뿌려봤   │
│         어요                  │
│                              │
│  [Sowi] 💬                   │
│  어떤 보호장비를 착용하셨나요? │
│                              │
├─────────────────────────────┤
│  [🎤 음성으로 답하기]  [💬 입력] │
│  ┌───────────────────────┐  │
│  │ 여기에 입력하세요...   │  │
│  └───────────────────────┘  │
│  [잠시 멈추기]    [다음 ➡️]   │
└─────────────────────────────┘
```

### 9.3 접근성 요구사항 (고령 사용자 대응)

- 기본 폰트 크기: 18px 이상 (모바일)
- 버튼 최소 높이: 48px (터치 영역 확보)
- 색상 대비: WCAG AA 기준 4.5:1 이상
- 음성 안내: TTS로 Sowi 질문 읽어주기 옵션
- 자동 저장: 30초마다 진행 상황 저장 (실수로 뒤로가기 방지)
- 오프라인 감지: 네트워크 끊기면 "저장됨" 메시지 + 재연결 시 자동 이어하기

### 9.4 오프라인/저속 연결 대응

```javascript
// Service Worker로 인터뷰 임시 저장
// 농촌 지역 LTE 미약 지역 대비
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// 연결 상태 감지
window.addEventListener('offline', () => {
  showToast('인터넷 연결이 끊어졌습니다. 답변은 임시 저장됩니다.');
  localStorage.setItem('pending_answer', currentAnswer);
});

window.addEventListener('online', () => {
  const pending = localStorage.getItem('pending_answer');
  if (pending) {
    submitAnswer(pending);
    localStorage.removeItem('pending_answer');
  }
});
```

---

## 10. 테스트 전략

### 10.1 단위 테스트

```javascript
// Jest 기반 테스트
describe('parseJSON', () => {
  test('마크다운 코드블록 제거', () => {
    const input = '```json\n{"score": 7}\n```';
    expect(parseJSON(input)).toEqual({ score: 7 });
  });

  test('중첩 JSON 추출', () => {
    const input = '평가 결과입니다: {"score": 8, "reason": "좋음"}';
    expect(parseJSON(input)).toEqual({ score: 8, reason: '좋음' });
  });
});

describe('calculateTotalScore', () => {
  test('가중치 적용 점수 계산', () => {
    const scores = {
      task_understanding: 7,
      practical_experience: 6,
      safety_awareness: 9,
      work_attitude: 7,
      learning_willingness: 8,
    };
    // 7*0.20 + 6*0.25 + 9*0.30 + 7*0.15 + 8*0.10 = 7.35 → 73.5점
    expect(calculateTotalScore(scores)).toBeCloseTo(73.5);
  });
});
```

### 10.2 통합 테스트 시나리오

| 시나리오 | 테스트 내용 | 합격 기준 |
| :-- | :-- | :-- |
| 정상 완주 | Step 0~6 전체 통과 | JSON 리포트 정상 생성 |
| 중간 이탈 후 재개 | Step 3에서 이탈 → 재접속 | 이어하기 정상 동작 |
| 안전 점수 4점 이하 | Step 4에서 낮은 답변 | 안전 교육 필수 플래그 설정 |
| 동의 거부 | Step 0에서 '아니오' 응답 | 즉시 종료, 데이터 저장 안 됨 |
| 악성 입력 | XSS 코드 입력 | 이스케이프 처리, 오류 없음 |
| 세션 만료 | 2시간 후 메시지 전송 | 401 에러 + 재시작 안내 |
| Rate Limit 초과 | 분당 31번 메시지 | 429 Too Many Requests |

### 10.3 시범 테스트 계획 (11주차)

- **대상**: 시범 농가 5곳, 농업 종사자 30명
- **연령 분포**: 20대 6명, 30대 6명, 40대 9명, 50대 6명, 60대 3명
- **경험 분포**: 초보자 10명, 1~3년 15명, 3년 이상 5명
- **수집 지표**: 완주율, 단계별 이탈률, 평균 소요 시간, SUS(System Usability Scale) 점수
- **합격 기준**: 완주율 50% 이상, SUS 점수 68점 이상 (평균)

---

## 11. 운영 및 확장

### 9.1 A/B 테스트 계획

**테스트 1: 질문 순서**

- A안: 안전 질문을 Step 4 (중반)
- B안: 안전 질문을 Step 2 (초반)
- 측정: 완주율, 안전 점수 평균

**테스트 2: 질문 톤**

- A안: 격식체 ("~하십니까?")
- B안: 반말체 ("~해봤어요?")
- 측정: 사용자 만족도, 답변 길이

**테스트 3: 음성 입력**

- A안: 텍스트만
- B안: 음성 입력 + STT
- 측정: 완주율, 입력 시간


### 9.2 모니터링 지표

**실시간 대시보드**:

- 일일 인터뷰 시작 수
- 단계별 이탈률 (Step 0→1, 1→2, ...)
- 평균 완주 시간
- 안전 점수 평균 (5점 미만 비율)

**주간 리포트**:

- 교육 추천 분포 (어떤 교육이 가장 많이 추천되는지)
- 매칭 성공률 (농가가 실제 채용한 비율)
- 데이터 품질 점수 (답변 구체성)


### 9.3 확장 로드맵

**v1.0 (현재 계획)**:

- 노지·시설 채소 현장 인력 대상
- 7단계 인터뷰
- 텍스트 입력만

**v1.5 (3개월 후)**:

- 과수원·축산 버전 추가
- 음성 입력 (STT) 지원
- 사진 업로드 (작업 결과물 평가)

**v2.0 (6개월 후)**:

- 관리자·팀장급 인터뷰 (리더십 평가 추가)
- 계절별 질문 자동 변경 (봄=파종, 여름=방제, 가을=수확)
- 지역별 PESTEL 데이터 반영 (경기·전남·강원 등)

**v3.0 (1년 후)**:

- 농가용 역질문 시스템 (농가가 추가 질문 가능)
- 다국어 지원 (외국인 인력용 영어·베트남어)
- 블록체인 인증 (평가 결과 위변조 방지)

***

## 12. 일정 및 마일스톤

### 10.1 구현 일정 (12주)

| 주차 | 작업 | 담당 | 산출물 |
| :-- | :-- | :-- | :-- |
| 1-2주 | 요구사항 정리 \& 프롬프트 설계 | 기획·AI | System Instruction 최종본 |
| 3-4주 | Gemini API 연동 \& 테스트 | 백엔드 | Multi-turn chat 작동 |
| 5-6주 | Firestore 설계 \& 암호화 구현 | 백엔드 | 데이터 저장 기능 완료 |
| 7-8주 | UI 개발 (모바일 웹) | 프론트 | 인터뷰 화면 완성 |
| 9-10주 | 내부 테스트 \& 버그 수정 | 전체 | 20건 테스트 인터뷰 |
| 11주 | 시범 농가 테스트 | 운영 | 실제 농가 5곳, 지원자 30명 |
| 12주 | 피드백 반영 \& 런칭 | 전체 | v1.0 정식 오픈 |

### 10.2 마일스톤

**M1 (4주차)**: Gemini 인터뷰 프로토타입 완성
**M2 (8주차)**: 백엔드·UI 통합, 전체 플로우 작동
**M3 (11주차)**: 시범 테스트 완료, 피드백 수집
**M4 (12주차)**: 정식 런칭 (농업 포털에 통합)

---

## 13. 환경 변수 목록

개발 시작 전 반드시 설정해야 하는 환경 변수 전체 목록:

```bash
# .env.example

# Google Gemini
GEMINI_API_KEY=AIza...

# Firebase / Firestore
FIREBASE_PROJECT_ID=farmnet-interview
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@farmnet-interview.iam.gserviceaccount.com

# JWT
JWT_SECRET=최소_32자_이상_랜덤_문자열

# AES-256 암호화
ENCRYPTION_KEY=정확히_32바이트_16진수_문자열

# Redis (세션)
REDIS_URL=redis://localhost:6379

# 서버
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://farmnet.co.kr
```

> ⚠️ `.env` 파일은 절대 git에 커밋하지 않음. `.gitignore`에 반드시 포함.

---

## 14. 예상 비용

### 14.1 토큰 사용량 추정 (현실적 계산)

**인터뷰 1회당 토큰 사용량**:
- System Instruction: 약 1,500 토큰
- 18개 질문 + 답변 (평균 200 토큰/교환): 약 3,600 토큰
- 최종 요약 생성: 약 1,000 토큰
- **합계: 약 6,100 토큰/회** (입력 4,000 + 출력 2,100)

> ⚠️ **기존 계획 오류**: "500만 토큰 / 월 1,000명"은 회당 5,000 토큰 가정인데, System Instruction이 매 턴마다 포함되므로 실제로는 6,000~8,000 토큰/회가 현실적. 아래는 수정된 추정치.

### 14.2 월간 비용 (월 1,000명 기준)

| 항목 | 단가 | 수량 | 월 비용 |
| :-- | :-- | :-- | :-- |
| Gemini 2.5 Flash (입력) | $0.075/1M 토큰 | 400만 토큰 | $30 (약 4만 원) |
| Gemini 2.5 Flash (출력) | $0.30/1M 토큰 | 210만 토큰 | $63 (약 8.5만 원) |
| Firestore | 읽기 $0.06/10만, 쓰기 $0.18/10만 | 5만 읽기, 2만 쓰기 | $7 (약 1만 원) |
| Cloud Run (서버) | $0.00002400/vCPU·초 | 50시간 | $43 (약 6만 원) |
| Redis (세션) | $30/월 (기본 플랜) | 1 인스턴스 | $30 (약 4만 원) |
| 암호화 스토리지 | $0.026/GB | 5GB | $0.13 (약 175원) |
| **총 월 비용** | | | **약 173 (약 23.5만 원)** |

**연간 예상 비용**: 약 280만 원 (월 1,000명 기준)
**스케일업 시**: 월 5,000명 → 약 1,100만 원/년 예상

> 참고: Gemini 출력 토큰 단가($0.30)가 입력($0.075)보다 4배 비쌈. 요약 응답 길이를 최소화하는 것이 비용 절감에 효과적.

***

## 15. 리스크 및 대응

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
| :-- | :-- | :-- | :-- |
| Gemini API 응답 느림 | 중 | 중 | 타임아웃 15초 설정, 3회 재시도 + 지수 백오프 |
| 농업 용어 오인식 (STT) | 높음 | 중 | 농업 전문 용어 사전 추가 학습 |
| 고령 사용자 UI 어려움 | 중 | 높음 | 큰 글씨·간단한 버튼·음성 안내 |
| 개인정보 유출 | 낮음 | 치명 | 암호화·접근 로그·정기 보안 감사 |
| 낮은 완주율 (<60%) | 중 | 높음 | 중간 저장, 인센티브 (교육 쿠폰) |
| 세션 데이터 소실 | 중 | 높음 | Redis 세션 + Firestore 이중 백업 |
| 외국인 인력 언어 장벽 | 높음 | 중 | v1.5에서 베트남어·캄보디아어 추가 우선 검토 |
| AI 편향 평가 | 낮음 | 높음 | 월 1회 인간 검토자 샘플 채점 비교 |


***

## 16. 성공 기준 (최종)

**정량 지표**:

- 인터뷰 완주율 60% 이상
- 농가 활용률 70% 이상 (매칭 시 프로필 열람)
- 교육 이수 후 재평가 점수 +15점 이상

**정성 지표**:

- 농가: "프로필 보고 뽑았을 때 실제 역량이 맞았다" 80% 이상
- 지원자: "내 약점을 객관적으로 알게 됐다" 75% 이상
- 교육기관: "추천된 교육이 실제 필요와 일치한다" 80% 이상

***

## 부록

### A. 참고 문헌

1. paste.txt - G-IMPACT Engine PESTEL 분석 결과 (2026-02-23)
2. Firebase AI SDK Multi-turn Chat Documentation
3. Gemini API Structured Output Guide
4. 농업 종사자 안전 교육 가이드 (농림축산식품부)

### B. 용어 정리

- **PESTEL**: 정치·경제·사회·기술·환경·법률 분석 프레임워크
- **Gemini 2.5 Flash**: Google의 경량·고속 LLM
- **Multi-turn Chat**: 여러 차례 주고받는 대화형 AI
- **Firestore**: Google의 NoSQL 문서 데이터베이스
- **STT**: Speech-to-Text (음성을 텍스트로 변환)

***

**문서 작성자**: AI Assistant
**검토자**: (팀에서 지정)
**승인자**: (프로젝트 리더)
**다음 업데이트**: 프로토타입 완성 후 (4주 후 예정)

***

이 계획서를 기반으로 바로 개발에 착수할 수 있습니다. 추가로 필요한 것이 있으면 말씀해주세요!

