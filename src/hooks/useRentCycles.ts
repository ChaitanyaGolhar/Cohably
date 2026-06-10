import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from './useToast';
import type { RentCycle } from '../types/api';

export function useRentCycles(flatId?: string) {
  const queryClient = useQueryClient();
  const addToast = useToast((s) => s.addToast);

  const rentCyclesQuery = useQuery({
    queryKey: ['rent-cycles', flatId],
    queryFn: async () => {
      const { data } = await api.get(`/flats/${flatId}/rent-cycles`);
      return data.data as RentCycle[];
    },
    enabled: !!flatId,
  });

  const createCycleMutation = useMutation({
    mutationFn: async (data: { month: string; totalAmount: number; dueDate: string; splitType: string; customSplits?: any[] }) => {
      const res = await api.post(`/flats/${flatId}/rent-cycles`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-cycles', flatId] });
      addToast({ type: 'success', title: 'Rent cycle created' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Failed to create rent cycle', message: error.response?.data?.error?.message });
    }
  });

  const payRentMutation = useMutation({
    mutationFn: async ({ cycleId, method }: { cycleId: string; method: string }) => {
      const res = await api.patch(`/flats/${flatId}/rent-cycles/${cycleId}/pay`, { method });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-cycles', flatId] });
      addToast({ type: 'success', title: 'Rent marked as paid' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Failed to record rent payment', message: error.response?.data?.error?.message });
    }
  });

  const approvePaymentMutation = useMutation({
    mutationFn: async ({ cycleId, userId }: { cycleId: string; userId: string }) => {
      const res = await api.patch(`/flats/${flatId}/rent-cycles/${cycleId}/payments/${userId}/approve`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-cycles', flatId] });
      addToast({ type: 'success', title: 'Payment approved' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Failed to approve payment', message: error.response?.data?.error?.message });
    }
  });

  const closeCycleMutation = useMutation({
    mutationFn: async (cycleId: string) => {
      const res = await api.patch(`/flats/${flatId}/rent-cycles/${cycleId}/close`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-cycles', flatId] });
      addToast({ type: 'success', title: 'Rent cycle closed' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Failed to close rent cycle', message: error.response?.data?.error?.message });
    }
  });

  return {
    cycles: rentCyclesQuery.data || [],
    isLoading: rentCyclesQuery.isLoading,
    createCycle: createCycleMutation.mutateAsync,
    isCreating: createCycleMutation.isPending,
    payRent: payRentMutation.mutateAsync,
    isPaying: payRentMutation.isPending,
    approvePayment: approvePaymentMutation.mutateAsync,
    isApproving: approvePaymentMutation.isPending,
    closeCycle: closeCycleMutation.mutateAsync,
    isClosing: closeCycleMutation.isPending,
  };
}
