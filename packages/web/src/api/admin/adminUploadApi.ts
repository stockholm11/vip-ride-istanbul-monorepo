import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Add auth token if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function uploadImage(file: File, type: "vehicle" | "tour"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(`/api/admin/upload?type=${type}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.url; // Full URL (Hostinger or Render)
}

