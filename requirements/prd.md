📘 Product Requirements Document (PRD)

🧾 제품명
RetroBoard (가칭)

⸻

🧭 목표 (Goal)
팀 또는 개인이 Keep / Problem / Try 섹션에 회고를 포스팅하고, 카카오톡 로그인 기반으로 사용자 인증을 하며, 서로의 포스팅에 좋아요와 댓글로 리액션할 수 있는 회고용 웹 애플리케이션을 만든다. 줌의 화이트보드 기능처럼 시각적으로 정돈된 UI를 지향한다.

⸻

🎯 주요 기능 (Key Features)
	1.	🔐 로그인
 • 카카오톡 OAuth를 통한 소셜 로그인
 • 구글 OAuth를 통한 소셜 로그인 추가
 • 이메일/비밀번호 로그인 추가
 • 로그인한 사용자만 포스팅 작성 및 리액션 가능
 • 로그인 시 사용자 이름(닉네임), 프로필 이미지 저장
 → 상세 인증 구조: [auth.md](./auth.md)

⸻

	2.	🗂 회고 섹션 구성 (Retro Sections)
 • 세 가지 회고 영역:
  • Keep: 잘된 점
  • Problem: 아쉬운 점
  • Try: 다음에 시도할 점
 • 각 섹션 아래에 포스팅 카드들이 목록으로 정렬됨
     (기본: 최신순, 옵션: 좋아요순)
 → 데이터 구조: [database.md](./database.md)

⸻

	3.	📝 포스팅 작성
 • 각 섹션 내에 포스팅 등록 버튼
 • 작성 폼:
  • 작성자 이름 (디폴트: 로그인 사용자 이름)
  • 제목 (필수)
  • 내용 (필수)
  • 비고 (선택)
  • 첨부 파일 지원
 • 등록 시 자동으로 해당 섹션 하단에 추가
 → 첨부 파일 저장소: [storage.md](./storage.md)

⸻

	4.	💬 리액션 기능
 • 각 포스팅에 대해:
  • 좋아요 버튼 (누르면 숫자 증가, 다시 누르면 취소)
  • 댓글 달기 (작성자명 + 내용)
  • 좋아요 수에 따라 정렬 기능 제공
 • 실시간 업데이트:
  • 좋아요 수 변경
  • 새 댓글 알림
  • 사용자 활동 상태
 → 실시간 기능: [realtimeDB.md](./realtimeDB.md)

⸻

	5.	🔍 정렬 및 필터 기능
 • 포스팅 리스트 정렬 옵션:
  • 기본: 최신순
  • 옵션: 좋아요순
 • 실시간 검색 기능
 → 실시간 검색: [realtimeDB.md](./realtimeDB.md)

⸻

⚙️ 기술 스택
	•	프론트엔드: React, Tailwind CSS, Zustand (상태관리)
	•	백엔드: Supabase
	  - Database: PostgreSQL
	  - Auth: Supabase Auth + OAuth (Kakao, Google)
	  - Storage: Supabase Storage
	  - Realtime: Supabase Realtime
	•	배포: Vercel

⸻

📚 기술 문서
• [database.md](./database.md) - 메인 데이터베이스 구조
• [realtimeDB.md](./realtimeDB.md) - 실시간 데이터베이스 구조
• [storage.md](./storage.md) - 파일 저장소 구조
• [auth.md](./auth.md) - 인증 시스템 구조
