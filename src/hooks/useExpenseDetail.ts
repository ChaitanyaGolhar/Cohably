import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from './useToast';
import type { Expense, Comment } from '../types/api';

export function useExpenseDetail(flatId: string, expenseId: string) {
  const queryClient = useQueryClient();
  const addToast = useToast((s) => s.addToast);

  const expenseQuery = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async () => {
      const { data } = await api.get(`/flats/${flatId}/expenses/${expenseId}`);
      return data.data as Expense;
    },
    enabled: !!flatId && !!expenseId,
  });

  const commentsQuery = useQuery({
    queryKey: ['comments', expenseId],
    queryFn: async () => {
      const { data } = await api.get(`/flats/${flatId}/expenses/${expenseId}/comments`);
      return data.data as Comment[];
    },
    enabled: !!flatId && !!expenseId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post(`/flats/${flatId}/expenses/${expenseId}/comments`, { message });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', expenseId] });
      addToast({ type: 'success', title: 'Comment added' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to add comment' }),
  });

  const toggleDisputeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/flats/${flatId}/expenses/${expenseId}/comments/dispute`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense', expenseId] });
      queryClient.invalidateQueries({ queryKey: ['comments', expenseId] });
      addToast({ type: 'success', title: 'Dispute status updated' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to update dispute' }),
  });

  return {
    expense: expenseQuery.data,
    isExpenseLoading: expenseQuery.isLoading,
    comments: commentsQuery.data || [],
    isCommentsLoading: commentsQuery.isLoading,
    addComment: addCommentMutation.mutateAsync,
    isAddingComment: addCommentMutation.isPending,
    toggleDispute: toggleDisputeMutation.mutateAsync,
    isTogglingDispute: toggleDisputeMutation.isPending,
  };
}
