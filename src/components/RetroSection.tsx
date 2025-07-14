import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "./PostCard";

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  note?: string;
  likes: number;
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

interface RetroSectionProps {
  type: 'keep' | 'problem' | 'try';
  title: string;
  posts: Post[];
  onAddPost: () => void;
  onLikePost: (postId: string) => void;
  onCommentPost: (postId: string, comment: string) => void;
}

const sectionConfig = {
  keep: {
    bgClass: 'keep-theme',
    headerClass: 'section-header-keep',
    description: '잘된 점을 기록해요'
  },
  problem: {
    bgClass: 'problem-theme',
    headerClass: 'section-header-problem', 
    description: '아쉬운 점을 돌아봐요'
  },
  try: {
    bgClass: 'try-theme',
    headerClass: 'section-header-try',
    description: '다음에 시도할 점을 계획해요'
  }
};

export const RetroSection = ({ 
  type, 
  title, 
  posts, 
  onAddPost, 
  onLikePost, 
  onCommentPost 
}: RetroSectionProps) => {
  const config = sectionConfig[type];

  return (
    <div className="flex-1 min-w-0">
      {/* 섹션 헤더 */}
      <div className={`${config.headerClass} rounded-t-lg p-4 flex items-center justify-between`}>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm opacity-90">{config.description}</p>
        </div>
        <Button
          onClick={onAddPost}
          size="sm"
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        >
          <Plus className="h-4 w-4 mr-1" />
          추가
        </Button>
      </div>

      {/* 포스트 목록 */}
      <div className={`${config.bgClass} min-h-[600px] p-4 rounded-b-lg space-y-3`}>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-lg mb-2">📝</div>
            <p>첫 번째 포스팅을 작성해보세요!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => onLikePost(post.id)}
              onComment={(comment) => onCommentPost(post.id, comment)}
            />
          ))
        )}
      </div>
    </div>
  );
};