import { StoreApp } from "../types";

// Farm App Store 데이터
export const INITIAL_FARM_APPS_STORE: Omit<StoreApp, "id">[] = [
  {
    title: "인력 인터뷰",
    desc: "AI Sowi가 진행하는 농업 현장 인력 역량 평가",
    iconType: "UserCheck",
    color: "text-yellow-400",
    appType: "interview",
  },
  {
    title: "토양 분석",
    desc: "토양 성분 분석 및 시비 처방", 
    iconType: "FlaskConical", 
    color: "text-pink-400" 
  },
  { 
    title: "출하 시기 예측", 
    desc: "빅데이터 기반 최적 출하 시기 예측", 
    iconType: "TrendingUp", 
    color: "text-green-400" 
  },
  { 
    title: "날씨 알림", 
    desc: "지역별 맞춤형 영농 기상 정보", 
    iconType: "CloudSun", 
    color: "text-blue-400" 
  },
  { 
    title: "농약 정보", 
    desc: "안전한 농약 사용 정보 및 검색", 
    iconType: "FlaskConical", 
    color: "text-red-400" 
  },
  { 
    title: "농기계 대여", 
    desc: "가까운 농기계 임대 사업소 정보", 
    iconType: "Wrench", 
    color: "text-zinc-400" 
  },
  { 
    title: "영농 일지", 
    desc: "간편한 디지털 영농 기록 관리", 
    iconType: "ClipboardList", 
    color: "text-purple-400" 
  },
  { 
    title: "유통 경로", 
    desc: "효율적인 농산물 유통 및 판로 정보", 
    iconType: "TrendingUp", 
    color: "text-indigo-400" 
  },
  { 
    title: "시세 분석", 
    desc: "전국 도매시장 농산물 시세 분석", 
    iconType: "TrendingUp", 
    color: "text-orange-400" 
  },
];

// Farm Tools Store 데이터
export const INITIAL_FARM_TOOLS_STORE: Omit<StoreApp, "id">[] = [
  { 
    title: "병해충 진단", 
    desc: "AI 기반 병해충 자동 진단", 
    iconType: "Bug", 
    color: "text-emerald-400" 
  },
  { 
    title: "날씨 알림", 
    desc: "실시간 기상 정보 및 알림", 
    iconType: "CloudSun", 
    color: "text-blue-400" 
  },
  { 
    title: "시세 분석", 
    desc: "농산물 시세 분석 및 예측", 
    iconType: "TrendingUp", 
    color: "text-orange-400" 
  },
  { 
    title: "영농 일지", 
    desc: "디지털 영농 일지 작성", 
    iconType: "ClipboardList", 
    color: "text-purple-400" 
  },
  { 
    title: "비료 계산기", 
    desc: "작물별 시비량 자동 계산", 
    iconType: "Calculator", 
    color: "text-cyan-400" 
  },
  { 
    title: "토양 분석", 
    desc: "토양 성분 분석 및 처방", 
    iconType: "FlaskConical", 
    color: "text-pink-400" 
  },
  { 
    title: "출하 시기 예측", 
    desc: "최적 출하 시기 예측", 
    iconType: "TrendingUp", 
    color: "text-green-400" 
  },
  { 
    title: "농약 정보", 
    desc: "농약 사용 정보 검색", 
    iconType: "FlaskConical", 
    color: "text-red-400" 
  },
  { 
    title: "정부 보조금", 
    desc: "농업 지원 사업 정보", 
    iconType: "Building2", 
    color: "text-yellow-400" 
  },
  { 
    title: "농기계 대여", 
    desc: "농기계 임대 정보", 
    iconType: "Wrench", 
    color: "text-zinc-400" 
  },
  { 
    title: "유통 경로", 
    desc: "농산물 유통 및 판로", 
    iconType: "TrendingUp", 
    color: "text-indigo-400" 
  },
  { 
    title: "재배 매뉴얼", 
    desc: "작물별 재배 가이드", 
    iconType: "BookOpen", 
    color: "text-teal-400" 
  },
];

