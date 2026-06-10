import type { RotationLog } from '../../types/api';
import { formatTimeAgo } from '../../lib/utils';
import { CheckCircle2, SkipForward } from 'lucide-react';

interface RotationLogRowProps {
  log: RotationLog;
}

export function RotationLogRow({ log }: RotationLogRowProps) {
  const isCompleted = log.outcome === 'COMPLETED';
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <SkipForward className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{log.name}</p>
          <p className="text-xs text-gray-400">{isCompleted ? 'Completed cycle' : 'Cycle skipped'}</p>
        </div>
      </div>
      <span className="text-xs text-gray-400">{formatTimeAgo(log.loggedAt)}</span>
    </div>
  );
}
