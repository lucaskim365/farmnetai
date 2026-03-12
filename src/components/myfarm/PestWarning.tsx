import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function PestWarning() {
  return (
    <div className="flex items-center gap-4 h-full bg-red-500/5 p-4 rounded-xl border border-red-500/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all" />
      
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-900/10 border border-red-500/20 flex flex-col items-center justify-center shrink-0 z-10 relative">
        <span className="text-2xl z-10">🐛</span>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
          <AlertTriangle size={10} className="text-black" />
        </div>
      </div>
      
      <div className="z-10 flex-1">
        <h4 className="text-red-400 font-bold text-lg mb-1">해충 발생 위험!</h4>
        <p className="text-sm text-zinc-300">
          온실 B구역 주변에서 해충(총채벌레) 발생 징후가 감지되었습니다. 즉시 확인이 필요합니다.
        </p>
      </div>
    </div>
  );
}
