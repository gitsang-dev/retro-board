# 🔐 Authentication Structure

## 인증 방식

### 1. 이메일/비밀번호 인증
- 회원가입
  - 이메일 주소 검증
  - 비밀번호 복잡도 검증
  - 이메일 인증 링크 발송
- 로그인
  - 이메일/비밀번호 로그인
  - 비밀번호 재설정
  - 로그인 시도 제한 (5회/30분)

### 2. 소셜 로그인
#### Google OAuth
- Client ID 및 Secret 설정
- 요청 권한:
  - email
  - profile
  - openid
- 프로필 정보 매핑:
  - email -> users.email
  - name -> users.name
  - picture -> users.avatar_url

#### Kakao OAuth
- REST API 키 설정
- 요청 권한:
  - profile_nickname
  - profile_image
  - account_email
- 프로필 정보 매핑:
  - account_email -> users.email
  - profile_nickname -> users.name
  - profile_image -> users.avatar_url

## 세션 관리
- JWT 토큰 사용
  - Access Token (2시간)
  - Refresh Token (2주)
- 토큰 저장:
  - 클라이언트: httpOnly 쿠키
  - 서버: Redis

## 보안 설정
1. 비밀번호 정책
   - 최소 8자
   - 대소문자 포함
   - 숫자 포함
   - 특수문자 포함

2. 세션 보안
   - CSRF 토큰 사용
   - 동시 로그인 제한
   - IP 기반 세션 검증

3. OAuth 보안
   - 상태 토큰 검증
   - Redirect URI 화이트리스트
   - 프로필 정보 암호화

## 에러 처리
- 인증 실패 로깅
- 비정상 접근 차단
- 사용자 친화적 에러 메시지
