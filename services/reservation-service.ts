// services/reservation-service.ts
import { Reservation, ReservationStatus } from "@/app/types/types";

export async function getReservations(): Promise<Reservation[]> {
  const res = await fetch("/api/reservations");
  if (!res.ok) throw new Error("Failed to fetch reservations");
  return res.json();
}

export async function getReservation(id: string): Promise<Reservation> {
  const res = await fetch(`/api/reservations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch reservation");
  return res.json();
}

export async function createReservation(
  data: Partial<Reservation>
): Promise<Reservation> {
  const res = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create reservation");
  return res.json();
}

export async function updateReservation(
  id: string,
  data: Partial<Reservation>
): Promise<Reservation> {
  const res = await fetch(`/api/reservations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update reservation");
  return res.json();
}

export async function deleteReservation(id: string): Promise<void> {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`/api/reservations/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to cancel reservation");
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<Reservation> {
  const res = await fetch(`/api/reservations/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update reservation status");
  return res.json();
}

export async function getReservationsForCalendar(): Promise<any[]> {
  const res = await fetch("/api/reservations/calendar");
  if (!res.ok) throw new Error("Failed to fetch calendar reservations");
  return res.json();
}

export async function checkAttractionAvailability(
  attractionId: string,
  startDate: string,
  endDate: string
): Promise<{ available: boolean }> {
  const res = await fetch("/api/reservations/check-availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attractionId, startDate, endDate }),
  });
  if (!res.ok) throw new Error("Failed to check availability");
  return res.json();
}
