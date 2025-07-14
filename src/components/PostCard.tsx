import { useState } from "react";
import { Heart, MessageCircle, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "./RetroSection";

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: (comment: string) => void;
}

export const PostCard = ({ post, onLike, onComment }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  const handleComment = () => {
    if (newComment.trim()) {
      onComment(newComment);
      setNewComment("");
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  return (
    <div className="retro-card animate-fade-in">
      {/* 포스트 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="font-medium">{post.author}</span>
          <Clock className="h-4 w-4 ml-2" />
          <span>{formatTimeAgo(post.createdAt)}</span>
        </div>
      </div>

      {/* 포스트 내용 */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
        <p className="text-foreground leading-relaxed">{post.content}</p>
        {post.note && (
          <div className="mt-3 p-2 bg-muted rounded text-sm text-muted-foreground">
            <span className="font-medium">비고:</span> {post.note}
          </div>
        )}
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`gap-1 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{post.likes}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="gap-1 text-muted-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments.length}</span>
        </Button>
      </div>

      {/* 댓글 섹션 */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          {/* 기존 댓글들 */}
          {post.comments.map((comment) => (
            <div key={comment.id} className="bg-muted rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))}

          {/* 새 댓글 입력 */}
          <div className="flex gap-2">
            <Textarea
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none"
            />
            <Button
              onClick={handleComment}
              disabled={!newComment.trim()}
              size="sm"
            >
              등록
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};