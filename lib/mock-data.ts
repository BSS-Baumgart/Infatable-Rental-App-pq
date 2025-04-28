import type { User, Client, Attraction, Reservation, Invoice, Document } from "./types"

// Mock Users
export const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "employee",
  },
]

// Mock Clients
export const clients: Client[] = [
  {
    id: "1",
    firstName: "Michael",
    lastName: "Johnson",
    phone: "+48 123 456 789",
    email: "michael.johnson@example.com",
    street: "Main Street",
    buildingNumber: "123",
    postalCode: "00-001",
    city: "Warsaw",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Williams",
    phone: "+48 987 654 321",
    email: "sarah.williams@example.com",
    street: "Oak Avenue",
    buildingNumber: "45",
    postalCode: "00-002",
    city: "Krakow",
    createdAt: new Date("2023-02-20"),
  },
  {
    id: "3",
    firstName: "Robert",
    lastName: "Brown",
    phone: "+48 555 123 456",
    street: "Pine Road",
    buildingNumber: "78",
    postalCode: "00-003",
    city: "Gdansk",
    createdAt: new Date("2023-03-10"),
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Davis",
    phone: "+48 111 222 333",
    email: "emily.davis@example.com",
    street: "Maple Lane",
    buildingNumber: "15",
    postalCode: "00-004",
    city: "Wroclaw",
    createdAt: new Date("2023-04-05"),
  },
  {
    id: "5",
    firstName: "Daniel",
    lastName: "Miller",
    phone: "+48 444 555 666",
    email: "daniel.miller@example.com",
    street: "Cedar Street",
    buildingNumber: "32",
    postalCode: "00-005",
    city: "Poznan",
    createdAt: new Date("2023-05-12"),
  },
]

// Mock Attractions
export const attractions: Attraction[] = [
  {
    id: "1",
    name: "Bouncy Castle - Princess",
    width: 300,
    height: 250,
    length: 300,
    weight: 80,
    price: 200,
    setupTime: 30,
    image: "/vibrant-kingdom-bounce.png",
  },
  {
    id: "2",
    name: "Bouncy Castle - Pirate",
    width: 350,
    height: 300,
    length: 350,
    weight: 100,
    price: 250,
    setupTime: 45,
    image: "/pirate-adventure-bounce.png",
  },
  {
    id: "3",
    name: "Inflatable Slide",
    width: 250,
    height: 400,
    length: 600,
    weight: 120,
    price: 300,
    setupTime: 60,
    image: "/giant-backyard-slide.png",
  },
  {
    id: "4",
    name: "Obstacle Course",
    width: 400,
    height: 200,
    length: 1000,
    weight: 150,
    price: 350,
    setupTime: 90,
    image: "/vibrant-inflatable-fun.png",
  },
  {
    id: "5",
    name: "Water Slide",
    width: 300,
    height: 450,
    length: 800,
    weight: 130,
    price: 320,
    setupTime: 75,
    image: "/placeholder.svg?key=x3r8y",
  },
  {
    id: "6",
    name: "Bouncy Castle - Superhero",
    width: 320,
    height: 270,
    length: 320,
    weight: 85,
    price: 220,
    setupTime: 35,
    image: "/colorful-kids-bounce-house.png",
  },
]

// Helper function to get random status
const getRandomStatus = <T extends string>(statuses: T[]): T => {
  return statuses[Math.floor(Math.random() * statuses.length)]
}

// Helper function to get random date in the next 30 days
const getRandomFutureDate = (daysAhead = 30): Date => {
  const date = new Date()
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead))
  return date
}

// Helper function to get random date in the past 30 days
const getRandomPastDate = (daysAgo = 30): Date => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

