import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  time: string;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: '2번 온실 물주기', completed: true, time: '07:00' },
    { id: 2, text: '비료 살포하기', completed: false, time: '10:30' },
    { id: 3, text: '해충 정기 점검', completed: false, time: '14:00' },
    { id: 4, text: '수확 장비 점검', completed: false, time: '16:00' },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-zinc-400">진행률</span>
        <span className="text-emerald-400 font-bold text-sm">{progress}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3 mt-auto">
        {tasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => toggleTask(task.id)}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
              task.completed 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-[#151515] hover:bg-[#1a1a1a] border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {task.completed ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <Circle size={18} className="text-zinc-600" />
              )}
              <span className={`text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                {task.text}
              </span>
            </div>
            <span className="text-xs text-zinc-600 bg-zinc-800/50 px-2 py-1 rounded-md">{task.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
