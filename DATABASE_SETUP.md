# 데이터베이스 설정 가이드

## 개요

Farm App Store, Farm Tools Store, 교육 과정 데이터가 Firestore에 기준 데이터로 저장되어 관리됩니다.

## 자동 시딩

앱을 처음 실행하면 자동으로 데이터베이스 시딩이 진행됩니다:

1. `_system/seed_status` 문서를 확인
2. 시딩이 완료되지 않았으면 자동으로 초기 데이터 삽입
3. 시딩 완료 후 상태 저장

## Firestore 컬렉션 구조

### 1. farm_tools (6개 항목)
홈 화면에 표시되는 컬러풀한 도구 카드
```
{
  title: string
  desc: string
  iconType: string
  color: string
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### 2. store_apps (8개 항목)
Farm App Store의 앱 목록
```
{
  title: string
  desc: string
  iconType: string
  color: string
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### 3. farm_tools_store (12개 항목)
Farm Tools Store의 도구 목록
```
{
  title: string
  desc: string
  iconType: string
  color: string
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### 4. education_courses (6개 항목)
농업 교육 과정 목록
```
{
  id: string
  title: string
  description: string
  category: string
  duration: string
  level: string
  badge?: string
  badgeColor?: string
  iconType: string
  iconColor: string
  gradientFrom: string
  gradientTo: string
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### 5. users/{userId}/favorites (사용자별)
사용자별 즐겨찾기 목록
```
{
  createdAt: Date
}
```
문서 ID가 앱/도구의 ID

### 6. _system/seed_status
시딩 상태 추적
```
{
  completed: boolean
  timestamp: Date
  version: string
}
```

## 관리자 도구

개발 환경에서 브라우저 콘솔을 통해 관리 가능:

### 시딩 상태 확인
```javascript
await window.adminTools.checkSeedStatus()
```

### 데이터베이스 재시딩
```javascript
await window.adminTools.reseedDatabase()
```

## 데이터 수정 방법

### 1. 코드에서 수정
`src/data/initialData.ts` 또는 `src/data/educationData.ts` 파일 수정 후:

```javascript
// 브라우저 콘솔에서
await window.adminTools.reseedDatabase()
```

### 2. Firestore 콘솔에서 직접 수정
Firebase Console → Firestore Database에서 직접 수정 가능

## 성능 최적화

### 이전 방식 (느림)
- 매번 컬렉션이 비어있는지 확인
- 비어있으면 하나씩 순차적으로 addDoc 실행
- 네트워크 왕복 26회 (총 26개 항목)

### 현재 방식 (빠름)
- 앱 시작 시 한 번만 시딩 상태 확인
- 배치 쓰기로 한 번에 모든 데이터 삽입
- 이후엔 단순히 읽기만 수행
- orderBy로 정렬된 데이터 가져오기

## 즐겨찾기 기능

사용자별로 독립적으로 관리:
- 경로: `users/{userId}/favorites/{appId}`
- 로그인한 사용자만 사용 가능
- 실시간 동기화

## 문제 해결

### 데이터가 표시되지 않을 때
1. 브라우저 콘솔 확인
2. Firestore 규칙 확인
3. 시딩 상태 확인: `window.adminTools.checkSeedStatus()`
4. 필요시 재시딩: `window.adminTools.reseedDatabase()`

### 시딩이 실패할 때
- Firebase 인증 확인
- Firestore 규칙 확인 (쓰기 권한)
- 네트워크 연결 확인

## Firestore 보안 규칙 예시

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 기준 데이터는 모두 읽기 가능
    match /farm_tools/{document} {
      allow read: if true;
      allow write: if false; // 관리자만 수정 가능하도록 설정
    }
    
    match /store_apps/{document} {
      allow read: if true;
      allow write: if false;
    }
    
    match /farm_tools_store/{document} {
      allow read: if true;
      allow write: if false;
    }
    
    match /education_courses/{document} {
      allow read: if true;
      allow write: if false;
    }
    
    // 사용자별 즐겨찾기는 본인만 수정 가능
    match /users/{userId}/favorites/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 시스템 문서는 인증된 사용자만 읽기 가능
    match /_system/{document} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

## 마이그레이션

기존 데이터가 있는 경우:
1. 백업 생성 (Firebase Console)
2. `window.adminTools.reseedDatabase()` 실행
3. 데이터 확인

## 주의사항

- `reseedDatabase()`는 기존 데이터를 덮어쓰지 않고 추가합니다
- 중복 방지를 위해 기존 데이터 삭제 후 실행 권장
- 프로덕션 환경에서는 관리자 도구가 비활성화됩니다
