import { useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useFlatStore } from '../../store/flatStore';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const flatId = user?.membership?.flatId;
  const setFlat = useFlatStore((s) => s.setFlat);
  
  // Fetch Flat details + members globally
  const { data: flatData } = useQuery({
    queryKey: ['flat', flatId],
    queryFn: async () => {
      const { data } = await api.get(`/flats/${flatId}`);
      return data.data; // Includes .memberships
    },
    enabled: !!flatId,
  });

  useEffect(() => {
    if (flatData) {
      const members = flatData.memberships.map((m: any) => ({
        id: m.id, flatId: m.flatId, userId: m.userId, role: m.role, joinedAt: m.joinedAt, isActive: m.isActive, user: m.user
      }));
      setFlat(flatData, members);
    }
  }, [flatData, setFlat]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-8 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-gray-900">{flatData?.name || 'Cohably'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
