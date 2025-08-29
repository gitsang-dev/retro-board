import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { ThumbsUp, MessageCircle, MoreVertical, Pencil, Trash2, User, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { useSupabase } from './SupabaseProvider'
import { useToast } from '../hooks/use-toast'
import { EditPostModal } from './EditPostModal'
import { CommentModal } from './CommentModal'
import type { Post } from './RetroSection'

interface LikeWithUser {
  users: {
    name: string
  }
}

interface PostCardProps {
  post: Post
  onLike: () => void
  onComment: (comment: string) => void
  onPostUpdated: () => void
}

export function PostCard({ post, onPostUpdated }: PostCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [commentsCount, setCommentsCount] = useState(0)
  const [likedUsers, setLikedUsers] = useState<{ name: string }[]>([])
  const [isHighlighted, setIsHighlighted] = useState(false)
  const { user, supabase } = useSupabase()
  const { toast } = useToast()
  const isAuthor = user?.id === post.authorId

  const highlightPost = () => {
    setIsHighlighted(true);
    setTimeout(() => setIsHighlighted(false), 2000); // 2초 후 하이라이트 제거
  };

  // 좋아요 상태 확인
  const checkLikeStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .match({ post_id: post.id, user_id: user.id })
        .maybeSingle()

      if (error) {
        console.error('Error checking like status:', error)
        return
      }

      setIsLiked(!!data)
    } catch (error) {
      console.error('Error in checkLikeStatus:', error)
    }
  }

  // 좋아요 수와 사용자 목록 가져오기
  const getLikesCount = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select(`
          users (
            name
          )
        `)
        .eq('post_id', post.id)
        .returns<LikeWithUser[]>()

      if (error) {
        console.error('Error getting likes:', error)
        return
      }

      if (!data) return

      const userNames = data
        .map(like => like.users?.name)
        .filter((name): name is string => !!name)

      setLikesCount(userNames.length)
      setLikedUsers(userNames.map(name => ({ name })))
    } catch (error) {
      console.error('Error in getLikesCount:', error)
    }
  }

  // 댓글 수 가져오기
  const getCommentsCount = async () => {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('post_id', post.id)

    if (error) {
      console.error('Error getting comments count:', error)
      return
    }

    setCommentsCount(count || 0)
  }

  // 댓글이 추가/수정/삭제될 때 호출되는 핸들러
  const handleCommentChange = async () => {
    await getCommentsCount()
    onPostUpdated()
  }

  useEffect(() => {
    // 댓글 모달 열기 이벤트 리스너 추가
    const handleOpenComments = () => {
      setIsCommentModalOpen(true);
    };
    const handleHighlight = () => {
      highlightPost();
    };
    const element = document.querySelector(`[data-post-id="${post.id}"]`);
    element?.addEventListener('openComments', handleOpenComments);
    element?.addEventListener('highlight', handleHighlight);

    checkLikeStatus()
    getLikesCount()
    getCommentsCount()

    // 실시간 좋아요 업데이트를 위한 구독
    const likesChannel = supabase
      .channel('likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${post.id}`
        },
        () => {
          getLikesCount()
          checkLikeStatus()
        }
      )
      .subscribe()

    // 실시간 댓글 업데이트를 위한 구독
    const commentsChannel = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${post.id}`
        },
        () => {
          getCommentsCount()
        }
      )
      .subscribe()

    return () => {
      likesChannel.unsubscribe()
      commentsChannel.unsubscribe()
      // 이벤트 리스너 제거
      const element = document.querySelector(`[data-post-id="${post.id}"]`);
      element?.removeEventListener('openComments', handleOpenComments);
      element?.removeEventListener('highlight', handleHighlight);
    }
  }, [post.id, user?.id])

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 포스트를 삭제하시겠습니까?')) {
      return
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)

    if (error) {
      toast({
        title: '삭제 실패',
        description: '포스트 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: '삭제 완료',
      description: '포스트가 삭제되었습니다.',
    })
    onPostUpdated()
  }

  const handleLike = async () => {
    if (!user) {
      toast({
        title: '로그인 필요',
        description: '좋아요를 누르려면 로그인이 필요합니다.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (isLiked) {
        // 좋아요 취소
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ post_id: post.id, user_id: user.id })

        if (error) {
          console.error('Error removing like:', error)
          throw error
        }

        // 성공적으로 삭제된 경우에만 상태 업데이트
        setIsLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
        setLikedUsers(prev => prev.filter(u => u.name !== user?.user_metadata?.name))
      } else {
        // 좋아요 추가
        const { error: likeError } = await supabase
          .from('likes')
          .insert([{
            post_id: post.id,
            user_id: user.id
          }])

        if (likeError) {
          console.error('Error adding like:', likeError)
          throw likeError
        }

        // 알림 생성 (자신의 게시물이 아닌 경우에만)
        if (post.authorId !== user.id) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert([{
              recipient_id: post.authorId,
              sender_id: user.id,
              post_id: post.id,
              type: 'like',
              content: null,
              is_read: false
            }])

          if (notificationError) {
            console.error('Error creating notification:', notificationError)
            // 알림 생성 실패는 좋아요 기능에 영향을 주지 않도록 함
          }
        }

        // 성공적으로 추가된 경우에만 상태 업데이트
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
        setLikedUsers(prev => [
          ...prev,
          { name: user?.user_metadata?.name || 'Unknown' }
        ])
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast({
        title: '오류 발생',
        description: '좋아요 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      })
    }
  }

  // 시간 차이를 계산하는 함수
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}시간 전`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}일 전`
    
    return date.toLocaleDateString()
  }

  return (
    <Card 
      className={cn(
        "bg-white transition-all duration-300",
        isHighlighted && "ring-2 ring-blue-500 ring-offset-2"
      )} 
      data-post-id={post.id}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {getTimeAgo(post.createdAt)}
          </div>
          {isAuthor && (
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <h3 className="text-lg font-medium mb-2">{post.title}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
        {post.note && (
          <div className="mt-3 text-sm bg-slate-100 p-3 rounded">
            {post.note}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLike}
                    className={`h-8 px-2 hover:text-foreground ${isLiked ? 'text-blue-500' : 'text-muted-foreground'}`}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {likesCount}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <div className="text-sm py-1">
                  {likedUsers.length > 0 ? (
                    likedUsers.map((user, index) => (
                      <div key={index} className="px-2">{user.name}</div>
                    ))
                  ) : (
                    <div className="px-2">아직 좋아요가 없습니다</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsCommentModalOpen(true)}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {commentsCount}
          </Button>
        </div>
      </CardContent>

      {isAuthor && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={post}
          onSuccess={onPostUpdated}
        />
      )}

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        postId={post.id}
        onCommentAdded={handleCommentChange}
      />
    </Card>
  )
}