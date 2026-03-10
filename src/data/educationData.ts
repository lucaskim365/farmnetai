export interface EducationCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  badge?: string;
  badgeColor?: string;
  iconType: string;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  enrollmentStatus: "수강중" | "수강완료" | "수강신청";
}

export const EDUCATION_COURSES: EducationCourse[] = [
  {
    id: "iot-sensor-data",
    title: "스마트팜 IoT 센서 데이터 수집 및 분석",
    description: "실시간 환경 데이터를 수집하고 AI로 분석하는 방법을 배웁니다",
    category: "백엔드 개발",
    duration: "8시간",
    level: "사전지식 필요",
    badge: "NEW",
    badgeColor: "bg-green-500",
    iconType: "BookOpen",
    iconColor: "text-green-400",
    gradientFrom: "from-green-500/20",
    gradientTo: "to-emerald-600/20",
    enrollmentStatus: "수강신청"
  },
  {
    id: "soil-analysis-ai",
    title: "토양 분석 AI 모델 개발 실무",
    description: "토양 성분을 분석하고 최적의 시비 처방을 제공하는 AI 모델 구축",
    category: "프론트엔드 개발",
    duration: "6시간",
    level: "사전지식 필요",
    badge: "인기",
    badgeColor: "bg-blue-500",
    iconType: "FlaskConical",
    iconColor: "text-blue-400",
    gradientFrom: "from-blue-500/20",
    gradientTo: "to-cyan-600/20",
    enrollmentStatus: "수강중"
  },
  {
    id: "price-prediction-ml",
    title: "농산물 시세 예측 머신러닝 모델",
    description: "빅데이터 기반 농산물 가격 예측 시스템 개발",
    category: "데이터 분석",
    duration: "4시간",
    level: "사전지식 필요",
    iconType: "TrendingUp",
    iconColor: "text-orange-400",
    gradientFrom: "from-orange-500/20",
    gradientTo: "to-red-600/20",
    enrollmentStatus: "수강완료"
  },
  {
    id: "pest-diagnosis-dl",
    title: "병해충 진단 딥러닝 시스템 구축",
    description: "이미지 인식 AI로 작물 질병을 자동 진단하는 시스템 개발",
    category: "AI/ML",
    duration: "10시간",
    level: "사전지식 필요",
    iconType: "Bug",
    iconColor: "text-purple-400",
    gradientFrom: "from-purple-500/20",
    gradientTo: "to-pink-600/20",
    enrollmentStatus: "수강중"
  },
  {
    id: "weather-alert-system",
    title: "기상 데이터 기반 영농 알림 시스템",
    description: "실시간 기상 정보를 활용한 맞춤형 영농 알림 서비스 개발",
    category: "백엔드 개발",
    duration: "5시간",
    level: "사전지식 필요",
    iconType: "CloudSun",
    iconColor: "text-yellow-400",
    gradientFrom: "from-yellow-500/20",
    gradientTo: "to-amber-600/20",
    enrollmentStatus: "수강완료"
  },
  {
    id: "farm-diary-app",
    title: "디지털 영농일지 앱 개발 실습",
    description: "모바일 기반 영농 기록 관리 애플리케이션 제작",
    category: "프론트엔드 개발",
    duration: "7시간",
    level: "사전지식 필요",
    iconType: "ClipboardList",
    iconColor: "text-teal-400",
    gradientFrom: "from-teal-500/20",
    gradientTo: "to-green-600/20",
    enrollmentStatus: "수강신청"
  }
];
