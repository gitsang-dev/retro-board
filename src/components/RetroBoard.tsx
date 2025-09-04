import { useState, useEffect, useMemo } from 'react'
import { RetroSection } from './RetroSection'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useMobile } from '@/hooks/use-mobile'
import { useSupabase } from './SupabaseProvider'
import type { Post as UIPost } from './RetroSection'
import type { Post as DBPost } from '../types/post'

export function RetroBoard() {
  const isMobile = useMobile()
  const { supabase } = useSupabase()
  const [sortBy, setSortBy] = useState<'latest' | 'likes'>('latest')
  const [rawPosts, setRawPosts] = useState<DBPost[]>([])

  // 포스트 데이터를 가공하고 정렬하는 로직
  const processedPosts = useMemo(() => {
    // 1. 섹션별로 포스트 그룹화
    const postsBySection = rawPosts.reduce((acc, post) => {
      if (!acc[post.section]) {
        acc[post.section] = [];
      }
      acc[post.section].push(post);
      return acc;
    }, {} as Record<Section, DBPost[]>);

    // 2. 각 섹션별로 생성 시간순 정렬 및 넘버링
    const numberedPosts = rawPosts.map(post => {
      // 해당 섹션의 포스트들을 생성 시간순으로 정렬
      const sectionPosts = postsBySection[post.section].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      // 현재 포스트의 순서 찾기 (오래된 순서대로 1, 2, 3...)
      const postNumber = sectionPosts.findIndex(p => p.id === post.id) + 1;
      
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.users?.name || 'Unknown',
        authorId: post.author_id,
        note: post.note,
        likes: post.likes_count || 0,
        comments: [],
        createdAt: new Date(post.created_at),
        section: post.section,
        postNumber // 섹션별 독립적인 넘버링
      };
    })

    // 3. 정렬 함수 정의
    const sortPosts = (posts: typeof numberedPosts) => {
      return [...posts].sort((a, b) => {
        if (sortBy === 'likes') {
          // 좋아요 수로 정렬 (내림차순)
          const likeDiff = b.likes - a.likes
          if (likeDiff !== 0) return likeDiff
          // 좋아요 수가 같으면 최신순으로 정렬
          return b.createdAt.getTime() - a.createdAt.getTime()
        } else {
          // 최신순 정렬
          return b.createdAt.getTime() - a.createdAt.getTime()
        }
      })
    }

    // 3. 정렬된 포스트를 섹션별로 분류
    const sortedAndGrouped = sortPosts(numberedPosts).reduce<Record<string, UIPost[]>>(
      (acc, post) => {
        if (!acc[post.section]) {
          acc[post.section] = []
        }
        acc[post.section].push(post)
        return acc
      },
      { keep: [], problem: [], try: [] }
    )

    return sortedAndGrouped
  }, [rawPosts, sortBy])

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users (
            name
          ),
          likes:likes (
            id
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading posts:', error)
        return
      }

      if (!data) {
        console.error('No data returned from posts query')
        return
      }

      // 각 포스트의 좋아요 수를 계산
      const postsWithLikeCounts = data.map(post => ({
        ...post,
        likes_count: post.likes?.length || 0
      }))

      setRawPosts(postsWithLikeCounts)
    } catch (error) {
      console.error('Error in loadPosts:', error)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      await loadPosts() // 좋아요 이벤트 후 즉시 데이터 새로고침
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  useEffect(() => {
    loadPosts()

    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        loadPosts
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
        },
        loadPosts
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const sections = [
    {
      id: 'keep',
      title: 'Keep',
      subtitle: '잘하고 있는 점을 돌아봐요',
      color: 'bg-[#4CAF50]/10',
      headerColor: 'bg-[#4CAF50]',
      textColor: 'text-white',
      icon: 'Keep.png'
    },
    {
      id: 'problem',
      title: 'Problem',
      subtitle: '아쉬운 점을 돌아봐요',
      color: 'bg-[#F44336]/10',
      headerColor: 'bg-[#F44336]',
      textColor: 'text-white',
      icon: 'Problem.png'
    },
    {
      id: 'try',
      title: 'Try',
      subtitle: '새롭게 시도할 점을 제안해요',
      color: 'bg-[#FFC107]/10',
      headerColor: 'bg-[#FFC107]',
      textColor: 'text-white',
      icon: 'Try.png'
    }
  ]

  const SelectBox = () => (
    <div className="flex justify-end mb-6">
      <Select value={sortBy} onValueChange={(value: 'latest' | 'likes') => setSortBy(value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="정렬 기준" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">최신순</SelectItem>
          <SelectItem value="likes">좋아요순</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  if (isMobile) {
    return (
      <div className="p-4">
        <SelectBox />
        <Tabs defaultValue="keep" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            {sections.map(section => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className={`data-[state=active]:${section.headerColor} data-[state=active]:${section.textColor} data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600`}
              >
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {sections.map(section => (
            <TabsContent key={section.id} value={section.id}>
              <RetroSection
                title={
                  <div className="flex items-center gap-2">
                    <img 
                      src={`/${section.icon}`} 
                      alt={`${section.title} icon`}
                      className="w-6 h-6 object-contain"
                    />
                    {section.title}
                  </div>
                }
                subtitle={section.subtitle}
                color={section.color}
                headerColor={section.headerColor}
                textColor={section.textColor}
                type={section.id as 'keep' | 'problem' | 'try'}
                posts={processedPosts[section.id]}
                onPostCreated={loadPosts}
                onLikePost={handleLikePost}
                onCommentPost={() => {}}
                onPostUpdated={loadPosts}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SelectBox />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map(section => (
          <RetroSection
            key={section.id}
            title={
              <div className="flex items-center gap-2">
                <img 
                  src={`/${section.icon}`} 
                  alt={`${section.title} icon`}
                  className="w-6 h-6 object-contain"
                />
                {section.title}
              </div>
            }
            subtitle={section.subtitle}
            color={section.color}
            headerColor={section.headerColor}
            textColor={section.textColor}
            type={section.id as 'keep' | 'problem' | 'try'}
            posts={processedPosts[section.id]}
            onPostCreated={loadPosts}
            onLikePost={handleLikePost}
            onCommentPost={() => {}}
            onPostUpdated={loadPosts}
          />
        ))}
      </div>
    </div>
  )
}