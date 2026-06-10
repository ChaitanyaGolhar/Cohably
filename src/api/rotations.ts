import api from './axios';
import type { Rotation, RotationLog, RotationMemberStat, ApiSuccessResponse } from '../types/api';

const apiGet = <T>(url: string) => api.get<ApiSuccessResponse<T>>(url);
const apiPost = <T>(url: string, data?: any) => api.post<ApiSuccessResponse<T>>(url, data);
const apiPatch = <T>(url: string, data?: any) => api.patch<ApiSuccessResponse<T>>(url, data);
const apiDelete = <T>(url: string) => api.delete<ApiSuccessResponse<T>>(url);

export async function listRotations(flatId: string): Promise<Rotation[]> {
  const response = await apiGet<{ rotations: Rotation[] }>(`/flats/${flatId}/rotations`);
  return response.data.data.rotations;
}

export async function getRotation(flatId: string, rotId: string): Promise<Rotation & { members: any[], logs: any[], cycles: any[] }> {
  const response = await apiGet<{ rotation: Rotation & { members: any[], logs: any[], cycles: any[] } }>(`/flats/${flatId}/rotations/${rotId}`);
  return response.data.data.rotation;
}

export async function createRotation(flatId: string, data: any): Promise<Rotation> {
  const response = await apiPost<Rotation>(`/flats/${flatId}/rotations`, data);
  return response.data.data;
}

export async function updateRotation(flatId: string, rotId: string, data: any): Promise<Rotation> {
  const response = await apiPatch<Rotation>(`/flats/${flatId}/rotations/${rotId}`, data);
  return response.data.data;
}

export async function deleteRotation(flatId: string, rotId: string): Promise<void> {
  await apiDelete(`/flats/${flatId}/rotations/${rotId}`);
}

export async function addMember(flatId: string, rotId: string, userId: string): Promise<void> {
  await apiPost(`/flats/${flatId}/rotations/${rotId}/members`, { userId });
}

export async function removeMember(flatId: string, rotId: string, userId: string): Promise<void> {
  await apiDelete(`/flats/${flatId}/rotations/${rotId}/members/${userId}`);
}

export async function completeCycle(flatId: string, rotId: string, cycleId: string): Promise<void> {
  await apiPatch(`/flats/${flatId}/rotations/${rotId}/cycles/${cycleId}/complete`);
}

export async function skipCycle(flatId: string, rotId: string, cycleId: string, reason: string): Promise<void> {
  await apiPatch(`/flats/${flatId}/rotations/${rotId}/cycles/${cycleId}/skip`, { reason });
}

export async function getHistory(flatId: string, rotId: string, page: number = 1): Promise<{ logs: RotationLog[], stats: RotationMemberStat[] }> {
  const response = await apiGet<{ logs: RotationLog[], stats: RotationMemberStat[] }>(`/flats/${flatId}/rotations/${rotId}/history?page=${page}&limit=10`);
  return response.data.data;
}
