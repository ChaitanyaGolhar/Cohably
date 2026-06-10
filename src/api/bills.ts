import api from './axios';
import type { BillReminder, ApiSuccessResponse } from '../types/api';

const apiGet = <T>(url: string) => api.get<ApiSuccessResponse<T>>(url);
const apiPost = <T>(url: string, data?: any) => api.post<ApiSuccessResponse<T>>(url, data);
const apiPatch = <T>(url: string, data?: any) => api.patch<ApiSuccessResponse<T>>(url, data);
const apiDelete = <T>(url: string) => api.delete<ApiSuccessResponse<T>>(url);

export async function listBills(flatId: string): Promise<BillReminder[]> {
  const response = await apiGet<{ reminders: BillReminder[] }>(`/flats/${flatId}/bill-reminders`);
  return response.data.data.reminders;
}

export async function getBill(flatId: string, billId: string): Promise<BillReminder> {
  const response = await apiGet<{ reminder: BillReminder }>(`/flats/${flatId}/bill-reminders/${billId}`);
  return response.data.data.reminder;
}

export async function createBill(flatId: string, data: any): Promise<BillReminder> {
  const response = await apiPost<BillReminder>(`/flats/${flatId}/bill-reminders`, data);
  return response.data.data;
}

export async function updateBill(flatId: string, billId: string, data: any): Promise<BillReminder> {
  const response = await apiPatch<BillReminder>(`/flats/${flatId}/bill-reminders/${billId}`, data);
  return response.data.data;
}

export async function markPaid(flatId: string, billId: string, data: { createExpense: boolean, expenseNote?: string }): Promise<any> {
  const response = await apiPatch<any>(`/flats/${flatId}/bill-reminders/${billId}/paid`, data);
  return response.data.data;
}

export async function deleteBill(flatId: string, billId: string): Promise<void> {
  await apiDelete(`/flats/${flatId}/bill-reminders/${billId}`);
}
