import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask, assignTask, markInProgress, completeTask, cancelTask, deleteTask } from '../api/tasks';
import { useToast } from './useToast';

export function useTask(flatId?: string, taskId?: string) {
  const queryClient = useQueryClient();
  const addToast = useToast(s => s.addToast);

  const taskQuery = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(flatId!, taskId!),
    enabled: !!flatId && !!taskId,
    staleTime: 30000,
  });

  const assignMutation = useMutation({
    mutationFn: async (userId: string) => assignTask(flatId!, taskId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', flatId] });
      addToast({ type: 'success', title: 'Task assigned' });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async () => completeTask(flatId!, taskId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', flatId] });
      addToast({ type: 'success', title: 'Task completed' });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => cancelTask(flatId!, taskId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', flatId] });
      addToast({ type: 'info', title: 'Task cancelled' });
    }
  });

  const inProgressMutation = useMutation({
    mutationFn: async () => markInProgress(flatId!, taskId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', flatId] });
      addToast({ type: 'info', title: 'Task in progress' });
    }
  });

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    assignTask: assignMutation.mutate,
    isAssigning: assignMutation.isPending,
    markInProgress: inProgressMutation.mutate,
    isMarkingInProgress: inProgressMutation.isPending,
    completeTask: completeMutation.mutate,
    isCompleting: completeMutation.isPending,
    cancelTask: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
  };
}
