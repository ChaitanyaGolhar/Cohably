import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listRotations, createRotation, deleteRotation } from '../api/rotations';
import { useToast } from './useToast';

export function useRotations(flatId?: string) {
  const queryClient = useQueryClient();
  const addToast = useToast(s => s.addToast);

  const rotationsQuery = useQuery({
    queryKey: ['rotations', flatId],
    queryFn: () => listRotations(flatId!),
    enabled: !!flatId,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => createRotation(flatId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotations', flatId] });
      addToast({ type: 'success', title: 'Rotation created' });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Failed to create rotation',
        message: error.response?.data?.error?.message || error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (rotId: string) => deleteRotation(flatId!, rotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotations', flatId] });
      addToast({ type: 'success', title: 'Rotation deleted' });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Failed to delete rotation',
        message: error.response?.data?.error?.message || error.message,
      });
    },
  });

  return {
    rotations: rotationsQuery.data || [],
    isLoading: rotationsQuery.isLoading,
    createRotation: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteRotation: deleteMutation.mutate,
  };
}
