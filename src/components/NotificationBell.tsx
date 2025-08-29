import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useSupabase } from './SupabaseProvider'
import { useToast } from '@/hooks/use-toast'

interface Notification {
  id: string
  type: 'mention' | 'comment'
  post_id: string
  comment_id: string
  from_user: {
    name: string
  }
  content: string
  created_at: string
  is_read: boolean
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  // 알림 목록 가져오기
  const fetchNotifications = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        from_user:from_user_id(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching notifications:', error)
      return
    }

    setNotifications(data || [])
    setUnreadCount(data?.filter(n => !n.is_read).length || 0)
  }

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return
    }

    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // 알림 클릭 처리
  const handleNotificationClick = async (notification: Notification) => {
    // 읽음 처리
    await markAsRead(notification.id)

    // 해당 포스트로 이동
    // TODO: 포스트로 이동하는 로직 구현
  }

  // 실시간 알림 구독
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          
          toast({
            title: '새 알림',
            description: newNotification.content,
          })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  // 초기 알림 로드
  useEffect(() => {
    fetchNotifications()
  }, [user])

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              알림이 없습니다
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 cursor-pointer hover:bg-muted ${
                  !notification.is_read ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{notification.from_user?.name}</span>
                      {notification.type === 'mention'
                        ? '님이 회원님을 멘션했습니다'
                        : '님이 회원님의 게시글에 댓글을 남겼습니다'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationBell