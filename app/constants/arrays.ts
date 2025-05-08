import type { ReservationStatus } from "@/app/types/types";

export const RESERVATION_STATUSES: ReservationStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];
