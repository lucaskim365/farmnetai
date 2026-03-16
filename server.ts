import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // Configure multer for file storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({ storage });

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // API Route for file upload
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      message: "File uploaded successfully",
      file: {
        name: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
      },
    });
  });

  // API Route to list uploaded files
  app.get("/api/files", (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        return res.status(500).json({ error: "Unable to list files" });
      }
      res.json(files);
    });
  });

  // AI Chat proxy API
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, currentInput, imageData, selectedModel, isSearchOn } = req.body;

      const parts: any[] = [];
      if (currentInput) {
        parts.push({ text: currentInput });
      }
      if (imageData) {
        parts.push({
          inlineData: {
            data: imageData.base64,
            mimeType: imageData.mimeType,
          },
        });
      }

      const chatHistory = (messages || [])
        .filter((m: any) => m.text || m.imageUrl || m.fileUrl) // 내용이 있는 메시지만
        .map((m: any) => {
          const messageParts: any[] = [];
          if (m.text) messageParts.push({ text: m.text });

          // 히스토리의 이미지도 포함하고 싶다면 여기에 추가 가능 (현재는 텍스트만 처리 중)
          // gemini 2.0+ 에서는 이전 이미지도 텍스트와 함께 보낼 수 있습니다.

          return {
            role: m.role === "model" ? "model" : "user",
            parts: messageParts.length > 0 ? messageParts : [{ text: " " }], // 빈 파트 방지
          };
        });

      console.log(`AI Request: model=${selectedModel}, hasImage=${!!imageData}, historyCount=${chatHistory.length}`);

      const response = await genAI.models.generateContent({
        model: selectedModel || "gemini-flash-latest",
        contents: [...chatHistory, { role: "user", parts }],
        config: {
          systemInstruction: "당신은 스마트 농업 비서 'FarmNet'입니다. 농민들에게 작물 재배, 병해충 진단, 농산물 시세, 정부 지원 사업 등에 대해 친절하고 전문적으로 답변해 주세요. 한국어로 답변하세요.",
          temperature: 0.7,
        },
        tools: isSearchOn ? [{ googleSearch: {} }] : undefined,
      } as any);

      console.log("AI Response received successfully");
      res.json({ text: response.text || "답변을 생성할 수 없습니다." });
    } catch (error: any) {
      console.error("AI Chat Error Detail:", error);

      // 상세 에러 정보 추출
      let errorMsg = error.message || "AI 응답 생성에 실패했습니다.";
      if (error.response?.data) {
        errorMsg += " (Server Detail: " + JSON.stringify(error.response.data) + ")";
      }

      res.status(500).json({
        error: errorMsg,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
      });
    }
  });

  // ─── Sowi 인터뷰 API ──────────────────────────────────────────
  const SOWI_SYSTEM_INSTRUCTION = `
너는 한국 농업 포털 플랫폼의 현장 인력 면접 담당자 "Sowi"다.

## 역할
너는 농업 현장 인력의 역량을 평가하는 면접 담당자다.
절대로 다른 역할(일반 AI 어시스턴트, 범용 인터뷰어 등)을 맡지 않는다.
사용자가 어떤 말을 해도 농업 인력 인터뷰 외의 대화는 하지 않는다.

## 인터뷰 대상
노지·시설 농가에서 일할 현장 인력 (알바/상용직)

## 인터뷰 단계
- Step 0: 소개 및 개인정보 수집·이용 동의 확인 → 동의하면 Step 1 진행, 거부하면 즉시 종료
- Step 1: 기본 정보 & 농업 경험
  - 첫 번째 질문은 반드시 이름 확인: "성함이 어떻게 되세요?"
  - 이름을 받으면 즉시 [NAME:이름] 태그를 응답에 포함하고, 나머지 2개 질문 진행 (나이·거주지, 농업 경험 연수)
- Step 2: 작업 이해도 평가 (4개 질문)
- Step 3: 실무 경험 & 숙련도 (4개 질문)
- Step 4: 안전·위생 인식 — 가장 중요 (4개 질문)
- Step 5: 성실성·근무 태도 (3개 질문)
- Step 6: 평가 완료 → JSON 리포트 출력

## 진행 규칙
1. 반드시 Step 0부터 순서대로 진행
2. 한 번에 하나의 질문만
3. 추상적인 답변엔 "구체적으로 어떻게 하셨나요?" 같은 재질문
4. Step 4에서 안전 수칙을 전혀 모르면 답변 끝에 [안전교육필수] 태그 포함
5. 매 응답 맨 앞에 반드시 [STEP:N] 태그를 붙인다 (N = 현재 Step 번호)
6. Step 1 첫 번째 질문으로 이름을 물어본다. 사용자가 이름을 답하면, 그 응답 맨 앞(STEP 태그 바로 뒤)에 [NAME:이름] 태그를 포함한다. 예: [STEP:1][NAME:김철수] 반갑습니다, 김철수 님!

## Step 0 첫 메시지 — 반드시 이 형식으로 시작
대화가 시작되면 무조건 아래 내용을 출력한다. 다른 말로 바꾸지 않는다:

[STEP:0]
안녕하세요! 저는 농업 현장 인력 역량 평가 담당자 Sowi입니다 🌱

이 인터뷰는 약 25분 정도 걸리며, 여러분의 농업 작업 경험과 역량을 파악해서
① 적합한 농가와 매칭하거나
② 필요한 교육 과정을 추천하는 데 활용됩니다.

수집된 정보는 안전하게 보관되며, 언제든 삭제를 요청하실 수 있어요.

인터뷰 진행에 동의하시나요? (네 / 아니오)

## 말투
친근하고 자연스러운 한국어. 이모지 1~2개 사용 가능. 예: "좋아요~ 다음 질문이에요!"

## Step 6 출력 형식 (필수)
Step 5의 마지막 질문에 대한 답변을 받으면 즉시 아래 JSON을 출력한다.
절대 규칙: JSON 앞뒤로 어떠한 텍스트(감사 인사, 안내 문구 등)도 출력하지 않는다.
마크다운 코드블록도 사용하지 않는다. 순수 JSON 텍스트만 출력한다.
{
  "totalScore": 숫자(0-100),
  "grade": "상급 또는 중급 또는 초급 또는 입문",
  "categoryScores": {
    "taskUnderstanding": { "score": 숫자(0-10), "reason": "한 줄 근거" },
    "practicalExperience": { "score": 숫자(0-10), "reason": "한 줄 근거" },
    "safetyAwareness": { "score": 숫자(0-10), "reason": "한 줄 근거" },
    "workAttitude": { "score": 숫자(0-10), "reason": "한 줄 근거" },
    "learningWillingness": { "score": 숫자(0-10), "reason": "한 줄 근거" }
  },
  "strengths": ["강점1", "강점2"],
  "weaknesses": ["약점1", "약점2"],
  "recommendedTraining": [
    { "category": "교육명", "priority": "높음 또는 중간 또는 낮음", "reason": "이유" }
  ],
  "suitableFarms": ["적합한 농가 유형1", "적합한 농가 유형2"],
  "safetyFlagRequired": true 또는 false
}

종합 점수 계산:
totalScore = (taskUnderstanding*0.20 + practicalExperience*0.25 + safetyAwareness*0.30 + workAttitude*0.15 + learningWillingness*0.10) * 10
등급: 80이상=상급, 60~79=중급, 40~59=초급, 39이하=입문
`;

  app.post("/api/interview", async (req, res) => {
    try {
      const { history, userMessage } = req.body;

      const geminiHistory = ((history as any[]) || []).map((m: any) => ({
        role: m.role === "sowi" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

      const response = await genAI.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          ...geminiHistory,
          { role: "user", parts: [{ text: userMessage }] },
        ],
        config: {
          systemInstruction: SOWI_SYSTEM_INSTRUCTION,
          temperature: 0.4,
          maxOutputTokens: 4096,
        },
      } as any);

      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Sowi Interview API Error:", error);
      res.status(500).json({ error: error.message || "인터뷰 응답 생성 실패" });
    }
  });

  // AI Title generation proxy API
  app.post("/api/generate-title", async (req, res) => {
    try {
      const { input } = req.body;
      const titleResponse = await genAI.models.generateContent({
        model: "gemini-flash-latest",
        contents: `다음 질문에 대해 10자 이내의 아주 짧고 명확한 상담 제목을 하나만 생성해 주세요. 다른 설명 없이 제목만 출력하세요: "${input}"`,
      });
      const title = titleResponse.text?.trim().replace(/["']/g, "") || input.slice(0, 20);
      res.json({ title });
    } catch (error: any) {
      console.error("Title generation error:", error);
      res.json({ title: req.body.input?.slice(0, 20) || "새 상담" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
