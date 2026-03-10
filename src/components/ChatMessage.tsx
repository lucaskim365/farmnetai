import React from "react";
import { motion } from "motion/react";
import { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
  index: number;
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
        {message.imageUrl && (
          <img 
            src={message.imageUrl} 
            alt="Uploaded" 
            className="max-w-sm rounded-2xl border border-zinc-800 shadow-xl"
            referrerPolicy="no-referrer"
          />
        )}
        <div className={`p-4 rounded-2xl shadow-lg ${
          message.role === "user" 
            ? "bg-[#4ade80] text-black font-medium" 
            : "bg-[#1e1e1e] border border-zinc-800 text-zinc-200"
        }`}>
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        </div>
      </div>
    </motion.div>
  );
}