// Mock Reservations
export const reservations: Reservation[] = [
  {
    id: "1",
    clientId: "1",
    client: clients[0],
    attractions: [
      { attractionId: "1", attraction: attractions[0], quantity: 1 },
      { attractionId: "3", attraction: attractions[2], quantity: 1 },
    ],
    status: "pending",
    startDate: getRandomFutureDate(7),
    endDate: getRandomFutureDate(8),
    totalPrice: 500,
    notes: "Birthday party for 15 children",
    createdAt: getRandomPastDate(5),
    updatedAt: getRandomPastDate(3),
  },
  {
    id: "2",
    clientId: "2",
    client: clients[1],
    attractions: [{ attractionId: "2", attraction: attractions[1], quantity: 1 }],
    status: "in-progress",
    startDate: new Date(),
    endDate: getRandomFutureDate(1),
    totalPrice: 250,
    createdAt: getRandomPastDate(10),
    updatedAt: getRandomPastDate(5),
  },
  {
    id: "3",
    clientId: "3",
    client: clients[2],
    attractions: [
      { attractionId: "4", attraction: attractions[3], quantity: 1 },
      { attractionId: "5", attraction: attractions[4], quantity: 1 },
    ],
    status: "completed",
    startDate: getRandomPastDate(5),
    endDate: getRandomPastDate(4),
    totalPrice: 670,
    notes: "School event",
    createdAt: getRandomPastDate(15),
    updatedAt: getRandomPastDate(4),
  },
  {
    id: "4",
    clientId: "4",
    client: clients[3],
    attractions: [{ attractionId: "6", attraction: attractions[5], quantity: 2 }],
    status: "pending",
    startDate: getRandomFutureDate(15),
    endDate: getRandomFutureDate(16),
    totalPrice: 440,
    notes: "Twins birthday party",
    createdAt: getRandomPastDate(2),
    updatedAt: getRandomPastDate(2),
  },
  {
    id: "5",
    clientId: "5",
    client: clients[4],
    attractions: [
      { attractionId: "1", attraction: attractions[0], quantity: 1 },
      { attractionId: "2", attraction: attractions[1], quantity: 1 },
      { attractionId: "3", attraction: attractions[2], quantity: 1 },
    ],
    status: "pending",
    startDate: getRandomFutureDate(20),
    endDate: getRandomFutureDate(21),
    totalPrice: 750,
    notes: "Company event",
    createdAt: getRandomPastDate(1),
    updatedAt: getRandomPastDate(1),
  },
]

// Mock Invoices
export const invoices: Invoice[] = [
  {
    id: "1",
    reservationId: "3",
    reservation: reservations[2],
    clientId: "3",
    client: clients[2],
    issueDate: getRandomPastDate(3),
    dueDate: getRandomFutureDate(14),
    amount: 670,
    status: "paid",
    pdfUrl: "/documents/invoice-1.pdf",
  },
  {
    id: "2",
    reservationId: "2",
    reservation: reservations[1],
    clientId: "2",
    client: clients[1],
    issueDate: new Date(),
    dueDate: getRandomFutureDate(14),
    amount: 250,
    status: "unpaid",
  },
]

// Mock Documents
export const documents: Document[] = [
  {
    id: "1",
    name: "Princess Castle Certificate.pdf",
    type: "application/pdf",
    size: 1024 * 1024, // 1MB
    url: "/documents/certificate-1.pdf",
    uploadedAt: getRandomPastDate(60),
    relatedTo: {
      type: "attraction",
      id: "1",
    },
  },
  {
    id: "2",
    name: "Pirate Castle Safety Manual.pdf",
    type: "application/pdf",
    size: 2 * 1024 * 1024, // 2MB
    url: "/documents/manual-1.pdf",
    uploadedAt: getRandomPastDate(45),
    relatedTo: {
      type: "attraction",
      id: "2",
    },
  },
  {
    id: "3",
    name: "Invoice #001.pdf",
    type: "application/pdf",
    size: 512 * 1024, // 512KB
    url: "/documents/invoice-1.pdf",
    uploadedAt: getRandomPastDate(3),
    relatedTo: {
      type: "reservation",
      id: "3",
    },
  },
  {
    id: "4",
    name: "Obstacle Course Inspection.pdf",
    type: "application/pdf",
    size: 1.5 * 1024 * 1024, // 1.5MB
    url: "/documents/inspection-1.pdf",
    uploadedAt: getRandomPastDate(30),
    relatedTo: {
      type: "attraction",
      id: "4",
    },
  },
  {
    id: "5",
    name: "Water Slide Safety Guidelines.pdf",
    type: "application/pdf",
    size: 1.2 * 1024 * 1024, // 1.2MB
    url: "/documents/guidelines-1.pdf",
    uploadedAt: getRandomPastDate(20),
    relatedTo: {
      type: "attraction",
      id: "5",
    },
  },
]

// Dashboard statistics
export const dashboardStats = {
  totalReservations: reservations.length,
  totalClients: clients.length,
  totalAttractions: attractions.length,
  totalRevenue: reservations.reduce((sum, reservation) => sum + reservation.totalPrice, 0),
  reservationsByStatus: {
    pending: reservations.filter((r) => r.status === "pending").length,
    inProgress: reservations.filter((r) => r.status === "in-progress").length,
    completed: reservations.filter((r) => r.status === "completed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  },
  recentReservations: reservations.slice(0, 3),
  popularAttractions: [
    { attraction: attractions[0], count: 2 },
    { attraction: attractions[1], count: 2 },
    { attraction: attractions[2], count: 2 },
  ],
}
