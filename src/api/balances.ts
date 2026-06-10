import api from './axios';
import type { MyBalances, ApiSuccessResponse } from '../types/api';
const apiGet = <T>(url: string) => api.get<ApiSuccessResponse<T>>(url);

export async function getMyBalances(flatId: string): Promise<MyBalances> {
  const response = await apiGet<{ balances: MyBalances }>(`/flats/${flatId}/balances`);
  return response.data.data.balances;
}

export async function getBreakdown(flatId: string, targetUserId: string): Promise<any> {
  const response = await apiGet<{ breakdown: any }>(`/flats/${flatId}/balances/breakdown?with=${targetUserId}`);
  return response.data.data.breakdown;
}
