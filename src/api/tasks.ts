import api from './axios';
import type { Task, ApiSuccessResponse } from '../types/api';

const apiGet = <T>(url: string) => api.get<ApiSuccessResponse<T>>(url);
const apiPost = <T>(url: string, data?: any) => api.post<ApiSuccessResponse<T>>(url, data);
const apiPatch = <T>(url: string, data?: any) => api.patch<ApiSuccessResponse<T>>(url, data);
const apiDelete = <T>(url: string) => api.delete<ApiSuccessResponse<T>>(url);

export async function listTasks(flatId: string, statusFilter: string = ''): Promise<Task[]> {
  const query = statusFilter ? `?status=${statusFilter}` : '';
  const response = await apiGet<{ tasks: Task[] }>(`/flats/${flatId}/tasks${query}`);
  return response.data.data.tasks;
}

export async function getTask(flatId: string, taskId: string): Promise<Task> {
  const response = await apiGet<{ task: Task }>(`/flats/${flatId}/tasks/${taskId}`);
  return response.data.data.task;
}

export async function createTask(flatId: string, data: any): Promise<Task> {
  const response = await apiPost<Task>(`/flats/${flatId}/tasks`, data);
  return response.data.data;
}

export async function updateTask(flatId: string, taskId: string, data: any): Promise<Task> {
  const response = await apiPatch<Task>(`/flats/${flatId}/tasks/${taskId}`, data);
  return response.data.data;
}

export async function assignTask(flatId: string, taskId: string, userId: string): Promise<Task> {
  const response = await apiPatch<Task>(`/flats/${flatId}/tasks/${taskId}/assign`, { assignedTo: userId });
  return response.data.data;
}

export async function markInProgress(flatId: string, taskId: string): Promise<Task> {
  const response = await apiPatch<Task>(`/flats/${flatId}/tasks/${taskId}/in-progress`);
  return response.data.data;
}

export async function completeTask(flatId: string, taskId: string): Promise<Task> {
  const response = await apiPatch<Task>(`/flats/${flatId}/tasks/${taskId}/complete`);
  return response.data.data;
}

export async function cancelTask(flatId: string, taskId: string): Promise<Task> {
  const response = await apiPatch<Task>(`/flats/${flatId}/tasks/${taskId}/cancel`);
  return response.data.data;
}

export async function deleteTask(flatId: string, taskId: string): Promise<void> {
  await apiDelete(`/flats/${flatId}/tasks/${taskId}`);
}
