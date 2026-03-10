import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Paperclip, Mic, Send, Globe, X, FileText, Upload } from "lucide-react";
import { FileAttachment } from "../types";
import { formatFileSize } from "../services/storageService";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isSearchOn: boolean;
  setIsSearchOn: (value: boolean) => void;
  attachment: FileAttachment | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (file: File) => void;
  onFileRemove: () => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  setInput,
  selectedModel,
  setSelectedModel,
  isSearchOn,
  setIsSearchOn,
  attachment,
  onFileSelect,
  onFileDrop,
  onFileRemove,
  onSend,
  isLoading
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className="absolute bottom-8 left-0 right-0 px-6"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={`max-w-3xl mx-auto bg-[#1a1a1a] border rounded-3xl shadow-2xl overflow-hidden transition-all ${isDragging
          ? "border-[#4ade80] border-2 shadow-[#4ade80]/20"
          : "border-zinc-800 focus-within:border-zinc-600"
        }`}>
        {/* 드래그 오버레이 */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm rounded-3xl"
            >
              <div className="flex flex-col items-center gap-3 text-[#4ade80]">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <Upload size={40} />
                </motion.div>
                <p className="text-sm font-bold">파일을 여기에 놓으세요</p>
                <p className="text-xs text-zinc-500">이미지, PDF, 문서 등 (최대 10MB)</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {attachment && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pt-4 flex items-center gap-4"
            >
              <div className="relative">
                {attachment.isImage && attachment.preview ? (
                  <img src={attachment.preview} className="w-20 h-20 object-cover rounded-xl border border-zinc-700" />
                ) : (
                  <div className="w-20 h-20 rounded-xl border border-zinc-700 bg-zinc-800 flex items-center justify-center">
                    <FileText size={28} className="text-zinc-400" />
                  </div>
                )}
                <button
                  onClick={onFileRemove}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="text-xs text-zinc-500">
                <p className="font-bold text-zinc-300 truncate max-w-[200px]">{attachment.file.name}</p>
                <p>{formatFileSize(attachment.file.size)}</p>
                {!attachment.isImage && (
                  <p className="text-zinc-600 mt-0.5">{attachment.file.type || "알 수 없는 형식"}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 px-6 pt-4 pb-2 border-b border-zinc-800/50">
          <div className="flex bg-[#121212] p-1 rounded-xl gap-1">
            <button
              onClick={() => setSelectedModel("gemini-3-flash-preview")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedModel === "gemini-3-flash-preview" ? "bg-[#4ade80] text-black" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Flash 3
            </button>
            <button
              onClick={() => setSelectedModel("gemini-3.1-pro-preview")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedModel === "gemini-3.1-pro-preview" ? "bg-[#4ade80] text-black" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Pro 3.1
            </button>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <button
            onClick={() => setIsSearchOn(!isSearchOn)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${isSearchOn ? "text-[#4ade80]" : "text-zinc-500"}`}
          >
            <Globe size={14} />
            실시간 검색 {isSearchOn ? "ON" : "OFF"}
          </button>
        </div>

        <div className="p-4 flex items-end gap-3">
          <div className="flex gap-2 mb-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.csv,.hwp"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors"
              title="파일 첨부 (이미지, PDF, 문서 등)"
            >
              <Paperclip size={20} />
            </button>
            <button className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors opacity-50 cursor-not-allowed" disabled title="준비 중인 기능입니다">
              <Mic size={20} />
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="작물 상태나 시세 등 궁금한 점을 물어보세요..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-200 placeholder-zinc-600 resize-none py-2 max-h-32 min-h-[44px]"
            rows={1}
          />

          <button
            onClick={onSend}
            disabled={(!input.trim() && !attachment) || isLoading}
            className={`p-3 rounded-2xl transition-all ${(input.trim() || attachment) && !isLoading ? "bg-[#4ade80] text-black shadow-lg shadow-[#4ade80]/20" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
