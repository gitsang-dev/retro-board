import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "./PostCard";
import { useState } from "react";
import { CreatePostModal } from "./CreatePostModal";
import type { Section } from "../types/post";

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
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
  title: React.ReactNode;
  subtitle: string;
  color: string;
  headerColor: string;
  textColor: string;
  type?: Section;
  posts?: Post[];
  onPostCreated?: () => void;
  onLikePost?: (postId: string) => void;
  onCommentPost?: (postId: string, comment: string) => void;
  onPostUpdated?: () => void;
}

export const RetroSection = ({ 
  title, 
  subtitle,
  color,
  headerColor,
  textColor,
  type = 'keep',
  posts = [],
  onPostCreated = () => {},
  onLikePost = () => {},
  onCommentPost = () => {},
  onPostUpdated = () => {}
}: RetroSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 min-w-0">
      {/* 섹션 헤더 */}
      <div className={`${headerColor} rounded-t-lg p-4 flex items-center justify-between`}>
        <div>
          <h2 className={`text-xl font-bold ${textColor}`}>{title}</h2>
          <p className={`text-sm opacity-90 ${textColor}`}>{subtitle}</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        >
          <Plus className="h-4 w-4 mr-1" />
          추가
        </Button>
      </div>

      {/* 포스트 목록 */}
      <div className={`${color} min-h-[600px] p-4 rounded-b-lg space-y-3`}>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <img 
              src="/write.png" 
              alt="Write" 
              className="w-10 h-10 mx-auto opacity-50 mb-2"
            />
            <p>첫 번째 포스팅을 작성해보세요!</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              postNumber={posts.length - index}
              onLike={() => onLikePost(post.id)}
              onComment={(comment) => onCommentPost(post.id, comment)}
              onPostUpdated={onPostUpdated}
            />
          ))
        )}
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={type}
        onSuccess={onPostCreated}
      />
    </div>
  );
};