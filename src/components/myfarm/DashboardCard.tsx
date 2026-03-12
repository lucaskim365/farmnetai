import React from 'react';

interface DashboardCardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({ title, icon, children, className = '' }: DashboardCardProps) {
  return (
    <div className={`bg-[#121212] border border-zinc-800/60 rounded-2xl shadow-lg overflow-hidden flex flex-col ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800/40 bg-[#151515]">
          {icon && <span className="text-zinc-400">{icon}</span>}
          {title && <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>}
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
