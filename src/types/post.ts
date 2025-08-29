export type Section = 'keep' | 'problem' | 'try'

export interface Post {
  id: string
  section: Section
  title: string
  content: string
  note?: string
  author_id: string
  created_at: string
  updated_at: string
  likes?: { id: string }[]
  likes_count?: number
  comments_count: number
  users?: {
    name: string
  }
}

export interface CreatePostInput {
  section: Section
  title: string
  content: string
  note?: string
} 