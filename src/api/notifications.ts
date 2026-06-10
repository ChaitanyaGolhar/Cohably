import api from './axios';
import type { Notification, UnreadCount, ApiSuccessResponse } from '../types/api';

const apiGet = <T>(url: string) => api.get<ApiSuccessResponse<T>>(url);
const apiPatch = <T>(url: string, data?: any) => api.patch<ApiSuccessResponse<T>>(url, data);
const apiDelete = <T>(url: string) => api.delete<ApiSuccessResponse<T>>(url);

export async function listNotifications(flatId: string, filter?: string, page: number = 1): Promise<Notification[]> {
  const query = filter && filter !== 'All' ? `?type=${filter}&page=${page}` : `?page=${page}`;
  const response = await apiGet<{ notifications: Notification[] }>(`/flats/${flatId}/notifications${query}`);
  return response.data.data.notifications;
}

export async function getUnreadCount(flatId: string): Promise<number> {
  const response = await apiGet<UnreadCount>(`/flats/${flatId}/notifications/unread-count`);
  return response.data.data.count;
}

export async function markRead(flatId: string, notifId: string): Promise<void> {
  await apiPatch(`/flats/${flatId}/notifications/${notifId}/read`);
}

export async function markAllRead(flatId: string): Promise<void> {
  await apiPatch(`/flats/${flatId}/notifications/read-all`);
}

export async function deleteNotification(flatId: string, notifId: string): Promise<void> {
  await apiDelete(`/flats/${flatId}/notifications/${notifId}`);
}
