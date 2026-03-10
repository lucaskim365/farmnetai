import { ChatMessage } from "../types";

export const generateAIResponse = async (
  messages: ChatMessage[],
  currentInput: string,
  currentImage: File | null,
  selectedModel: string,
  isSearchOn: boolean
) => {
  let imageData: { base64: string; mimeType: string } | null = null;

  if (currentImage) {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(currentImage);
    });
    imageData = { base64, mimeType: currentImage.type };
  }

  const chatHistory = messages.map(m => ({
    role: m.role,
    text: m.text,
  }));

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: chatHistory,
      currentInput,
      imageData,
      selectedModel,
      isSearchOn,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("AI Service Error:", errorData);
    throw new Error(errorData.error || "AI 응답 생성에 실패했습니다.");
  }

  const data = await response.json();
  return data.text || "답변을 생성할 수 없습니다.";
};

export const generateRoomTitle = async (input: string) => {
  try {
    const response = await fetch("/api/generate-title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    const data = await response.json();
    return data.title || input.slice(0, 20);
  } catch (e) {
    console.error("Title generation error:", e);
    return input.slice(0, 20);
  }
};
