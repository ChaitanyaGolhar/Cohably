import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { EmptyState } from '../components/ui/EmptyState';

const TABS = ['All', 'Expenses', 'Rent', 'Rotations', 'Tasks', 'Bills'];

const TAB_TO_FILTER: Record<string, string> = {
  'All': '',
  'Expenses': 'expense_added,settlement_recorded,dispute_raised,dispute_resolved',
  'Rent': 'rent_cycle_created,rent_payment_marked',
  'Rotations': 'rotation_assigned,rotation_completed,rotation_overdue',
  'Tasks': 'task_assigned,task_completed,task_cancelled',
  'Bills': 'bill_reminder_due,bill_reminder_overdue',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);
  const flatId = user?.membership?.flatId;
  const [activeTab, setActiveTab] = useState('All');
  
  const { notifications, isLoading, markAsRead, markAllAsRead, isMarkingAllRead, deleteNotification } = useNotifications(flatId, TAB_TO_FILTER[activeTab], 1);

  const handleNavigate = (notification: any) => {
    const refId = notification.referenceId;
    if (!refId) return;
    
    switch (notification.referenceType) {
      case 'expense': navigate(`/expenses/${refId}`); break;
      case 'rent_cycle': navigate(`/rent`); break;
      case 'settlement': navigate(`/settle`); break;
      case 'rotation_cycle': navigate(`/flat/rotations/${refId}`); break;
      case 'task': navigate(`/flat/tasks/${refId}`); break;
      case 'bill_reminder': navigate(`/flat/bills/${refId}`); break;
    }
  };

  const hasUnread = notifications.some((n: any) => !n.isRead);

  return (
    <div className="pb-20 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button 
          onClick={() => markAllAsRead()} 
          disabled={!hasUnread || isMarkingAllRead}
          className={`text-sm font-medium transition-colors ${hasUnread ? 'text-indigo-600 hover:text-indigo-700' : 'text-gray-400'}`}
        >
          {isMarkingAllRead ? 'Marking...' : 'Mark all read'}
        </button>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title={`No ${activeTab !== 'All' ? activeTab.toLowerCase() : ''} notifications`}
          description={activeTab === 'All' ? "Activity from your flat will appear here" : "Try a different filter"}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => (
            <NotificationItem 
              key={n.id} 
              notification={n} 
              onRead={() => markAsRead(n.id)} 
              onDelete={() => deleteNotification(n.id)}
              onClick={() => handleNavigate(n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
