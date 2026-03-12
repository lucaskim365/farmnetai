import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function test() {
    try {
        console.log("Testing Gemini API with systemInstruction...");
        // Try passing it as a top-level property
        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: "user", parts: [{ text: "안녕" }] }],
            // @ts-ignore
            systemInstruction: "당신은 AI 비서입니다.",
        });

        console.log("Success with top-level systemInstruction!");
        console.log("Response JSON:", JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Failed with top-level systemInstruction:", error);

        try {
            console.log("Trying with config.systemInstruction...");
            const response = await genAI.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ role: "user", parts: [{ text: "안녕" }] }],
                // @ts-ignore
                config: {
                    systemInstruction: "당신은 AI 비서입니다."
                }
            });
            console.log("Success with config.systemInstruction!");
        } catch (error2) {
            console.error("Failed with config.systemInstruction:", error2);
        }
    }
}

test();
