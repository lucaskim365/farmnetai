import React from "react";
import { Star } from "lucide-react";

interface AppStoreItemProps {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

export function AppStoreItem({
  icon,
  title,
  desc,
  isFavorite,
  onToggleFavorite,
  onClick,
}: AppStoreItemProps) {
  return (
    <div className="bg-[#1e1e1e] border border-zinc-800/50 p-6 rounded-2xl hover:border-zinc-700 transition-all cursor-pointer group relative flex flex-col items-start text-left gap-4" onClick={onClick}>
      <button 
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/50 hover:bg-zinc-800 transition-colors z-10"
      >
        <Star 
          size={16} 
          className={isFavorite ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"} 
        />
      </button>
      <div className="w-10 h-10 bg-zinc-900/80 rounded-xl flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">{title}</h3>
        {desc && <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>}
      </div>
    </div>
  );
}
