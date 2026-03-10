import React from "react";
import { motion } from "motion/react";
import { FileText, Download } from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types";
import { formatFileSize, getFileExtension } from "../services/storageService";

function getFileIcon(fileType: string, fileName: string) {
  const ext = getFileExtension(fileName);
  const iconColors: Record<string, string> = {
    pdf: "text-red-400",
    doc: "text-blue-400",
    docx: "text-blue-400",
    xls: "text-green-400",
    xlsx: "text-green-400",
    csv: "text-green-400",
    txt: "text-zinc-400",
    hwp: "text-sky-400",
  };

  return iconColors[ext] || "text-zinc-400";
}

interface ChatMessageProps {
  message: ChatMessageType;
  index: number;
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const hasImage = message.imageUrl && !message.fileType;
  const hasFile = message.fileUrl && message.fileName;
  const isImageFile = message.fileType?.startsWith("image/");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
        {/* 기존 이미지 (imageUrl만 있는 경우 - 레거시 호환) */}
        {hasImage && (
          <img
            src={message.imageUrl}
            alt="Uploaded"
            className="max-w-sm rounded-2xl border border-zinc-800 shadow-xl"
            referrerPolicy="no-referrer"
          />
        )}

        {/* 새 파일 첨부 - 이미지인 경우 */}
        {hasFile && isImageFile && (
          <div className="relative group">
            <img
              src={message.fileUrl}
              alt={message.fileName}
              className="max-w-sm rounded-2xl border border-zinc-800 shadow-xl"
              referrerPolicy="no-referrer"
            />
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={message.fileName}
              className="absolute top-2 right-2 p-2 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-black/80"
              title="다운로드"
            >
              <Download size={16} />
            </a>
          </div>
        )}

        {/* 새 파일 첨부 - 일반 파일인 경우 */}
        {hasFile && !isImageFile && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-700 bg-[#1a1a1a] hover:bg-zinc-800 transition-colors group max-w-xs"
          >
            <div className={`p-2.5 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 transition-colors ${getFileIcon(message.fileType || "", message.fileName || "")}`}>
              <FileText size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{message.fileName}</p>
              <p className="text-xs text-zinc-500">
                {message.fileSize ? formatFileSize(message.fileSize) : ""}
                {message.fileType && !message.fileType.startsWith("image/") && (
                  <span className="ml-1.5 uppercase">{getFileExtension(message.fileName || "")}</span>
                )}
              </p>
            </div>
            <Download size={16} className="text-zinc-500 group-hover:text-[#4ade80] transition-colors flex-shrink-0" />
          </a>
        )}

        {/* 텍스트 메시지 */}
        {message.text && (
          <div className={`p-4 rounded-2xl shadow-lg ${message.role === "user"
              ? "bg-[#4ade80] text-black font-medium"
              : "bg-[#1e1e1e] border border-zinc-800 text-zinc-200"
            }`}>
            <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
