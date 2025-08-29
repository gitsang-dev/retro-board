import { createClient } from '@supabase/supabase-js'
import { NotificationInsert, Notification } from '../types/notification'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 알림 관련 API 함수들
export const notificationApi = {
  // 새 알림 생성
  async create(notification: NotificationInsert) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select('*, sender:users!sender_id(name, avatar_url), post:posts!post_id(title, section)')
      .single()
    
    if (error) throw error
    return data as Notification
  },

  // 사용자의 알림 목록 조회
  async list(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, sender:users!sender_id(name, avatar_url), post:posts!post_id(title, section)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as Notification[]
  },

  // 읽지 않은 알림 개수 조회
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)
    
    if (error) throw error
    return count
  },

  // 알림 읽음 처리
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    
    if (error) throw error
  },

  // 모든 알림 읽음 처리
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
    
    if (error) throw error
  },

  // 실시간 알림 구독
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()
  }
}