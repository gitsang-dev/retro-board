import { KakaoLogin } from "@/components/KakaoLogin"
import { useSupabase } from "@/components/SupabaseProvider"
import { Button } from "@/components/ui/button"
import { RetroBoard } from "@/components/RetroBoard"
import { supabase } from "@/lib/supabase"

export default function Index() {
  const { user, session } = useSupabase()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('로그아웃 에러:', error)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-8 text-4xl font-bold">레트로 보드</h1>
        <KakaoLogin />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">레트로 보드</h1>
        <div className="flex items-center gap-4">
          <span>{user.email}</span>
          <Button variant="outline" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>
      <RetroBoard />
    </div>
  )
}
