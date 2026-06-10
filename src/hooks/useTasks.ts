import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTasks, createTask } from '../api/tasks';
import { useToast } from './useToast';

export function useTasks(flatId?: string, filters?: string) {
  const queryClient = useQueryClient();
  const addToast = useToast(s => s.addToast);

  const tasksQuery = useQuery({
    queryKey: ['tasks', flatId, filters],
    queryFn: () => listTasks(flatId!, filters),
    enabled: !!flatId,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => createTask(flatId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', flatId] });
      addToast({ type: 'success', title: 'Task created' });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Failed to create task',
        message: error.response?.data?.error?.message || error.message,
      });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    createTask: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
