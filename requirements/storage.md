# 📦 Storage Structure

## 저장소 구조

### 1. 프로필 이미지
- 경로: `/profiles/{user_id}/avatar.{ext}`
- 허용 포맷: jpg, png, webp
- 최대 크기: 2MB
- 자동 리사이징: 200x200px

### 2. 포스트 첨부 파일
- 경로: `/posts/{post_id}/attachments/{file_id}.{ext}`
- 허용 포맷: 
  - 이미지: jpg, png, webp, gif
  - 문서: pdf, doc, docx
  - 기타: txt, md
- 최대 크기: 10MB
- 이미지 자동 리사이징: 1200px (max-width)

### 3. 임시 파일
- 경로: `/temp/{user_id}/{timestamp}_{filename}`
- 보관 기간: 24시간
- 업로드 완료 후 자동 삭제

## 접근 규칙
1. 프로필 이미지
   - 읽기: 공개
   - 쓰기: 해당 사용자만

2. 포스트 첨부 파일
   - 읽기: 인증된 사용자
   - 쓰기: 포스트 작성자만

3. 임시 파일
   - 읽기/쓰기: 업로드한 사용자만

## 보안 설정
- CORS 설정: 허용된 도메인만
- 최대 업로드 크기 제한
- 파일 타입 검증
- 악성코드 스캔

## 백업 정책
- 일일 증분 백업
- 주간 전체 백업
- 30일 보관
