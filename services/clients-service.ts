import { apiRequest } from "@/lib/api-client";
import type { Client } from "@/app/types/types";

interface GetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetClientsResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Funkcja pomocnicza do sprawdzania, czy odpowiedź ma format paginacji
function isPaginatedResponse(response: any): response is GetClientsResponse {
  return (
    response &&
    Array.isArray(response.data) &&
    typeof response.total === "number" &&
    typeof response.page === "number" &&
    typeof response.limit === "number" &&
    typeof response.totalPages === "number"
  );
}

export async function getClients(
  params?: GetClientsParams
): Promise<GetClientsResponse> {
  const { page = 1, limit = 10, search = "" } = params || {};

  let url = "/clients";
  const queryParams = new URLSearchParams();

  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());
  if (search) queryParams.append("search", search);

  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  try {
    const response = await apiRequest(url);

    // Sprawdź, czy odpowiedź ma już format paginacji
    if (isPaginatedResponse(response)) {
      return response;
    }

    // Jeśli API nie zwraca jeszcze formatu paginacji, przekształć odpowiedź
    const clients = Array.isArray(response) ? response : [];

    // Filtrowanie klientów na podstawie wyszukiwania
    let filteredClients = clients;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredClients = clients.filter(
        (client) =>
          client.firstName.toLowerCase().includes(searchLower) ||
          client.lastName.toLowerCase().includes(searchLower) ||
          (client.email && client.email.toLowerCase().includes(searchLower)) ||
          client.phone.includes(search) ||
          (client.companyName &&
            client.companyName.toLowerCase().includes(searchLower)) ||
          (client.taxId && client.taxId.includes(search))
      );
    }

    // Obliczanie całkowitej liczby stron
    const total = filteredClients.length;
    const totalPages = Math.ceil(total / limit);

    // Pobieranie klientów dla bieżącej strony
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);

    return {
      data: paginatedClients,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
}

export async function getClient(id: string): Promise<Client> {
  return apiRequest(`/clients/${id}`);
}

export async function createClient(
  data: Omit<Client, "id" | "createdAt">
): Promise<Client> {
  return apiRequest("/clients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateClient(
  id: string,
  data: Partial<Omit<Client, "id" | "createdAt">>
): Promise<Client> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(`/api/clients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Update failed");
  }

  return response.json();
}

export async function deleteClient(id: string): Promise<void> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(`/api/clients/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Delete failed");
  }
}
