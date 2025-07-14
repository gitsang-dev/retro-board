# 📊 Database Structure

## 테이블 구조

### 1. users
- `id`: uuid (PK)
- `email`: string
- `name`: string
- `avatar_url`: string
- `created_at`: timestamp
- `last_login`: timestamp
- `provider`: string (google, kakao)

### 2. posts
- `id`: uuid (PK)
- `section`: enum ('keep', 'problem', 'try')
- `title`: string
- `content`: text
- `note`: text (nullable)
- `author_id`: uuid (FK -> users.id)
- `created_at`: timestamp
- `updated_at`: timestamp
- `likes_count`: integer
- `comments_count`: integer

### 3. likes
- `id`: uuid (PK)
- `post_id`: uuid (FK -> posts.id)
- `user_id`: uuid (FK -> users.id)
- `created_at`: timestamp
- Unique constraint: (post_id, user_id)

### 4. comments
- `id`: uuid (PK)
- `post_id`: uuid (FK -> posts.id)
- `user_id`: uuid (FK -> users.id)
- `content`: text
- `created_at`: timestamp
- `updated_at`: timestamp

## 인덱스
- users: email (unique)
- posts: section, created_at
- likes: (post_id, user_id)
- comments: post_id, created_at

## 관계
- users -> posts: 1:N
- users -> likes: 1:N
- users -> comments: 1:N
- posts -> likes: 1:N
- posts -> comments: 1:N

## 보안 규칙
- 인증된 사용자만 posts, likes, comments 테이블에 쓰기 가능
- 모든 사용자가 읽기 가능
- 작성자만 자신의 post 수정/삭제 가능
- 댓글 작성자만 자신의 댓글 수정/삭제 가능
