import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function KakaoLogin() {
  const handleKakaoLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'consent',
            scope: 'account_email profile_nickname profile_image'  // 이메일 스코프 추가
          }
        }
      })
      
      if (error) {
        console.error('카카오 로그인 에러:', error)
        throw error
      }
      
      // 모바일 환경에서 리다이렉트 처리
      if (data?.url) {
        window.location.href = data.url
      }
      
    } catch (error) {
      console.error('카카오 로그인 에러:', error)
    }
  }

  return (
    <Button 
      onClick={handleKakaoLogin}
      className="bg-[#FEE500] text-black hover:bg-[#FEE500]/90"
    >
      카카오로 시작하기
    </Button>
  )
} 