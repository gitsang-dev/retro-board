import { KakaoLogin } from "@/components/KakaoLogin"
import { useSupabase } from "@/components/SupabaseProvider"
import { Button } from "@/components/ui/button"
import { RetroBoard } from "@/components/RetroBoard"
import { useToast } from "@/hooks/use-toast"

export default function Index() {
  const { user, supabase } = useSupabase()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      // 세션 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('세션 확인 에러:', sessionError)
        // 세션 에러가 있더라도 로그아웃 시도
      }

      // 로그아웃 시도
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('로그아웃 에러:', error)
        toast({
          title: "로그아웃 실패",
          description: "다시 시도해주세요.",
          variant: "destructive",
        })
        return
      }

      // 로컬 스토리지 정리
      localStorage.removeItem('supabase.auth.token')
      
      // 페이지 새로고침 대신 홈으로 리다이렉트
      window.location.href = '/'
    } catch (error) {
      console.error('로그아웃 에러:', error)
      toast({
        title: "로그아웃 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      })
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
