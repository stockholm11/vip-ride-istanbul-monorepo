interface StoredPaymentForm {
  token: string;
  formHtml: string;
  createdAt: number;
}

const KEY_PREFIX = "payment-form-";

export function savePaymentForm(
  reservationId: number | string,
  data: { token: string; formHtml: string }
): boolean {
  if (typeof window === "undefined") {
    console.warn("[savePaymentForm] Window is undefined, cannot save payment form");
    return false;
  }

  if (!reservationId) {
    console.error("[savePaymentForm] Invalid reservationId:", reservationId);
    return false;
  }

  if (!data || !data.token || !data.formHtml) {
    console.error("[savePaymentForm] Invalid payment data:", data);
    return false;
  }

  const payload: StoredPaymentForm = {
    ...data,
    createdAt: Date.now(),
  };

  // Normalize reservationId to ensure consistent key format
  const normalizedId = String(reservationId).replace(/\D/g, "");
  if (!normalizedId) {
    console.error("[savePaymentForm] Invalid reservationId after normalization:", reservationId);
    return false;
  }
  
  const key = `${KEY_PREFIX}${normalizedId}`;
  console.log("[savePaymentForm] CALLED with:", reservationId, data);
  console.log("[savePaymentForm] Using key:", key);

  try {
    window.sessionStorage.setItem(key, JSON.stringify(payload));
    console.log("[savePaymentForm] STORED payload:", payload);
    
    // Verify that it was saved
    const saved = window.sessionStorage.getItem(key);
    console.log("[savePaymentForm] VERIFY key:", key, "value:", saved);
    if (!saved) {
      console.error("[savePaymentForm] Payment form was not saved (verification failed)");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("[savePaymentForm] Failed to save payment form:", error);
    // Check if sessionStorage is available
    try {
      window.sessionStorage.setItem("test", "test");
      window.sessionStorage.removeItem("test");
    } catch (storageError) {
      console.error("[savePaymentForm] SessionStorage is not available:", storageError);
    }
    return false;
  }
}

// Helper function to find payment form with fallback matching
function findPaymentFormKey(reservationId: string): string | null {
  const exactKey = `${KEY_PREFIX}${reservationId}`;
  
  // Try exact match first
  if (window.sessionStorage.getItem(exactKey)) {
    return exactKey;
  }
  
  // Fallback: Find similar keys (e.g., "payment-form-10" vs "payment-form-010")
  const allKeys: string[] = [];
  for (let i = 0; i < window.sessionStorage.length; i++) {
    const k = window.sessionStorage.key(i);
    if (k && k.startsWith(KEY_PREFIX)) {
      allKeys.push(k);
    }
  }
  
  // Try to find a key that ends with the same digits
  const normalizedId = reservationId.replace(/\D/g, "");
  for (const key of allKeys) {
    const keyId = key.replace(KEY_PREFIX, "").replace(/\D/g, "");
    if (keyId === normalizedId) {
      return key;
    }
  }
  
  return null;
}

export function consumePaymentForm(
  reservationId: number | string,
  removeAfterConsume: boolean = true
): StoredPaymentForm | null {
  if (typeof window === "undefined") {
    console.warn("[consumePaymentForm] Window is undefined");
    return null;
  }

  const normalizedId = String(reservationId).replace(/\D/g, "");
  const expectedKey = `${KEY_PREFIX}${normalizedId}`;
  console.log("[consumePaymentForm] CALLED reservationId:", reservationId);
  console.log("[consumePaymentForm] Looking for key:", expectedKey);

  try {
    const foundKey = findPaymentFormKey(normalizedId);
    if (!foundKey) {
      console.warn("[consumePaymentForm] No payment form found in sessionStorage for reservationId:", normalizedId);
      return null;
    }
    
    const raw = window.sessionStorage.getItem(foundKey);
    console.log("[consumePaymentForm] RAW value:", raw);
    if (!raw) {
      console.warn("[consumePaymentForm] Key found but value is null:", foundKey);
      return null;
    }
    
    const parsed = JSON.parse(raw) as StoredPaymentForm;
    
    if (removeAfterConsume) {
      window.sessionStorage.removeItem(foundKey);
    }
    
    return parsed;
  } catch (error) {
    console.error("[consumePaymentForm] Error parsing payment form:", error);
    return null;
  }
}

// Helper function to remove payment form after successful render
export function removePaymentForm(reservationId: number | string): void {
  if (typeof window === "undefined") {
    return;
  }
  
  const normalizedId = String(reservationId).replace(/\D/g, "");
  const key = findPaymentFormKey(normalizedId);
  if (key) {
    window.sessionStorage.removeItem(key);
  }
}


