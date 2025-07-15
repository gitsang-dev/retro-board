import { useState, useEffect } from 'react'
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
import { User, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface Comment {
  id: string
  content: string
  user_id: string
  created_at: string
  author: string
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
  const { user, supabase } = useSupabase()
  const { toast } = useToast()

  // 댓글 목록 불러오기
  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users (
          name
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading comments:', error)
      return
    }

    setComments(data.map(comment => ({
      ...comment,
      author: comment.users?.name || 'Unknown'
    })))
  }

  // 댓글 작성
  const handleSubmit = async () => {
    if (!newComment.trim()) return

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user?.id,
        content: newComment.trim()
      })

    if (error) {
      toast({
        title: '댓글 작성 실패',
        description: '댓글을 작성하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
      return
    }

    setNewComment('')
    await loadComments()
    onCommentAdded()
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

  // 실시간 댓글 업데이트를 위한 구독
  useEffect(() => {
    if (!isOpen) return

    const channel = supabase
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

    return () => {
      channel.unsubscribe()
    }
  }, [isOpen, postId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            ))}
          </div>

          {/* 댓글 작성 */}
          <div className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성하세요..."
              className="min-h-[60px]"
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