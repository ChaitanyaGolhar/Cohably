import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRotation, updateRotation, deleteRotation, addMember, removeMember, completeCycle, skipCycle, getHistory } from '../api/rotations';
import { useToast } from './useToast';

export function useRotation(flatId?: string, rotId?: string) {
  const queryClient = useQueryClient();
  const addToast = useToast(s => s.addToast);

  const rotationQuery = useQuery({
    queryKey: ['rotation', rotId],
    queryFn: () => getRotation(flatId!, rotId!),
    enabled: !!flatId && !!rotId,
    staleTime: 30000,
  });

  const historyQuery = useQuery({
    queryKey: ['rotation-history', rotId],
    queryFn: () => getHistory(flatId!, rotId!, 1),
    enabled: !!flatId && !!rotId,
    staleTime: 60000,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => updateRotation(flatId!, rotId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotation', rotId] });
      queryClient.invalidateQueries({ queryKey: ['rotations', flatId] });
      addToast({ type: 'success', title: 'Rotation updated' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteRotation(flatId!, rotId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotations', flatId] });
      addToast({ type: 'success', title: 'Rotation deleted' });
    }
  });

  const completeCycleMutation = useMutation({
    mutationFn: async (cycleId: string) => completeCycle(flatId!, rotId!, cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotation', rotId] });
      queryClient.invalidateQueries({ queryKey: ['rotations', flatId] });
      queryClient.invalidateQueries({ queryKey: ['rotation-history', rotId] });
      addToast({ type: 'success', title: 'Done!' });
    }
  });

  const skipCycleMutation = useMutation({
    mutationFn: async ({ cycleId, reason }: { cycleId: string, reason: string }) => skipCycle(flatId!, rotId!, cycleId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotation', rotId] });
      queryClient.invalidateQueries({ queryKey: ['rotations', flatId] });
      queryClient.invalidateQueries({ queryKey: ['rotation-history', rotId] });
      addToast({ type: 'info', title: 'Cycle skipped' });
    }
  });

  return {
    rotation: rotationQuery.data,
    isLoading: rotationQuery.isLoading,
    history: historyQuery.data,
    isHistoryLoading: historyQuery.isLoading,
    updateRotation: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteRotation: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    completeCycle: completeCycleMutation.mutate,
    isCompleting: completeCycleMutation.isPending,
    skipCycle: skipCycleMutation.mutate,
    isSkipping: skipCycleMutation.isPending,
  };
}
