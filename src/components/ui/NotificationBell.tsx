import { Bell, BellDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationBellProps {
  unreadCount: number;
}

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Notifications"
    >
      {unreadCount > 0 ? (
        <>
          <BellDot className="w-6 h-6 text-gray-700" />
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </>
      ) : (
        <Bell className="w-6 h-6 text-gray-700" />
      )}
    </button>
  );
}
