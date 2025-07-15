import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User, SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface SupabaseContextType {
  user: User | null
  session: Session | null
  supabase: SupabaseClient
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  session: null,
  supabase,
})

export function useSupabase() {
  return useContext(SupabaseContext)
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  const saveUserProfile = async (user: User) => {
    try {
      // users 테이블에 사용자 정보 저장
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata.full_name,
          avatar_url: user.user_metadata.avatar_url,
          last_login: new Date().toISOString(),
        })

      if (userError) {
        console.error('사용자 정보 저장 에러:', userError)
        return
      }

      // profiles 테이블에도 사용자 정보 저장
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name,
          avatar_url: user.user_metadata.avatar_url,
          provider: user.app_metadata.provider,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('프로필 저장 에러:', profileError)
      }
    } catch (error) {
      console.error('사용자 정보 처리 에러:', error)
    }
  }

  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        saveUserProfile(session.user)
      }
    })

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        saveUserProfile(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SupabaseContext.Provider value={{ user, session, supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
} 