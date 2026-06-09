import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from './useToast';

export function useSettlementMutations(flatId?: string) {
  const queryClient = useQueryClient();
  const addToast = useToast((s) => s.addToast);

  const recordSettlementMutation = useMutation({
    mutationFn: async (data: { toUser: string; amount: number; method: string; note?: string }) => {
      const res = await api.post(`/flats/${flatId}/settlements`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances', flatId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', flatId] });
      addToast({ type: 'success', title: 'Payment recorded successfully' });
    },
    onError: (error: any) => {
      addToast({ 
        type: 'error', 
        title: 'Failed to record payment', 
        message: error.response?.data?.error?.message 
      });
    }
  });

  return {
    recordSettlement: recordSettlementMutation.mutateAsync,
    isRecording: recordSettlementMutation.isPending,
  };
}
