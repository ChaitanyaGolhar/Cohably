import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { MyBalances, Expense, RentCycle } from '../types/api';

export function useBalances(flatId?: string) {
  return useQuery({
    queryKey: ['balances', flatId],
    queryFn: async () => {
      const { data } = await api.get(`/flats/${flatId}/balances/me`);
      return data.data as MyBalances;
    },
    enabled: !!flatId,
  });
}

export function useRecentExpenses(flatId?: string) {
  return useQuery({
    queryKey: ['expenses', flatId, 'recent'],
    queryFn: async () => {
      const { data } = await api.get(`/flats/${flatId}/expenses?limit=5`);
      return data.data.expenses as Expense[];
    },
    enabled: !!flatId,
  });
}

export function useActiveRentCycle(flatId?: string) {
  return useQuery({
    queryKey: ['rent-cycles', flatId, 'active'],
    queryFn: async () => {
      const { data } = await api.get(`/flats/${flatId}/rent-cycles`);
      const cycles = data.data as RentCycle[];
      return cycles.find(c => !c.isClosed) || null;
    },
    enabled: !!flatId,
  });
}
