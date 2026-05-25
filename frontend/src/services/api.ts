import { ApiResponse, Assignment, GeneratedPaper } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      cache: "no-store",
      headers: {
        ...(options?.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options?.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`API request failed: ${err}`);
    return {
      success: false,
      error: `Network error: ${err}`,
    };
  }
}

// Assignments API
export const assignmentsApi = {
  create: async (formData: FormData): Promise<ApiResponse<Assignment>> => {
    return apiRequest<Assignment>("/assignments", {
      method: "POST",
      body: formData,
    });
  },

  getAll: async (): Promise<ApiResponse<Assignment[]>> => {
    return apiRequest<Assignment[]>("/assignments");
  },

  getById: async (id: string): Promise<ApiResponse<Assignment>> => {
    return apiRequest<Assignment>(`/assignments/${id}`);
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>(`/assignments/${id}`, {
      method: "DELETE",
    });
  },

  getResult: async (id: string): Promise<ApiResponse<GeneratedPaper>> => {
    return apiRequest<GeneratedPaper>(`/assignments/${id}/result`);
  },

  regenerate: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>(`/assignments/${id}/regenerate`, {
      method: "POST",
    });
  },

  downloadPdf: async (id: string): Promise<Blob | null> => {
    try {
      const response = await fetch(`${API_BASE}/assignments/${id}/pdf`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`PDF download failed with status ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      const err = error instanceof Error ? error.message : "Unknown error";
      console.error(`PDF download failed: ${err}`);
      return null;
    }
  },
};

export default assignmentsApi;
