import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from './useToast';

export function useExpenseMutations(flatId?: string) {
  const queryClient = useQueryClient();
  const addToast = useToast((s) => s.addToast);

  const addExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(`/flats/${flatId}/expenses`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', flatId] });
      queryClient.invalidateQueries({ queryKey: ['balances', flatId] });
      addToast({ type: 'success', title: 'Expense added successfully' });
    },
    onError: (error: any) => {
      addToast({ 
        type: 'error', 
        title: 'Failed to add expense', 
        message: error.response?.data?.error?.message 
      });
    }
  });

  return {
    addExpense: addExpenseMutation.mutateAsync,
    isAdding: addExpenseMutation.isPending,
  };
}
