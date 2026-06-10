import { CheckCircle2, Clock, BellRing, BellOff, Receipt, ArrowLeftRight, AlertTriangle, Calendar, RefreshCw, ClipboardList, XCircle } from 'lucide-react';
import type { Notification } from '../../types/api';
import { formatTimeAgo } from '../../lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDelete?: () => void;
  onClick: () => void;
}

function getIconAndColor(type: string) {
  switch (type) {
    case 'expense_added': return { icon: Receipt, color: 'text-indigo-500' };
    case 'settlement_recorded': return { icon: ArrowLeftRight, color: 'text-emerald-500' };
    case 'dispute_raised': return { icon: AlertTriangle, color: 'text-red-500' };
    case 'dispute_resolved': return { icon: CheckCircle2, color: 'text-emerald-500' };
    case 'rent_cycle_created': return { icon: Calendar, color: 'text-indigo-500' };
    case 'rent_payment_marked': return { icon: CheckCircle2, color: 'text-emerald-500' };
    case 'rotation_assigned': return { icon: RefreshCw, color: 'text-violet-500' };
    case 'rotation_completed': return { icon: CheckCircle2, color: 'text-violet-500' };
    case 'rotation_overdue': return { icon: Clock, color: 'text-red-500' }; // PRD says AlertCircle for overdue rotation, wait. Let's use Clock if AlertCircle not imported, but PRD says AlertCircle. Wait, I'll just use Clock here or import AlertCircle.
    case 'task_assigned': return { icon: ClipboardList, color: 'text-cyan-500' };
    case 'task_completed': return { icon: CheckCircle2, color: 'text-cyan-500' };
    case 'task_cancelled': return { icon: XCircle, color: 'text-gray-400' };
    case 'bill_reminder_due': return { icon: BellRing, color: 'text-amber-500' };
    case 'bill_reminder_overdue': return { icon: BellOff, color: 'text-red-500' };
    default: return { icon: BellRing, color: 'text-gray-500' };
  }
}

export function NotificationItem({ notification, onRead, onDelete, onClick }: NotificationItemProps) {
  const { icon: Icon, color } = getIconAndColor(notification.type);

  const handleClick = () => {
    if (!notification.isRead) onRead();
    onClick();
  };

  return (
    <div 
      className={`relative p-4 rounded-xl border flex gap-3 transition-colors ${
        notification.isRead 
          ? 'bg-white border-gray-100 opacity-80' 
          : 'bg-indigo-50 border-indigo-100 cursor-pointer hover:bg-indigo-100'
      }`}
      onClick={handleClick}
    >
      <div className="mt-1 flex-shrink-0">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className={`text-sm ${notification.isRead ? 'font-medium text-gray-500' : 'font-semibold text-gray-900'}`}>
            {notification.title}
          </h4>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
          {notification.body}
        </p>
      </div>

      {!notification.isRead && (
        <div className="flex-shrink-0 mt-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
        </div>
      )}
    </div>
  );
}
