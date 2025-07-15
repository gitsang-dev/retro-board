import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { useToast } from '../hooks/use-toast'
import { useSupabase } from './SupabaseProvider'
import { supabase } from '@/lib/supabase'
import type { Section } from '../types/post'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  section: Section
  onSuccess?: () => void
}

const sectionConfig = {
  keep: {
    title: 'Keep 추가하기',
    titlePlaceholder: '간단하게 적어주세요 (예시 : 매일밤 합심 기도회)',
    contentPlaceholder: '왜, 어떤 점이 좋다고 느꼈는지 구체적으로 적어주세요',
  },
  problem: {
    title: 'Problem 추가하기',
    titlePlaceholder: '간단하게 적어주세요 (예시 : 지역단위 가족모임의 한계)',
    contentPlaceholder: '왜, 어떤 점이 아쉽다고 느꼈는지 구체적으로 적어주세요',
  },
  try: {
    title: 'Try 추가하기',
    titlePlaceholder: '간단하게 적어주세요 (예시 : 주일 오후예배 나눔방식 변경)',
    contentPlaceholder: '왜 이렇게 생각했고, 어떻게 시도해보면 좋을지 구체적으로 적어주세요',
  },
}

export function CreatePostModal({ isOpen, onClose, section, onSuccess }: CreatePostModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useSupabase()
  const { toast } = useToast()
  const config = sectionConfig[section]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: '로그인이 필요합니다.',
        description: '포스트를 작성하려면 먼저 로그인해주세요.',
        variant: 'destructive',
      })
      return
    }

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
      const { error } = await supabase.from('posts').insert({
        section,
        title: title.trim(),
        content: content.trim(),
        note: note.trim() || null,
        author_id: user.id,
      })

      if (error) throw error

      toast({
        title: '성공',
        description: '포스트가 저장되었습니다.',
      })

      onSuccess?.()
      onClose()
      setTitle('')
      setContent('')
      setNote('')
    } catch (error) {
      console.error('Error saving post:', error)
      toast({
        title: '저장 실패',
        description: '포스트 저장 중 오류가 발생했습니다.',
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
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={config.titlePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={config.contentPlaceholder}
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