import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFlatStore } from '../store/flatStore';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { useToast } from './useToast';

export function useFlatMutations() {
  const queryClient = useQueryClient();
  const addToast = useToast((s) => s.addToast);
  const setFlat = useFlatStore((s) => s.setFlat);
  
  // We also need to update auth user's membership locally after creating/joining
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const createFlatMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.post('/flats', data);
      return res.data.data; // returns the new flat
    },
    onSuccess: (flat) => {
      setFlat(flat, []);
      if (user) {
        setUser({ ...user, membership: { id: 'temp', flatId: flat.id, userId: user.id, role: 'ADMIN', joinedAt: new Date().toISOString(), isActive: true } });
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
      addToast({ type: 'success', title: 'Flat created successfully!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Failed to create flat', message: error.response?.data?.error?.message });
    }
  });

  const joinFlatMutation = useMutation({
    mutationFn: async (data: { inviteCode: string }) => {
      const res = await api.post('/flats/join', data);
      return res.data.data; // returns { flat, membership }
    },
    onSuccess: (data) => {
      setFlat(data.flat, []);
      if (user) {
        setUser({ ...user, membership: data.membership });
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
      addToast({ type: 'success', title: 'Joined flat successfully!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Failed to join flat', message: error.response?.data?.error?.message });
    }
  });

  return {
    createFlat: createFlatMutation.mutateAsync,
    isCreating: createFlatMutation.isPending,
    joinFlat: joinFlatMutation.mutateAsync,
    isJoining: joinFlatMutation.isPending,
  };
}
