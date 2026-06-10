import type { RotationMemberStat } from '../../types/api';

interface MemberRotationStatProps {
  stat: RotationMemberStat;
}

export function MemberRotationStat({ stat }: MemberRotationStatProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-700 font-medium">{stat.name}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Completions:</span>
        <span className="text-sm font-bold text-violet-600 bg-violet-50 px-2 rounded-full">{stat.completionCount}</span>
      </div>
    </div>
  );
}
