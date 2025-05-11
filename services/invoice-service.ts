import { apiRequest } from "@/lib/api-client";
import type { Invoice } from "@/app/types/types";

export const getInvoices = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);

    const response = await fetch(`/api/invoices?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to fetch invoices");
    }

    const data = await response.json();
    console.log("API response:", data);
    return data.data || [];
  } catch (error) {
    console.error("Error in getInvoices:", error);
    throw error;
  }
};

export const getInvoice = async (id: string) => {
  try {
    const response = await fetch(`/api/invoices/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch invoice: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    throw error;
  }
};

export async function createInvoice(data: Partial<Invoice>): Promise<Invoice> {
  return apiRequest("/invoices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInvoice(
  id: string,
  data: Partial<Invoice>
): Promise<Invoice> {
  return apiRequest(`/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  return apiRequest(`/invoices/${id}`, {
    method: "DELETE",
  });
}
