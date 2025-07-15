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
        <div className="flex items-center gap-4 mb-8">
          <img 
            src="/thinking.png" 
            alt="Thinking 3D Icon" 
            className="w-12 h-12"
          />
          <h1 className="text-4xl font-bold">서로 돌아봄</h1>
        </div>
        <KakaoLogin />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="p-4 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <img 
              src="/thinking.png" 
              alt="Thinking 3D Icon" 
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-bold">서로 돌아봄</h1>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span className="text-sm sm:text-base text-gray-600">{user.email}</span>
            <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
        <RetroBoard />
      </div>
    </div>
  )
}
