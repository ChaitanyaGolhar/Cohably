import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { Expense } from '../types/api';

export function useExpensesList(flatId: string | undefined, category?: string, userId?: string) {
  return useQuery({
    queryKey: ['expenses', flatId, { category, userId }],
    queryFn: async () => {
      if (!flatId) return { expenses: [], total: 0 };
      
      const params = new URLSearchParams();
      if (category && category !== 'ALL') params.append('category', category);
      if (userId && userId !== 'ALL') params.append('userId', userId);
      
      const { data } = await api.get(`/flats/${flatId}/expenses?${params.toString()}`);
      return data.data as { expenses: Expense[]; total: number };
    },
    enabled: !!flatId,
  });
}
