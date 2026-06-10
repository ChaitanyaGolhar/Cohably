import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../api/notifications';

export function useUnreadCount(flatId?: string) {
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread', flatId],
    queryFn: () => getUnreadCount(flatId!),
    enabled: !!flatId,
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  return { unreadCount };
}
