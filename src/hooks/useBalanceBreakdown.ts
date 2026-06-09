import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { Expense } from '../types/api';

export function useBalanceBreakdown(flatId: string | undefined, targetUserId?: string) {
  const expensesQuery = useQuery({
    queryKey: ['expenses', flatId, { unsettledWith: targetUserId }],
    queryFn: async () => {
      if (!flatId || !targetUserId) return [];
      const { data } = await api.get(`/flats/${flatId}/expenses?unsettledWith=${targetUserId}`);
      return data.data.expenses as Expense[];
    },
    enabled: !!flatId && !!targetUserId,
  });

  const settlementsQuery = useQuery({
    queryKey: ['settlements', flatId, { withUser: targetUserId }],
    queryFn: async () => {
      if (!flatId || !targetUserId) return [];
      const { data } = await api.get(`/flats/${flatId}/settlements?withUser=${targetUserId}&limit=3`);
      return data.data.settlements as any[];
    },
    enabled: !!flatId && !!targetUserId,
  });

  return {
    expenses: expensesQuery.data || [],
    isExpensesLoading: expensesQuery.isLoading,
    settlements: settlementsQuery.data || [],
    isSettlementsLoading: settlementsQuery.isLoading,
  };
}
