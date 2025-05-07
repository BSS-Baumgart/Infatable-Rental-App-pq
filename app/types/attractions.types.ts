import { Attraction } from "@/app/types/types";

export type CreateAttractionInput = Omit<
  Attraction,
  "id" | "createdAt" | "updatedAt" | "maintenanceRecords"
>;
