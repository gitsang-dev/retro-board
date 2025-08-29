import { Database } from './supabase';

export type NotificationType = 'like' | 'comment' | 'mention';

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string;
  post_id: string;
  type: NotificationType;
  content: string | null;
  is_read: boolean;
  created_at: string;
  // Join된 데이터
  sender?: {
    name: string;
    avatar_url: string;
  };
  post?: {
    title: string;
    section: 'keep' | 'problem' | 'try';
  };
}

export type NotificationInsert = Omit<Notification, 'id' | 'created_at' | 'sender' | 'post'>;

// Supabase 타입
export type DbNotification = Database['public']['Tables']['notifications']['Row'];
export type DbNotificationInsert = Database['public']['Tables']['notifications']['Insert'];
