# BouncyRent - Backend Implementation Guide

## Overview

This document outlines the backend architecture for the BouncyRent application, including database structure, API endpoints, and instructions for integrating the frontend with the backend.

## Table of Contents

1. [Backend Architecture](#backend-architecture)
2. [Database Structure](#database-structure)
3. [API Endpoints](#api-endpoints)
4. [Frontend Integration](#frontend-integration)
5. [Authentication & Authorization](#authentication--authorization)
6. [Implementation Recommendations](#implementation-recommendations)

## Backend Architecture

The BouncyRent backend should be implemented as a RESTful API service that handles:
- User authentication and authorization
- CRUD operations for all entities (clients, attractions, reservations, etc.)
- Business logic for reservation management
- File storage for documents and images
- Email notifications

### Recommended Technology Stack

- **Framework**: Node.js with Express or Next.js API routes
- **Database**: PostgreSQL or MySQL for relational data
- **ORM**: Prisma or TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3 or Vercel Blob
- **Email Service**: SendGrid, Mailgun, or AWS SES

## Database Structure

### Entity Relationship Diagram

\`\`\`
User 1:N Reservation
Client 1:N Reservation
Attraction N:M Reservation (through ReservationAttraction)
Reservation 1:N Invoice
Attraction 1:N MaintenanceRecord
Document N:1 (Attraction | Reservation)
\`\`\`

### Database Tables

#### Users
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'admin', 'employee', 'manager', 'viewer'
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Clients
\`\`\`sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  street VARCHAR(255) NOT NULL,
  building_number VARCHAR(20) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Attractions
\`\`\`sql
CREATE TABLE attractions (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  length INTEGER NOT NULL,
  weight INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  setup_time INTEGER NOT NULL,
  image_url VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Reservations
\`\`\`sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  status VARCHAR(20) NOT NULL, -- 'pending', 'in-progress', 'completed', 'cancelled'
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);
\`\`\`

#### ReservationAttractions (Junction Table)
\`\`\`sql
CREATE TABLE reservation_attractions (
  id UUID PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES reservations(id),
  attraction_id UUID NOT NULL REFERENCES attractions(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_reservation DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Invoices
\`\`\`sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES reservations(id),
  issue_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'paid', 'unpaid'
  pdf_url VARCHAR(255),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Documents
\`\`\`sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  url VARCHAR(255) NOT NULL,
  related_type VARCHAR(50) NOT NULL, -- 'attraction', 'reservation'
  related_id UUID NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by UUID REFERENCES users(id)
);
\`\`\`

#### MaintenanceRecords
\`\`\`sql
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY,
  attraction_id UUID NOT NULL REFERENCES attractions(id),
  date TIMESTAMP NOT NULL,
  description TEXT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  performed_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### MaintenanceImages
\`\`\`sql
CREATE TABLE maintenance_images (
  id UUID PRIMARY KEY,
  maintenance_record_id UUID NOT NULL REFERENCES maintenance_records(id),
  url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Settings
\`\`\`sql
CREATE TABLE settings (
  id UUID PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user and return JWT token |
| POST | `/api/auth/register` | Register a new user (admin only) |
| POST | `/api/auth/logout` | Invalidate current token |
| GET | `/api/auth/me` | Get current user information |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (admin only) |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create a new user (admin only) |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user (admin only) |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | Get all clients with pagination and filtering |
| GET | `/api/clients/:id` | Get client by ID |
| POST | `/api/clients` | Create a new client |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client |

### Attractions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attractions` | Get all attractions with pagination and filtering |
| GET | `/api/attractions/:id` | Get attraction by ID with maintenance records |
| POST | `/api/attractions` | Create a new attraction |
| PUT | `/api/attractions/:id` | Update attraction |
| DELETE | `/api/attractions/:id` | Delete attraction |
| GET | `/api/attractions/popular` | Get popular attractions |
| GET | `/api/attractions/availability` | Check attraction availability for date range |

### Reservations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reservations` | Get all reservations with pagination, filtering, and sorting |
| GET | `/api/reservations/:id` | Get reservation by ID with client and attractions |
| POST | `/api/reservations` | Create a new reservation |
| PUT | `/api/reservations/:id` | Update reservation |
| DELETE | `/api/reservations/:id` | Delete reservation |
| PUT | `/api/reservations/:id/status` | Update reservation status |
| GET | `/api/reservations/calendar` | Get reservations for calendar view |
| POST | `/api/reservations/check-availability` | Check availability for new reservation |

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | Get all invoices with pagination and filtering |
| GET | `/api/invoices/:id` | Get invoice by ID |
| POST | `/api/invoices` | Create a new invoice |
| PUT | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |
| PUT | `/api/invoices/:id/status` | Mark invoice as paid/unpaid |
| GET | `/api/invoices/:id/download` | Download invoice PDF |
| POST | `/api/invoices/:id/send` | Send invoice by email |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | Get all documents with pagination and filtering |
| GET | `/api/documents/:id` | Get document by ID |
| POST | `/api/documents` | Upload a new document |
| PUT | `/api/documents/:id` | Update document metadata |
| DELETE | `/api/documents/:id` | Delete document |
| GET | `/api/documents/:id/download` | Download document |

### Maintenance Records

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/maintenance-records` | Get all maintenance records |
| GET | `/api/maintenance-records/:id` | Get maintenance record by ID |
| POST | `/api/maintenance-records` | Create a new maintenance record |
| PUT | `/api/maintenance-records/:id` | Update maintenance record |
| DELETE | `/api/maintenance-records/:id` | Delete maintenance record |
| POST | `/api/maintenance-records/:id/images` | Upload images for maintenance record |
| DELETE | `/api/maintenance-records/:id/images/:imageId` | Delete maintenance record image |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/generate` | Generate custom report |
| GET | `/api/reports/download/:filename` | Download generated report |
| GET | `/api/reports/revenue` | Get revenue statistics |
| GET | `/api/reports/reservations` | Get reservation statistics |

### Client-Facing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/attractions` | Get public attraction information |
| POST | `/api/public/reservations` | Submit a reservation request |
| GET | `/api/public/reservation/:confirmationCode` | Check reservation status |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/branding` | Get branding settings (logo, favicon) |
| POST | `/api/settings/branding/logo` | Upload and update company logo |
| POST | `/api/settings/branding/favicon` | Upload and update favicon |

## Frontend Integration

To integrate the frontend with the backend, you'll need to replace the mock data services with actual API calls. Here are the key files that need to be updated:

### 1. Authentication Service

Replace the mock authentication in `lib/auth.ts` with real API calls:

\`\`\`typescript
// lib/auth.ts
export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Invalid credentials');
  }
  
  const data = await response.json();
  
  // Store token in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", data.token);
  }
  
  return data;
}

// Similar updates for logout, getCurrentUser, register functions
\`\`\`

### 2. API Request Helper

Create a helper function for making authenticated API requests:

\`\`\`typescript
// lib/api-client.ts
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("auth_token");
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `API request failed with status ${response.status}`);
  }
  
  return response.json();
}
\`\`\`

### 3. Data Services

Create service files for each entity to handle API calls:

\`\`\`typescript
// services/clients-service.ts
import { apiRequest } from '../lib/api-client';
import type { Client } from '../lib/types';

export async function getClients(params?: { page?: number, limit?: number, search?: string }): Promise<{ data: Client[], total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  
  return apiRequest<{ data: Client[], total: number }>(`/clients?${queryParams.toString()}`);
}

export async function getClient(id: string): Promise<Client> {
  return apiRequest<Client>(`/clients/${id}`);
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  return apiRequest<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify(client),
  });
}

export async function updateClient(id: string, client: Partial<Client>): Promise<Client> {
  return apiRequest<Client>(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(client),
  });
}

export async function deleteClient(id: string): Promise<void> {
  return apiRequest<void>(`/clients/${id}`, {
    method: 'DELETE',
  });
}
\`\`\`

### 4. Replace Mock Data in Components

Update each component that currently uses mock data to use the service functions instead. For example:

\`\`\`typescript
// app/clients/page.tsx
"use client"

import { useState, useEffect } from "react"
import { getClients, deleteClient } from "@/services/clients-service"
// ... other imports

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  // ... other state variables
  
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const { data } = await getClients({ search: searchTerm })
        setClients(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clients")
      } finally {
        setLoading(false)
      }
    }
    
    fetchClients()
  }, [searchTerm])
  
  const handleDeleteClient = async (id: string) => {
    if (confirm(t("clients.confirmDelete"))) {
      try {
        await deleteClient(id)
        setClients((prev) => prev.filter((c) => c.id !== id))
        toast({
          title: t("clients.deleted"),
          description: t("clients.deleteSuccess"),
        })
      } catch (err) {
        toast({
          title: t("common.error"),
          description: err instanceof Error ? err.message : "Failed to delete client",
          variant: "destructive",
        })
      }
    }
  }
  
  // ... rest of the component
}
\`\`\`

### 5. File Upload Components

For components that handle file uploads (like document uploads), use FormData:

\`\`\`typescript
// services/documents-service.ts
export async function uploadDocument(file: File, metadata: { 
  name: string, 
  relatedType: string, 
  relatedId: string,
  description?: string 
}): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));
  
  const token = localStorage.getItem("auth_token");
  
  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload document');
  }
  
  return response.json();
}
\`\`\`

### 6. Email Service

Replace the mock email service with a real implementation:

\`\`\`typescript
// services/email-service.ts
import { apiRequest } from '../lib/api-client';

export async function sendConfirmationEmail(params: {
  to: string;
  subject: string;
  firstName: string;
  lastName: string;
  reservationDate: string;
  attractions: Array<{ name: string; price: number }>;
  totalPrice: number;
  confirmationCode?: string;
}): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>('/emails/confirmation', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
\`\`\`

### 7. Branding and Settings Service

Create a service for managing branding and application settings:

\`\`\`typescript
// services/settings-service.ts
import { apiRequest } from '../lib/api-client';

export async function getBrandingSettings(): Promise<{ logoUrl: string; faviconUrl: string }> {
  return apiRequest<{ logoUrl: string; faviconUrl: string }>('/settings/branding');
}

export async function uploadLogo(file: File): Promise<{ logoUrl: string }> {
  const formData = new FormData();
  formData.append('logo', file);
  
  const token = localStorage.getItem("auth_token");
  
  const response = await fetch('/api/settings/branding/logo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload logo');
  }
  
  return response.json();
}

export async function uploadFavicon(file: File): Promise<{ faviconUrl: string }> {
  const formData = new FormData();
  formData.append('favicon', file);
  
  const token = localStorage.getItem("auth_token");
  
  const response = await fetch('/api/settings/branding/favicon', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload favicon');
  }
  
  return response.json();
}
\`\`\`

## Authentication & Authorization

### JWT Implementation

1. When a user logs in, the server generates a JWT token containing the user's ID and role.
2. The token is sent to the client and stored in localStorage.
3. For each subsequent request, the token is included in the Authorization header.
4. The server validates the token and extracts the user information.

### Role-Based Access Control

Implement middleware on the server to check user roles for protected routes:

\`\`\`typescript
// Example middleware for Next.js API routes
export function withAuth(handler: NextApiHandler, allowedRoles?: string[]): NextApiHandler {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Verify token and extract user info
      const user = verifyToken(token);
      
      // Check role if specified
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      // Add user to request object
      req.user = user;
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}
\`\`\`

## Implementation Recommendations

### 1. Database Setup

Use Prisma ORM for type-safe database access:

\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

Define your schema in `prisma/schema.prisma` based on the database structure outlined above.

### 2. API Routes Implementation

For a Next.js application, implement API routes in the `app/api` directory:

\`\`\`typescript
// app/api/clients/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Authenticate user
    const user = await auth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build search conditions
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        }
      : {};
    
    // Fetch clients with pagination
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);
    
    return NextResponse.json({
      data: clients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await auth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const { firstName, lastName, phone, street, buildingNumber, postalCode, city } = body;
    if (!firstName || !lastName || !phone || !street || !buildingNumber || !postalCode || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create client
    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        phone,
        email: body.email,
        street,
        buildingNumber,
        postalCode,
        city,
      },
    });
    
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
\`\`\`

### 3. File Storage

Use Vercel Blob for file storage:

\`\`\`typescript
// app/api/documents/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await auth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadataStr = formData.get('metadata') as string;
    const metadata = JSON.parse(metadataStr);
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });
    
    // Save document metadata to database
    const document = await prisma.document.create({
      data: {
        name: metadata.name || file.name,
        type: file.type,
        size: file.size,
        url: blob.url,
        relatedType: metadata.relatedType,
        relatedId: metadata.relatedId,
        description: metadata.description,
        uploadedBy: user.id,
      },
    });
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
\`\`\`

### 4. Email Service

Use a service like SendGrid for sending emails:

\`\`\`typescript
// lib/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM!,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
\`\`\`

### 5. Environment Variables

Create a `.env` file with necessary configuration:

\`\`\`
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bouncyrent"

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Email
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@bouncyrent.com"

# File Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
\`\`\`

## Deployment Considerations

1. **Database Migration**: Use Prisma migrations to manage database schema changes.
2. **Environment Variables**: Ensure all environment variables are set in your production environment.
3. **API Rate Limiting**: Implement rate limiting to prevent abuse.
4. **CORS Configuration**: Configure CORS to allow requests only from your frontend domain.
5. **Error Logging**: Set up error logging with a service like Sentry.
6. **Monitoring**: Implement health checks and monitoring for your API endpoints.
7. **Backups**: Set up regular database backups.

## Conclusion

This document provides a comprehensive guide for implementing the backend for the BouncyRent application. By following these recommendations, you can create a robust, scalable, and secure backend that integrates seamlessly with the existing frontend.

Remember to implement proper error handling, validation, and security measures throughout your backend implementation. Consider adding unit and integration tests to ensure the reliability of your API endpoints.
