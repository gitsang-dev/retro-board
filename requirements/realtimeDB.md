# 🔄 Realtime Database Structure

## 실시간 업데이트가 필요한 데이터

### 1. post_activities
```json
{
  "post_activities": {
    "post_id": {
      "likes_count": number,
      "comments_count": number,
      "last_activity": timestamp,
      "active_users": {
        "user_id": {
          "name": string,
          "avatar_url": string,
          "last_active": timestamp
        }
      }
    }
  }
}
```

### 2. user_presence
```json
{
  "user_presence": {
    "user_id": {
      "online": boolean,
      "last_seen": timestamp,
      "current_section": string
    }
  }
}
```

## 실시간 이벤트
1. 좋아요 수 변경
2. 댓글 수 변경
3. 새 포스트 알림
4. 사용자 온라인 상태

## 구독 규칙
- 포스트 활동: 섹션별 구독
- 사용자 상태: 현재 활성 사용자만 구독
- 새 포스트: 섹션별 구독

## 보안 규칙
- 인증된 사용자만 읽기/쓰기 가능
- presence 데이터는 자신의 상태만 업데이트 가능
- 활동 데이터는 해당 포스트 참여자만 업데이트 가능
