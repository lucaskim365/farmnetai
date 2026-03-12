import React from 'react';
import { CloudRain, ThermometerSun, Droplets, Wind, Sun, Cloud } from 'lucide-react';

export function WeatherCard() {
  const weeklyForecast = [
    { day: '월', tempHigh: 22, tempLow: 14, icon: <Sun size={20} className="text-yellow-400" /> },
    { day: '화', tempHigh: 20, tempLow: 15, icon: <CloudRain size={20} className="text-blue-400" /> },
    { day: '수', tempHigh: 25, tempLow: 16, icon: <Sun size={20} className="text-yellow-400" /> },
    { day: '목', tempHigh: 24, tempLow: 17, icon: <Cloud size={20} className="text-zinc-400" /> },
    { day: '금', tempHigh: 21, tempLow: 13, icon: <Sun size={20} className="text-yellow-400" /> },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Today's Status */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-3xl font-bold flex items-center gap-2 text-zinc-100">
            18°C
            <ThermometerSun size={28} className="text-yellow-500" />
          </h4>
          <p className="text-sm text-zinc-400 mt-1">대체로 맑음</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20">
            <Droplets size={16} />
            <span className="text-sm font-medium">습도 65%</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Wind size={16} />
            <span className="text-sm font-medium">수분 42%</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-zinc-800/60 my-2" />

      {/* Weekly Forecast */}
      <div className="grid grid-cols-5 gap-2 mt-auto">
        {weeklyForecast.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/60 transition-colors">
            <span className="text-xs text-zinc-500 mb-2 font-medium">{day.day}</span>
            <div className="mb-2">{day.icon}</div>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-zinc-200">{day.tempHigh}°</span>
              <span className="text-[10px] text-zinc-500">{day.tempLow}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
