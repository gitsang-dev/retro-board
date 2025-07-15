import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { useToast } from '../hooks/use-toast'
import { supabase } from '@/lib/supabase'
import type { Post } from './RetroSection'

interface EditPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: Post
  onSuccess?: () => void
}

export function EditPostModal({ isOpen, onClose, post, onSuccess }: EditPostModalProps) {
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)
  const [note, setNote] = useState(post.note || '')
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast({
        title: '입력 오류',
        description: '제목과 내용을 모두 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: title.trim(),
          content: content.trim(),
          note: note.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id)

      if (error) throw error

      toast({
        title: '성공',
        description: '포스트가 수정되었습니다.',
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error updating post:', error)
      toast({
        title: '수정 실패',
        description: '포스트 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>포스트 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">비고</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="비고를 입력하세요 (선택사항)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 