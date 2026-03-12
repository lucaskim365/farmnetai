import React from 'react';
import { TrendingUp, Coins, Receipt } from 'lucide-react';

export function ProfitSummary() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-zinc-400 text-sm">이번 주 수확량</h4>
        <span className="text-emerald-400 font-bold text-lg">180 kg</span>
      </div>
      
      <div className="w-full h-px bg-zinc-800/60" />
      
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <TrendingUp size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">예상 수익</p>
            <p className="text-sm font-bold text-zinc-200">2,500,000 원</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Receipt size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">예상 비용</p>
            <p className="text-sm font-bold text-zinc-200">900,000 원</p>
          </div>
        </div>
      </div>
      
      <div className="pt-2 border-t border-zinc-800/60 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400 flex items-center gap-1"><Coins size={14}/> 순수익 예측</span>
          <span className="text-emerald-400 font-black">1,600,000 원</span>
        </div>
      </div>
    </div>
  );
}
