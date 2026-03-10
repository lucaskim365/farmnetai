import React from "react";
import { Loader2 } from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types";
import { ChatMessage } from "./ChatMessage";

interface ChatViewProps {
    messages: ChatMessageType[];
    isLoading: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatView({ messages, isLoading, messagesEndRef }: ChatViewProps) {
    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-32">
            {messages.map((msg, idx) => (
                <React.Fragment key={msg.id || idx}>
                    <ChatMessage message={msg} index={idx} />
                </React.Fragment>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-[#1e1e1e] border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
                        <Loader2 size={18} className="animate-spin text-[#4ade80]" />
                        <span className="text-sm text-zinc-400">FarmNet이 생각 중입니다...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
