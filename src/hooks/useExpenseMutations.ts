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

  const editExpenseMutation = useMutation({
    mutationFn: async ({ expenseId, data }: { expenseId: string; data: any }) => {
      const res = await api.patch(`/flats/${flatId}/expenses/${expenseId}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', flatId] });
      queryClient.invalidateQueries({ queryKey: ['balances', flatId] });
      queryClient.invalidateQueries({ queryKey: ['expense'] });
      addToast({ type: 'success', title: 'Expense updated successfully' });
    },
    onError: (error: any) => {
      addToast({ 
        type: 'error', 
        title: 'Failed to update expense', 
        message: error.response?.data?.error?.message 
      });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      await api.delete(`/flats/${flatId}/expenses/${expenseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', flatId] });
      queryClient.invalidateQueries({ queryKey: ['balances', flatId] });
      addToast({ type: 'success', title: 'Expense deleted successfully' });
    },
    onError: (error: any) => {
      addToast({ 
        type: 'error', 
        title: 'Failed to delete expense', 
        message: error.response?.data?.error?.message 
      });
    }
  });

  return {
    addExpense: addExpenseMutation.mutateAsync,
    isAdding: addExpenseMutation.isPending,
    editExpense: editExpenseMutation.mutateAsync,
    isEditing: editExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    isDeleting: deleteExpenseMutation.isPending,
  };
}
