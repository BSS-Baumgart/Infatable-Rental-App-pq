// User types
export type UserRole = "admin" | "employee"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  permissions?: {
    components: Record<string, boolean>
    actions: Record<string, Record<string, boolean>>
  }
}

// Client types
export interface Client {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  street: string
  buildingNumber: string
  postalCode: string
  city: string
  createdAt: Date
}

// Attraction types
export interface Attraction {
  id: string
  name: string
  width: number // in cm
  height: number // in cm
  length: number // in cm
  weight: number // in kg
  price: number
  setupTime: number // in minutes
  image?: string
  documents?: Document[]
}

// Reservation types
export type ReservationStatus = "pending" | "in-progress" | "completed" | "cancelled"

export interface ReservationAttraction {
  attractionId: string
  attraction: Attraction
  quantity: number
}

export interface Reservation {
  id: string
  clientId: string
  client: Client
  attractions: ReservationAttraction[]
  status: ReservationStatus
  startDate: Date
  endDate: Date
  totalPrice: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Invoice types
export type InvoiceStatus = "paid" | "unpaid"

export interface Invoice {
  id: string
  reservationId: string
  reservation: Reservation
  clientId: string
  client: Client
  issueDate: Date
  dueDate: Date
  amount: number
  status: InvoiceStatus
  pdfUrl?: string
}

// Document types
export type DocumentRelationType = "attraction" | "reservation"

export interface DocumentRelation {
  type: DocumentRelationType
  id: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: number // in bytes
  url: string
  uploadedAt: Date
  relatedTo?: DocumentRelation
}
