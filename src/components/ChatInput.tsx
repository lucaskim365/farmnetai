import React, { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageIcon, Mic, Send, Globe, X } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isSearchOn: boolean;
  setIsSearchOn: (value: boolean) => void;
  selectedImage: File | null;
  imagePreview: string | null;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
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
  selectedImage,
  imagePreview,
  onImageSelect,
  onImageRemove,
  onSend,
  isLoading
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute bottom-8 left-0 right-0 px-6">
      <div className="max-w-3xl mx-auto bg-[#1a1a1a] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden focus-within:border-zinc-600 transition-all">
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pt-4 flex items-center gap-4"
            >
              <div className="relative">
                <img src={imagePreview} className="w-20 h-20 object-cover rounded-xl border border-zinc-700" />
                <button
                  onClick={onImageRemove}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="text-xs text-zinc-500">
                <p className="font-bold text-zinc-300">{selectedImage?.name}</p>
                <p>{(selectedImage?.size || 0) / 1024 > 1024 ? `${((selectedImage?.size || 0) / (1024 * 1024)).toFixed(2)} MB` : `${((selectedImage?.size || 0) / 1024).toFixed(2)} KB`}</p>
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
              onChange={onImageSelect}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ImageIcon size={20} />
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
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className={`p-3 rounded-2xl transition-all ${(input.trim() || selectedImage) && !isLoading ? "bg-[#4ade80] text-black shadow-lg shadow-[#4ade80]/20" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
