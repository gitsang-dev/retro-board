import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useSupabase } from './SupabaseProvider'
import { notificationApi } from '@/lib/supabase'
import { Notification } from '@/types/notification'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { user } = useSupabase()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // 알림 목록 조회
  const fetchNotifications = async () => {
    if (!user) return
    const data = await notificationApi.list(user.id)
    setNotifications(data)
  }

  // 읽지 않은 알림 개수 조회
  const fetchUnreadCount = async () => {
    if (!user) return
    const count = await notificationApi.getUnreadCount(user.id)
    setUnreadCount(count || 0)
  }

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId: string) => {
    await notificationApi.markAsRead(notificationId)
    await fetchUnreadCount()
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ))
  }

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    if (!user) return
    await notificationApi.markAllAsRead(user.id)
    await fetchUnreadCount()
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  // 실시간 알림 구독
  useEffect(() => {
    if (!user) return

    const subscription = notificationApi.subscribeToNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  // 초기 데이터 로드
  useEffect(() => {
    if (!user) return
    fetchNotifications()
    fetchUnreadCount()
  }, [user])

  // Popover가 열릴 때 자동으로 모든 알림 읽음 처리
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      handleMarkAllAsRead()
    }
  }, [isOpen])

  if (!user) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">알림</h4>
          {notifications.some(n => !n.is_read) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              모두 읽음
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-[100px] text-sm text-muted-foreground">
              알림이 없습니다
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors",
                    !notification.is_read && "bg-muted/30"
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <img
                    src={notification.sender?.avatar_url}
                    alt={notification.sender?.raw_user_meta_data?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{notification.sender?.raw_user_meta_data?.name}</span>
                      {notification.type === 'like' && ' 님이 회고에 좋아요를 눌렀습니다'}
                      {notification.type === 'comment' && ' 님이 회고에 댓글을 남겼습니다'}
                      {notification.type === 'mention' && ' 님이 댓글에서 회원님을 언급했습니다'}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}