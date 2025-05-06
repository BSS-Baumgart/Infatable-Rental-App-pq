import { CreateAttractionInput } from "@/app/types/attractions.types";
import type { Attraction } from "@/app/types/types";

export async function getAttractions(): Promise<Attraction[]> {
  const res = await fetch("/api/attractions");
  if (!res.ok) throw new Error("Failed to fetch attractions");
  return res.json();
}

export async function createAttraction(
  data: CreateAttractionInput
): Promise<Attraction> {
  const token = localStorage.getItem("auth_token");

  console.log("createAttraction input param data " + JSON.stringify(data));
  const res = await fetch("/api/attractions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create attraction");
  return res.json();
}

export async function updateAttraction(
  id: string,
  data: Partial<Attraction>
): Promise<Attraction> {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`/api/attractions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update attraction");
  return res.json();
}

export async function deleteAttraction(id: string): Promise<void> {
  const res = await fetch(`/api/attractions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete attraction");
}
