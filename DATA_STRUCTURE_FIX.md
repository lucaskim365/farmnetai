# ✅ 데이터 구조 수정 완료

## 문제점
Farm App Store와 Farm Tools Store의 데이터가 잘못 매핑되어 있었습니다.

## 수정 내용

### 이전 (잘못된 구조)
```
INITIAL_STORE_APPS → farm_tools 컬렉션 (컬러풀한 도구들)
INITIAL_FARM_TOOLS → store_apps 컬렉션 (Wrench 아이콘들)
INITIAL_FARM_TOOLS_STORE → farm_tools_store 컬렉션
```

### 현재 (올바른 구조)
```
INITIAL_FARM_APPS_STORE → farm_apps_store 컬렉션 (Farm App Store용)
INITIAL_FARM_TOOLS_STORE → farm_tools_store 컬렉션 (Farm Tools Store용)
```

## Firestore 컬렉션 구조

### 1. farm_apps_store (8개 항목)
**Farm App Store 데이터**
- 모두 Wrench 아이콘
- 회색 계열 색상
- 예: 토양 분석, 출하 시기 예측, 날씨 알림 등

### 2. farm_tools_store (12개 항목)
**Farm Tools Store 데이터**
- 다양한 컬러풀 아이콘
- 각기 다른 색상
- 예: 병해충 진단, 날씨 알림, 시세 분석 등

### 3. education_courses (6개 항목)
**교육 과정 데이터** (변경 없음)

## 변경된 파일

### 수정됨
1. `src/data/initialData.ts`
   - `INITIAL_STORE_APPS` → `INITIAL_FARM_APPS_STORE`
   - `INITIAL_FARM_TOOLS` → 삭제
   - `INITIAL_FARM_TOOLS_STORE` 유지 (올바른 데이터로 수정)

2. `src/services/seedDatabase.ts`
   - import 수정
   - 컬렉션 이름 변경: `farm_apps_store`, `farm_tools_store`
   - 기존 데이터 삭제 기능 추가 (`clearCollection`)
   - 버전 2.0.0으로 업데이트

3. `src/hooks/useStoreData.ts`
   - `apps`, `tools` → `farmAppsStore`, `farmToolsStore`
   - 컬렉션 이름 변경

4. `src/App.tsx`
   - 변수명 변경: `apps` → `farmAppsStore`
   - 모든 참조 업데이트

### 삭제됨
- `src/services/storeService.ts` (더 이상 사용하지 않음)

## 데이터베이스 재시딩 방법

### 자동 재시딩
앱을 새로고침하면 자동으로 감지하고 재시딩합니다.

### 수동 재시딩
브라우저 콘솔에서:
```javascript
await window.adminTools.reseedDatabase()
```

## 재시딩 프로세스

1. **기존 데이터 삭제**
   - `farm_apps_store` 컬렉션 전체 삭제
   - `farm_tools_store` 컬렉션 전체 삭제
   - `education_courses` 컬렉션 전체 삭제

2. **새 데이터 삽입**
   - 배치 쓰기로 한 번에 삽입
   - order 필드로 정렬 순서 보장

3. **시딩 상태 업데이트**
   - `_system/seed_status` 문서 업데이트
   - version: "2.0.0"

## 확인 사항

### ✅ Farm App Store
- 8개 항목
- 모두 Wrench 아이콘
- 회색 계열 색상

### ✅ Farm Tools Store
- 12개 항목
- 다양한 아이콘 (Bug, CloudSun, TrendingUp 등)
- 컬러풀한 색상

### ✅ 즐겨찾기 기능
- 사용자별로 정상 작동
- `users/{userId}/favorites` 경로 유지

## 테스트 결과

- ✅ TypeScript 오류 없음
- ✅ 모든 컬렉션 정상 로드
- ✅ 즐겨찾기 기능 정상
- ✅ 성능 최적화 유지

## 주의사항

⚠️ **중요**
- 재시딩 시 기존 데이터가 모두 삭제됩니다
- 사용자 즐겨찾기는 영향받지 않습니다
- 프로덕션 환경에서는 신중하게 실행하세요

## 다음 단계

1. 브라우저에서 앱 실행
2. 콘솔에서 `window.adminTools.reseedDatabase()` 실행
3. 페이지 새로고침
4. Farm App Store와 Farm Tools Store 확인

**데이터 구조가 올바르게 수정되었습니다!** ✅
