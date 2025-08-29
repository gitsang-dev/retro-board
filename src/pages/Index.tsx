import { KakaoLogin } from "@/components/KakaoLogin"
import { useSupabase } from "@/components/SupabaseProvider"
import { Button } from "@/components/ui/button"
import { RetroBoard } from "@/components/RetroBoard"
import { useToast } from "@/hooks/use-toast"
import NotificationBell from "@/components/NotificationBell"

export default function Index() {
  const { user, supabase } = useSupabase()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      // 1. 먼저 현재 세션 상태 확인
      const currentSession = await supabase.auth.getSession()
      
      // 2. 강제 로그아웃 처리
      await Promise.all([
        // Supabase 세션 종료 시도
        supabase.auth.signOut().catch(e => console.warn('Supabase signOut error:', e)),
        
        // 쿠키 제거
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        }),
        
        // 로컬 스토리지 정리
        new Promise<void>((resolve) => {
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {
            console.warn('Storage clear error:', e);
          }
          resolve();
        })
      ]);

      // 3. 성공 메시지 표시
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다.",
      });

      // 4. 잠시 후 페이지 새로고침 (완전한 상태 초기화를 위해)
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 1000);

    } catch (error) {
      console.error('Logout process error:', error);
      
      // 5. 에러 발생 시에도 강제 로그아웃 시도
      try {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = window.location.origin;
      } catch (e) {
        console.error('Force logout error:', e);
        toast({
          title: "로그아웃 오류",
          description: "브라우저를 새로고침 해주세요.",
          variant: "destructive",
        });
      }
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
            <NotificationBell />
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
