# TodayFlow

Supabase-first 오늘 할 일 + 달력 기반 투두 앱입니다.

## Build Story (2026-02-03)

2026년 2월 3일(OpenAI Codex 출시 타이밍)에 맞춰, 아이디어 단계부터 배포 가능한 코드 구조까지 A-Z로 제작한 예시 프로젝트입니다.

- A. 아이디어 정의: "오늘 할 일 + 캘린더" 서비스 컨셉 확정
- B. 초기 설계: Next.js App Router + TypeScript + Tailwind 구조 설계
- C. UI 구현: 빠른 추가, 오늘/선택 날짜 목록, 월간 캘린더 구현
- D. UX 개선: 정보 위계/가독성/빈 상태/피드백 메시지 개선
- E. 데이터 전환: 로컬 스토리지 기반에서 Supabase-first 구조로 리팩터링
- F. DB 모델링: `public.tasks` 테이블, 인덱스, 트리거, soft delete(`delete_flag`) 구성
- G. 운영 고려: 환경변수 분리, 민감정보 ignore, GitHub 업로드 가능한 상태 정리

즉, "기획 → 개발 → 데이터 연동 → 저장소 공개"까지 Codex와 함께 끝까지 진행한 실제 워크플로우입니다.

## 현재 아키텍처

- Frontend: Next.js(App Router) + TypeScript + Tailwind
- Data: `@supabase/supabase-js`로 클라이언트에서 직접 CRUD
- Table: `public.tasks` (SQL: `supabase/tasks.sql`)

## 빠른 시작

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase 세팅 (필수)

1. Supabase Dashboard > SQL Editor에서 `supabase/tasks.sql` 실행
2. 기존에 `tasks`를 먼저 만들었다면 `supabase/tasks_soft_delete_migration.sql`도 실행
3. Dashboard > Project Settings > API에서 URL/anon(publishable) key 복사
4. `.env.local`에 입력

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
```

## 주의사항

- 현재 `tasks.sql`은 MVP용으로 익명 CRUD 정책을 열어둡니다.
- 삭제는 hard delete 대신 `delete_flag='Y'`로 soft delete 처리됩니다.
- 실제 서비스 전환 시에는 Supabase Auth + 사용자별 RLS 정책으로 바꾸는 것을 권장합니다.

## 다음 확장 추천

1. Supabase Auth 연동 후 사용자별 데이터 분리
2. Realtime 구독으로 다중 탭/협업 동기화
3. 팀 공유 캘린더/알림(슬랙, 이메일)
