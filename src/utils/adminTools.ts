/**
 * 관리자 도구
 * 브라우저 콘솔에서 사용 가능한 유틸리티 함수들
 */

import { reseedDatabase, checkSeedStatus } from "../services/seedDatabase";

interface SeedResult {
  success?: boolean;
  alreadySeeded?: boolean;
  error?: unknown;
}

interface SeedStatus {
  completed?: boolean;
  timestamp?: Date;
  version?: string;
}

// 전역 객체에 관리자 도구 추가
declare global {
  interface Window {
    adminTools: {
      reseedDatabase: () => Promise<SeedResult>;
      checkSeedStatus: () => Promise<SeedStatus | null>;
    };
  }
}

export const initAdminTools = () => {
  window.adminTools = {
    reseedDatabase,
    checkSeedStatus
  };

  console.log("Admin tools loaded. Available commands:");
  console.log("- window.adminTools.checkSeedStatus()");
  console.log("- window.adminTools.reseedDatabase()");
};
