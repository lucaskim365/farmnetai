import React from 'react';
import { Sprout } from 'lucide-react';

export function CropStatusCard() {
  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
      
      <div className="flex items-center justify-between mb-6 z-10">
        <div>
          <h4 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            방울 토마토
            <span className="text-emerald-400 text-sm font-normal bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
              정상
            </span>
          </h4>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 mt-auto z-10">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
          <span className="text-4xl">🍅</span>
        </div>
        
        <div className="flex-1 space-y-4 w-full">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-zinc-400">성장 단계</span>
              <span className="text-emerald-400 font-medium">개화기 (Flowering)</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-[60%]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-[#151515] border border-zinc-800 p-3 rounded-xl">
              <p className="text-[10px] text-zinc-500 mb-1 uppercase">성장 레벨</p>
              <p className="text-lg font-bold text-zinc-200">Stage 3</p>
            </div>
            <div className="bg-[#151515] border border-zinc-800 p-3 rounded-xl">
              <p className="text-[10px] text-zinc-500 mb-1 uppercase">예상 수확일</p>
              <p className="text-lg font-bold text-zinc-200">D-24</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
