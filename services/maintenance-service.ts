import type { MaintenanceRecord } from "@/app/types/types";

export async function getMaintenanceRecords(
  attractionId?: string
): Promise<MaintenanceRecord[]> {
  const url = attractionId
    ? `/api/maintenance-records?attractionId=${attractionId}`
    : "/api/maintenance-records";

  const token = localStorage.getItem("auth_token");

  const res = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Failed to fetch maintenance records");
  return res.json();
}

export async function getMaintenanceRecord(
  id: string
): Promise<MaintenanceRecord> {
  const token = localStorage.getItem("auth_token");

  const res = await fetch(`/api/maintenance-records/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Failed to fetch maintenance record");
  return res.json();
}

export async function createMaintenanceRecord(
  data: Omit<MaintenanceRecord, "id" | "createdAt">
): Promise<MaintenanceRecord> {
  const token = localStorage.getItem("auth_token");

  const res = await fetch("/api/maintenance-records", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create maintenance record");
  return res.json();
}

export async function updateMaintenanceRecord(
  id: string,
  data: Partial<MaintenanceRecord>
): Promise<MaintenanceRecord> {
  const token = localStorage.getItem("auth_token");

  const res = await fetch(`/api/maintenance-records/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update maintenance record");
  return res.json();
}

export async function deleteMaintenanceRecord(id: string): Promise<void> {
  const token = localStorage.getItem("auth_token");

  const res = await fetch(`/api/maintenance-records/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Failed to delete maintenance record");
}

export async function uploadMaintenanceImage(
  maintenanceId: string,
  file: File
): Promise<{ imageUrl: string; images: string[] }> {
  const token = localStorage.getItem("auth_token");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`/api/maintenance-records/${maintenanceId}/images`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload image");
  return res.json();
}

export async function deleteMaintenanceImage(
  maintenanceId: string,
  imageId: string
): Promise<{ images: string[] }> {
  const token = localStorage.getItem("auth_token");

  const res = await fetch(
    `/api/maintenance-records/${maintenanceId}/images/${imageId}`,
    {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!res.ok) throw new Error("Failed to delete image");
  return res.json();
}
