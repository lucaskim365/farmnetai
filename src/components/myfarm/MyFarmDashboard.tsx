import React from 'react';
import { User as FirebaseUser } from "firebase/auth";
import { TreePine, Calendar, Search, Bell, AreaChart } from 'lucide-react';

import { DashboardCard } from './DashboardCard';
import { WeatherCard } from './WeatherCard';
import { TaskList } from './TaskList';
import { CropStatusCard } from './CropStatusCard';
import { ChartCard } from './ChartCard';
import { PestWarning } from './PestWarning';
import { FarmMap } from './FarmMap';
import { ProfitSummary } from './ProfitSummary';

interface MyFarmDashboardProps {
  onMenuClick: () => void;
  user: FirebaseUser | null;
}

export default function MyFarmDashboard({ onMenuClick, user }: MyFarmDashboardProps) {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden p-4 md:p-6">
      


      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <TreePine className="text-emerald-400" size={24} /> 
            내 농장 대시보드
          </h2>
          <p className="text-xs text-zinc-500">
            안녕하세요{user?.email ? `, ${user.email.split('@')[0]}님` : ''}! 오늘의 농장 현황을 요약해 드립니다.
          </p>
        </div>
      </div>
      
      {/* Grid Layout taking up remaining space properly */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 h-full pb-2">
        
        {/* Row 1 */}
        <DashboardCard title="오늘의 환경 상태" className="col-span-1 lg:col-span-1">
          <WeatherCard />
        </DashboardCard>

        <DashboardCard title="재배 작물 상태" className="col-span-1 md:col-span-2 lg:col-span-2">
          <CropStatusCard />
        </DashboardCard>

        <DashboardCard title="오늘의 작업 할당" className="col-span-1 lg:col-span-1">
          <TaskList />
        </DashboardCard>

        {/* Row 2 */}
        <DashboardCard title="온/습도 환경 변화 추이" icon={<AreaChart size={16}/>} className="col-span-1 md:col-span-2 lg:col-span-2 min-h-[200px]">
          <ChartCard />
        </DashboardCard>

        <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard title="경고 알림" className="col-span-1 md:col-span-2">
             <PestWarning />
          </DashboardCard>
          
          <DashboardCard className="col-span-1">
            <FarmMap />
          </DashboardCard>
          
          <DashboardCard title="수익 관리 요약" className="col-span-1">
            <ProfitSummary />
          </DashboardCard>
        </div>
        
      </div>
    </div>
  );
}
