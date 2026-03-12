import React from 'react';
import { MapPin } from 'lucide-react';

// Farm zones defined by the user
const zones = [
  { id: 'A', name: 'A 구역', crop: '상추', color: 'from-emerald-600/20 to-emerald-900/20', borderColor: 'border-emerald-500/30', active: true },
  { id: 'B', name: 'B 구역', crop: '토마토', color: 'from-orange-600/20 to-orange-900/20', borderColor: 'border-orange-500/30', active: true, alert: true },
  { id: 'C', name: 'C 구역', crop: '감자', color: 'from-yellow-600/20 to-yellow-900/20', borderColor: 'border-yellow-500/30', active: true },
  { id: 'D', name: 'D 구역', crop: '휴경지', color: 'bg-zinc-800/20', borderColor: 'border-zinc-800/50', active: false },
];

export function FarmMap() {
  return (
    <div className="flex flex-col h-full h-full space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={16} className="text-zinc-500" />
        <span className="text-xs text-zinc-400">내 농장 배치도</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-[160px]">
        {zones.map((zone) => (
          <div 
            key={zone.id}
            className={`
              relative rounded-xl border flex flex-col justify-center items-center cursor-pointer transition-all hover:brightness-110
              ${zone.active ? `bg-gradient-to-br ${zone.color}` : zone.color}
              ${zone.borderColor}
            `}
          >
            {zone.alert && (
              <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
            
            <span className={`text-xl font-black mb-1 ${zone.active ? 'text-zinc-200' : 'text-zinc-600'}`}>{zone.id}</span>
            <span className={`text-xs ${zone.active ? 'text-zinc-400' : 'text-zinc-600'}`}>{zone.crop}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
