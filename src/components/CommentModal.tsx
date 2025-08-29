import { useState, useEffect } from 'react'
import { MentionInput } from './MentionInput'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSupabase } from './SupabaseProvider'
import { useToast } from '../hooks/use-toast'
import { User, MoreVertical, Pencil, Trash2, ThumbsUp } from 'lucide-react'
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

interface LikeWithUser {
  comment_id: string
  users: {
    name: string
  }
}

interface Comment {
  id: string
  content: string
  user_id: string
  created_at: string
  author: string
  likes_count: number
  liked_users?: { name: string }[]
}

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  onCommentAdded: () => void
}

export function CommentModal({ isOpen, onClose, postId, onCommentAdded }: CommentModalProps) {
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({})
  const { user, supabase } = useSupabase()
  const { toast } = useToast()

  // 댓글 좋아요 상태 확인
  const checkLikeStatus = async () => {
    if (!user || comments.length === 0) return

    try {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', user.id)
      .in('comment_id', comments.map(c => c.id))

    if (error) {
      console.error('Error checking like status:', error)
      return
    }

      if (!data) return

    const likedStatus = data.reduce((acc, like) => ({
      ...acc,
      [like.comment_id]: true
    }), {})

    setLikedComments(likedStatus)
    } catch (error) {
      console.error('Error in checkLikeStatus:', error)
    }
  }

  // 댓글 좋아요 처리
  const handleLike = async (commentId: string) => {
    if (!user) {
      toast({
        title: '로그인 필요',
        description: '좋아요를 누르려면 로그인이 필요합니다.',
        variant: 'destructive',
      })
      return
    }

    const isLiked = likedComments[commentId]

    try {
      if (isLiked) {
        // 좋아요 취소
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .match({ comment_id: commentId, user_id: user.id })

        if (error) {
          console.error('Error removing like:', error)
          throw error
        }

        // 성공적으로 삭제된 경우에만 상태 업데이트
        setLikedComments(prev => ({
          ...prev,
          [commentId]: false
        }))
        setComments(prev => prev.map(comment => 
          comment.id === commentId
            ? { 
                ...comment, 
                likes_count: Math.max(0, comment.likes_count - 1),
                liked_users: comment.liked_users?.filter(u => u.name !== user?.user_metadata?.name) || []
              }
            : comment
        ))
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('comment_likes')
          .insert([{
            comment_id: commentId,
            user_id: user.id
          }])

        if (error) {
          console.error('Error adding like:', error)
          throw error
      }

        // 성공적으로 추가된 경우에만 상태 업데이트
      setLikedComments(prev => ({
        ...prev,
          [commentId]: true
      }))
      setComments(prev => prev.map(comment => 
        comment.id === commentId
            ? { 
                ...comment, 
                likes_count: comment.likes_count + 1,
                liked_users: [
                  ...(comment.liked_users || []),
                  { name: user?.user_metadata?.name || 'Unknown' }
                ]
              }
          : comment
      ))
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

  // 댓글 목록 불러오기
  const loadComments = async () => {
    try {
      // 댓글 기본 정보와 좋아요 수를 가져옵니다
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        users (
          name
        ),
          comment_likes (
            user_id,
            users (
              name
            )
          )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (commentsError) {
      console.error('Error loading comments:', commentsError)
        toast({
          title: '댓글 로딩 실패',
          description: '댓글을 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      return
    }

      if (!commentsData) return

      // 댓글 정보를 가공합니다
      const processedComments = commentsData.map(comment => {
        const likes = comment.comment_likes || []
        const likedUsers = likes.map(like => ({
          name: like.users?.name || 'Unknown'
        }))

        return {
      ...comment,
      author: comment.users?.name || 'Unknown',
          likes_count: likes.length,
          liked_users: likedUsers
        }
      })

      setComments(processedComments)

      // 현재 사용자의 좋아요 상태를 설정합니다
    if (user) {
        const likedStatus = processedComments.reduce((acc, comment) => ({
          ...acc,
          [comment.id]: (comment.comment_likes || []).some(like => like.user_id === user.id)
        }), {})
        setLikedComments(likedStatus)
      }
    } catch (error) {
      console.error('Error in loadComments:', error)
      toast({
        title: '오류 발생',
        description: '댓글을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 댓글 작성
  const handleSubmit = async () => {
    if (!newComment.trim()) return

    try {
      // 댓글 작성
      const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user?.id,
        content: newComment.trim()
      })
        .select()
        .single()

      if (commentError) {
      toast({
        title: '댓글 작성 실패',
        description: '댓글을 작성하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
      return
    }

      // 포스트 작성자에게 알림 생성 (자신의 포스트에는 알림 생성 안 함)
      const { data: postData } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single()

      if (postData && postData.author_id !== user?.id) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            recipient_id: postData.author_id,
            sender_id: user?.id,
            post_id: postId,
            type: 'comment',
            content: newComment.trim(),
            is_read: false
          })

        if (notificationError) {
          console.error('Error creating comment notification:', notificationError)
        }
      }

    setNewComment('')
    await loadComments()
    onCommentAdded()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast({
        title: '오류 발생',
        description: '댓글 작성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 댓글 수정
  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    const { error } = await supabase
      .from('comments')
      .update({ content: editContent.trim() })
      .eq('id', commentId)

    if (error) {
      toast({
        title: '댓글 수정 실패',
        description: '댓글을 수정하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
      return
    }

    setEditingComment(null)
    await loadComments()
    onCommentAdded()
  }

  // 댓글 삭제
  const handleDelete = async (commentId: string) => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      toast({
        title: '댓글 삭제 실패',
        description: '댓글을 삭제하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
      return
    }

    await loadComments()
    onCommentAdded()
  }

  // 모달이 열릴 때 댓글 목록 불러오기
  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [isOpen])

  // 실시간 업데이트를 위한 구독
  useEffect(() => {
    if (!isOpen) return

    const commentsChannel = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          loadComments()
          onCommentAdded()
        }
      )
      .subscribe()

    const likesChannel = supabase
      .channel('comment_likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_likes'
        },
        () => {
          loadComments()
        }
      )
      .subscribe()

    return () => {
      commentsChannel.unsubscribe()
      likesChannel.unsubscribe()
    }
  }, [isOpen, postId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[425px]"
        aria-describedby="comment-modal-description"
      >
        <div id="comment-modal-description" className="sr-only">
          댓글을 작성하고 관리하는 모달입니다.
        </div>
        <DialogHeader>
          <DialogTitle>댓글</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>{comment.author}</span>
                  </div>
                  {user?.id === comment.user_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingComment(comment.id)
                            setEditContent(comment.content)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(comment.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {editingComment === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingComment(null)}
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEdit(comment.id)}
                      >
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap mb-2">
                      {comment.content.split(/(@[^\s]+)/).map((part, index) => {
                        if (part.startsWith('@')) {
                          return <span key={index} className="text-blue-500 hover:underline">{part}</span>
                        }
                        return part
                      })}
                    </p>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(comment.id)}
                                className={`h-6 px-2 hover:text-foreground ${
                                  likedComments[comment.id] ? 'text-blue-500' : 'text-gray-500'
                                }`}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {comment.likes_count || 0}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">
                            <div className="text-sm py-1">
                              {comment.liked_users && comment.liked_users.length > 0 ? (
                                comment.liked_users.map((user, index) => (
                                  <div key={index} className="px-2">{user.name}</div>
                                ))
                              ) : (
                                <div className="px-2">아직 좋아요가 없습니다</div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 댓글 작성 */}
          <div className="space-y-2">
            <MentionInput
              value={newComment}
              onChange={setNewComment}
              onMention={async (userId) => {
                if (!user) {
                  toast({
                    title: '로그인 필요',
                    description: '멘션하려면 로그인이 필요합니다.',
                    variant: 'destructive',
                  })
                  return
                }

                try {
                  // 멘션된 사용자 정보 가져오기
                  const { data: userData, error: userError } = await supabase
                    .from('profiles')  // users 대신 profiles 테이블 사용
                    .select('name')
                    .eq('id', userId)
                    .single()

                  if (userError) {
                    console.error('Error fetching user data:', userError)
                    throw userError
                  }

                  // 현재 사용자 정보 가져오기
                  const { data: currentUserData, error: currentUserError } = await supabase
                    .from('profiles')  // users 대신 profiles 테이블 사용
                    .select('name')
                    .eq('id', user.id)
                    .single()

                  if (currentUserError) {
                    console.error('Error fetching current user data:', currentUserError)
                    throw currentUserError
                  }

                  // 멘션 알림 생성
                  const { data: notificationData, error: notificationError } = await supabase
                    .from('notifications')
                    .insert({
                      recipient_id: userId,
                      sender_id: user.id,
                      post_id: postId,
                      type: 'mention',
                      content: newComment.trim(),
                      is_read: false
                    })
                    .select()
                    .single()

                  if (notificationError) {
                    console.error('Error creating mention notification:', notificationError)
                    throw notificationError
                  }

                  toast({
                    title: '멘션 완료',
                    description: `${userData.name}님을 멘션했습니다.`,
                  })
                } catch (error: any) {
                  console.error('Error in onMention:', error)
                  toast({
                    title: '알림 생성 실패',
                    description: error.message || '멘션 알림을 생성하는 중 오류가 발생했습니다.',
                    variant: 'destructive',
                  })
                }
              }}
              placeholder="댓글을 작성하세요... (@를 입력하여 멘션)"
              className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmit}>댓글 작성</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 