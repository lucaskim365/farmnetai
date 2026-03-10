import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: ".env.local" });

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

  app.use(express.json());

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

      const chatHistory = (messages || []).map((m: any) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const response = await genAI.models.generateContent({
        model: selectedModel || "gemini-3-flash-preview",
        contents: [...chatHistory, { role: "user", parts }],
        config: {
          systemInstruction:
            "당신은 스마트 농업 비서 'FarmNet'입니다. 농민들에게 작물 재배, 병해충 진단, 농산물 시세, 정부 지원 사업 등에 대해 친절하고 전문적으로 답변해 주세요. 한국어로 답변하세요.",
          tools: isSearchOn ? [{ googleSearch: {} }] : undefined,
        },
      });

      res.json({ text: response.text || "답변을 생성할 수 없습니다." });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: error.message || "AI 응답 생성에 실패했습니다." });
    }
  });

  // AI Title generation proxy API
  app.post("/api/generate-title", async (req, res) => {
    try {
      const { input } = req.body;
      const titleResponse = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
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
