import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listNotifications, getUnreadCount, markRead, markAllRead, deleteNotification } from '../api/notifications';
import { useToast } from './useToast';
import { useEffect, useRef } from 'react';

export function useUnreadCount(flatId?: string) {
  const query = useQuery({
    queryKey: ['notifications-unread', flatId],
    queryFn: () => getUnreadCount(flatId!),
    enabled: !!flatId,
    refetchInterval: 60000,
  });
  return { unreadCount: query.data || 0 };
}

export function useNotifications(flatId?: string, filter?: string, page: number = 1) {
  const queryClient = useQueryClient();
  const addToast = useToast(s => s.addToast);
  const previousUnreadCount = useRef(0);

  const notificationsQuery = useQuery({
    queryKey: ['notifications', flatId, filter, page],
    queryFn: () => listNotifications(flatId!, filter, page),
    enabled: !!flatId,
    staleTime: 30000,
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (unreadCount > previousUnreadCount.current) {
      const newestUnread = notifications.find(n => !n.isRead);
      if (newestUnread) {
        addToast({ 
          type: 'info', 
          title: newestUnread.title, 
          message: newestUnread.body 
        });
      }
    }
    previousUnreadCount.current = unreadCount;
  }, [unreadCount, notifications, addToast]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => markRead(flatId!, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', flatId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', flatId] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => markAllRead(flatId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', flatId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', flatId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => deleteNotification(flatId!, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', flatId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', flatId] });
      addToast({ type: 'success', title: 'Notification deleted' });
    }
  });

  return {
    notifications,
    isLoading: notificationsQuery.isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllRead: markAllAsReadMutation.isPending,
    deleteNotification: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
