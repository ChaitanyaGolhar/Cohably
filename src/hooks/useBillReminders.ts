import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listBills, createBill } from '../api/bills';
import { useToast } from './useToast';

export function useBillReminders(flatId?: string) {
  const queryClient = useQueryClient();
  const addToast = useToast(s => s.addToast);

  const billsQuery = useQuery({
    queryKey: ['bill-reminders', flatId],
    queryFn: () => listBills(flatId!),
    enabled: !!flatId,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => createBill(flatId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-reminders', flatId] });
      addToast({ type: 'success', title: 'Bill reminder created' });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Failed to create bill reminder',
        message: error.response?.data?.error?.message || error.message,
      });
    },
  });

  return {
    bills: billsQuery.data || [],
    isLoading: billsQuery.isLoading,
    createBill: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
