import { apiClient, api } from "../index";

export interface InitializePaymentPayload {
  reservationId: number;
  price: number;
  userFullname: string;
  userEmail: string;
  userPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingCountry?: string;
  billingZipCode?: string;
}

export interface InitializePaymentResponse {
  token: string;
  formHtml: string;
}

export const initializePayment = async (payload: InitializePaymentPayload) => {
  console.log("[API] initializePayment request payload:", payload);
  try {
    const rawResponse = await api.post<InitializePaymentResponse>("/api/payments/initialize", payload);
    console.log("[API] initializePayment raw response:", rawResponse);
    console.log("[API] initializePayment data:", rawResponse?.data);
    const response = await apiClient.post<InitializePaymentResponse>("/api/payments/initialize", payload);
    return response;
  } catch (err) {
    console.error("[API] initializePayment ERROR:", err);
    throw err;
  }
};

export async function chargePayment(payload: any): Promise<{ success: boolean; result?: any; error?: any }> {
  console.log("[API] chargePayment(payload):", payload);
  const response = await apiClient.post<{ success: boolean; result?: any; error?: any }>("/api/payments/charge", payload);
  console.log("[API] chargePayment(response):", response);
  return response;
}


