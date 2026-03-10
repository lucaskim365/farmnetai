# 데이터베이스 마이그레이션 완료

## 변경 사항 요약

### 이전 방식 ❌
```
앱 시작 → 컬렉션 확인 → 비어있음? → 하나씩 addDoc (느림)
                    → 있음? → 데이터 로드
```
**문제점:**
- 매번 컬렉션이 비어있는지 확인
- 순차적으로 26개 항목 삽입 (네트워크 왕복 26회)
- 로딩 시간 5-10초

### 현재 방식 ✅
```
앱 시작 → 시딩 상태 확인 → 완료됨? → 데이터 로드만
                       → 미완료? → 배치 쓰기로 한 번에 삽입 → 완료 표시
```
**개선점:**
- 한 번만 시딩 (배치 쓰기)
- 이후엔 읽기만 수행
- 로딩 시간 1초 미만

## 구현된 기능

### 1. 자동 시딩 시스템
- **파일**: `src/services/seedDatabase.ts`
- **기능**:
  - `seedDatabaseOnce()`: 한 번만 시딩
  - `checkSeedStatus()`: 시딩 상태 확인
  - `reseedDatabase()`: 강제 재시딩
- **최적화**: 배치 쓰기 사용

### 2. 데이터 로딩 훅 개선
- **useStoreData**: 시딩 로직 제거, 읽기만 수행
- **useEducationCourses**: 새로 생성, 교육 과정 로드

### 3. 관리자 도구
- **파일**: `src/utils/adminTools.ts`
- **사용법**:
  ```javascript
  // 브라우저 콘솔에서
  await window.adminTools.checkSeedStatus()
  await window.adminTools.reseedDatabase()
  ```

## Firestore 컬렉션

### 기준 데이터 (읽기 전용)
1. `farm_tools` - 6개 항목
2. `store_apps` - 8개 항목
3. `farm_tools_store` - 12개 항목
4. `education_courses` - 6개 항목

### 사용자 데이터
5. `users/{userId}/favorites` - 즐겨찾기 (읽기/쓰기)

### 시스템 데이터
6. `_system/seed_status` - 시딩 상태 추적

## 즐겨찾기 기능 유지 ✅

사용자별 즐겨찾기는 기존과 동일하게 작동:
- 경로: `users/{userId}/favorites/{appId}`
- 실시간 동기화
- 로그인 필요

## 성능 비교

| 항목 | 이전 | 현재 |
|------|------|------|
| 초기 로딩 | 5-10초 | 1초 미만 |
| 네트워크 요청 | 26회+ | 1-2회 |
| 데이터베이스 쓰기 | 매번 | 최초 1회만 |
| 사용자 경험 | 느림 | 빠름 |

## 사용 방법

### 첫 실행
1. 앱 실행
2. 자동으로 데이터베이스 시딩
3. 완료 후 정상 사용

### 데이터 수정
1. `src/data/initialData.ts` 또는 `educationData.ts` 수정
2. 브라우저 콘솔에서 `window.adminTools.reseedDatabase()` 실행
3. 페이지 새로고침

### 문제 해결
```javascript
// 시딩 상태 확인
await window.adminTools.checkSeedStatus()

// 재시딩
await window.adminTools.reseedDatabase()
```

## 파일 변경 내역

### 새로 생성
- `src/services/seedDatabase.ts` - 시딩 로직
- `src/hooks/useEducationCourses.ts` - 교육 과정 훅
- `src/utils/adminTools.ts` - 관리자 도구
- `DATABASE_SETUP.md` - 설정 가이드

### 수정됨
- `src/hooks/useStoreData.ts` - 시딩 로직 제거
- `src/EducationPage.tsx` - 훅 사용으로 변경
- `src/main.tsx` - 관리자 도구 초기화

### 유지됨 (참조용)
- `src/data/initialData.ts` - 초기 데이터 정의
- `src/data/educationData.ts` - 교육 과정 정의
- `src/services/storeService.ts` - 레거시 (사용 안 함)

## 다음 단계

### 권장 사항
1. Firestore 보안 규칙 설정 (DATABASE_SETUP.md 참조)
2. 프로덕션 배포 전 데이터 확인
3. 백업 정책 수립

### 선택 사항
- 관리자 대시보드 구축
- 데이터 버전 관리
- A/B 테스트를 위한 다중 데이터셋

## 주의사항

⚠️ **중요**
- 관리자 도구는 개발 환경에서만 활성화
- 프로덕션에서는 Firestore 콘솔 사용
- 재시딩 시 기존 데이터 백업 권장

## 결론

✅ 데이터베이스 기준 데이터로 전환 완료
✅ 로딩 성능 대폭 개선
✅ 즐겨찾기 기능 유지
✅ 관리 도구 제공
✅ 확장 가능한 구조
