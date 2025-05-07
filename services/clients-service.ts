import { apiRequest } from "@/lib/api-client";
import type { Client } from "@/app/types/types";

export async function getClients(): Promise<Client[]> {
  return apiRequest("/clients");
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
