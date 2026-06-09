import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFlatStore } from '../store/flatStore';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { LogOut, User, Users, ShieldAlert, Copy, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from '../hooks/useToast';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const currentFlat = useFlatStore((s) => s.currentFlat);
  const members = useFlatStore((s) => s.members);
  const { logout } = useAuth();
  const addToast = useToast((s) => s.addToast);
  const queryClient = useQueryClient();
  const clearFlat = useFlatStore((s) => s.clearFlat);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name || '');
  const [copied, setCopied] = useState(false);

  const myMembership = members.find(m => m.userId === user?.id);

  const updateProfileMutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await api.patch('/auth/me', { name: newName });
      return res.data.data;
    },
    onSuccess: (updatedUser) => {
      // Re-add membership because the backend might not return it in this endpoint
      setUser({ ...updatedUser, membership: user?.membership });
      addToast({ type: 'success', title: 'Profile updated' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to update profile' })
  });

  const leaveFlatMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/flats/${currentFlat?.id}/members/me`);
    },
    onSuccess: () => {
      // Clear flat state and update user membership to null
      clearFlat();
      if (user) {
        setUser({ ...user, membership: null });
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
      addToast({ type: 'success', title: 'You have left the flat' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Failed to leave flat', message: error.response?.data?.error?.message });
    }
  });

  const handleCopyCode = () => {
    if (currentFlat?.inviteCode) {
      navigator.clipboard.writeText(currentFlat.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({ type: 'info', title: 'Invite code copied' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your profile and flat preferences.</p>
      </div>

      <Card padding="lg" className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <User className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        </div>

        <div className="flex items-center gap-4">
          <Avatar src={user?.avatarUrl} name={user?.name} size="lg" />
          <div className="flex-1">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={() => updateProfileMutation.mutate(name)} 
          isLoading={updateProfileMutation.isPending}
          disabled={name === user?.name || !name.trim()}
        >
          Save Changes
        </Button>
      </Card>

      {currentFlat && (
        <Card padding="lg" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Users className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Flat Details</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flat Name</label>
            <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">{currentFlat.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg tracking-widest font-bold text-center bg-indigo-50 text-indigo-700 py-3 rounded-xl border border-indigo-100">
                {currentFlat.inviteCode}
              </code>
              <Button variant="secondary" onClick={handleCopyCode} className="h-13 px-4">
                {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Share this code with your roommates so they can join.</p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Members ({members.length})</h3>
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.userId} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Avatar src={m.user?.avatarUrl} name={m.user?.name} size="sm" />
                    <span className="text-sm font-medium">{m.userId === user?.id ? 'You' : m.user?.name}</span>
                  </div>
                  {m.role === 'ADMIN' && <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Admin</span>}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {currentFlat && (
          <Button 
            variant="danger" 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              if (window.confirm('Are you sure you want to leave this flat? All your unsettled balances will remain.')) {
                leaveFlatMutation.mutate();
              }
            }}
            isLoading={leaveFlatMutation.isPending}
            disabled={myMembership?.role === 'ADMIN'}
          >
            <ShieldAlert className="h-4 w-4" />
            {myMembership?.role === 'ADMIN' ? 'Admins cannot leave flat' : 'Leave Flat'}
          </Button>
        )}

        <Button 
          variant="secondary" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>
      
      <div className="text-center pb-8 pt-4">
        <p className="text-xs text-gray-400">Cohably v1.0.0</p>
      </div>
    </div>
  );
}
