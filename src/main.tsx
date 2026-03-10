import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAdminTools } from './utils/adminTools';

// 개발 환경에서 관리자 도구 초기화
if (import.meta.env.DEV) {
  initAdminTools();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
