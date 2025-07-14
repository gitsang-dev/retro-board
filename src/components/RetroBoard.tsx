import { useState } from "react";
import { RotateCcw, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RetroSection, Post } from "./RetroSection";

export const RetroBoard = () => {
  const [sortBy, setSortBy] = useState<'recent' | 'likes'>('recent');
  
  // 임시 데이터 (나중에 Supabase로 대체)
  const [posts, setPosts] = useState<{
    keep: Post[];
    problem: Post[];
    try: Post[];
  }>({
    keep: [
      {
        id: '1',
        title: '팀 커뮤니케이션이 활발했음',
        content: '매일 스탠드업 미팅을 통해 서로의 진행상황을 공유하고, 막히는 부분에 대해 빠르게 도움을 받을 수 있었습니다. 특히 슬랙을 통한 비동기 소통도 효과적이었어요.',
        author: '김개발',
        note: '다음 스프린트에도 계속 유지하면 좋을 것 같아요',
        likes: 5,
        comments: [
          {
            id: 'c1',
            author: '박디자인',
            content: '정말 동감해요! 소통이 원활해서 프로젝트가 순조롭게 진행된 것 같아요.',
            createdAt: new Date(Date.now() - 30 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ],
    problem: [
      {
        id: '2',
        title: '코드 리뷰 시간이 부족했음',
        content: '일정에 쫓겨서 코드 리뷰를 충분히 하지 못했습니다. 그 결과 일부 버그가 프로덕션까지 올라가게 되었어요.',
        author: '이백엔드',
        likes: 3,
        comments: [],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ],
    try: [
      {
        id: '3',
        title: '페어 프로그래밍 도입해보기',
        content: '복잡한 기능 개발 시 페어 프로그래밍을 통해 코드 품질을 높이고 지식 공유도 함께 해보면 어떨까요?',
        author: '최프론트',
        note: '일주일에 2-3시간 정도 시범 운영',
        likes: 7,
        comments: [],
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ]
  });

  const handleAddPost = (section: 'keep' | 'problem' | 'try') => {
    // TODO: 포스트 작성 모달 열기
    console.log(`Add post to ${section}`);
  };

  const handleLikePost = (postId: string) => {
    // TODO: 좋아요 토글 로직
    console.log(`Like post ${postId}`);
  };

  const handleCommentPost = (postId: string, comment: string) => {
    // TODO: 댓글 추가 로직
    console.log(`Comment on post ${postId}: ${comment}`);
  };

  const getSortedPosts = (sectionPosts: Post[]) => {
    return [...sectionPosts].sort((a, b) => {
      if (sortBy === 'likes') {
        return b.likes - a.likes;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">RetroBoard</h1>
              <p className="text-sm text-muted-foreground">팀 회고를 통해 함께 성장해요</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'recent' | 'likes')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">최신순</SelectItem>
                <SelectItem value="likes">좋아요순</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              로그인
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RetroSection
            type="keep"
            title="Keep"
            posts={getSortedPosts(posts.keep)}
            onAddPost={() => handleAddPost('keep')}
            onLikePost={handleLikePost}
            onCommentPost={handleCommentPost}
          />
          
          <RetroSection
            type="problem"
            title="Problem"
            posts={getSortedPosts(posts.problem)}
            onAddPost={() => handleAddPost('problem')}
            onLikePost={handleLikePost}
            onCommentPost={handleCommentPost}
          />
          
          <RetroSection
            type="try"
            title="Try"
            posts={getSortedPosts(posts.try)}
            onAddPost={() => handleAddPost('try')}
            onLikePost={handleLikePost}
            onCommentPost={handleCommentPost}
          />
        </div>
      </main>
    </div>
  );
};