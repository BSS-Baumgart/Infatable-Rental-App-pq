export type ReservationStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export type InvoiceStatus = "paid" | "unpaid";

export type DocumentRelationType = "attraction" | "reservation";

export interface ReservationAttraction {
  attractionId: string;
  attraction: Attraction;
  quantity: number;
}

export type UserRole = "admin" | "employee" | "manager" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  // createdAt: string;
};

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  street: string;
  buildingNumber: string;
  postalCode: string;
  city: string;
  createdAt: Date;
}

export interface Attraction {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  price: number;
  setupTime: number;
  image?: string;
  maintenanceRecords?: MaintenanceRecord[];
}

export interface Reservation {
  id: string;
  clientId: string;
  client?: Client;
  attractions: ReservationAttraction[];
  status: ReservationStatus;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedUsers: string[];
  cancelledAt?: Date;
  cancelledBy?: User;
}

export interface Invoice {
  id: string;
  reservationId: string;
  reservation?: Reservation;
  clientId?: string;
  client?: Client;
  issueDate: Date;
  dueDate: Date;
  amount: number;
  status: InvoiceStatus;
  pdfUrl?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  relatedTo?: {
    type: DocumentRelationType;
    id: string;
  };
  description?: string;
}

export interface MaintenanceRecord {
  id: string;
  attractionId: string;
  date: Date;
  description: string;
  cost: number;
  performedBy: string;
  images?: string[];
  createdAt: Date;
}
