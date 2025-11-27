import { apiClient } from '../index';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export async function sendContactMessage(data: ContactFormData): Promise<ContactResponse> {
  return await apiClient.post<ContactResponse>('/api/public/contact', data);
}

