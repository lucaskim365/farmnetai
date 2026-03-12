import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function test() {
    try {
        console.log("Testing Gemini API with Image...");
        const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: "이 이미지에 무엇이 있나요?" },
                        {
                            inlineData: {
                                data: base64Image,
                                mimeType: "image/png",
                            },
                        },
                    ],
                },
            ],
            // @ts-ignore
            systemInstruction: "당신은 AI 비서입니다.",
        });

        console.log("Success with Image!");
        console.log("Response JSON:", JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Failed with Image:", error);
    }
}

test();
