import type { User } from "@/lib/types"

// Mock user data
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@bouncyrent.com",
    password: "password123", // In a real app, passwords would be hashed
    firstName: "John",
    lastName: "Doe",
    role: "admin",
  },
  {
    id: "2",
    email: "user@bouncyrent.com",
    password: "password123",
    firstName: "Jane",
    lastName: "Smith",
    role: "user",
  },
]

// Login function
export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Find user with matching credentials
  const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  // Create mock JWT token
  const mockToken = `mock_jwt_${user.id}_${Date.now()}`

  // Store token in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", mockToken)
  }

  // Return user data (without password)
  const { password: _, ...userData } = user

  return {
    user: userData as User,
    token: mockToken,
  }
}

// Logout function
export async function logout(): Promise<void> {
  // Simply remove the token from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
  }
}

// Get current user function
export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("auth_token")
  if (!token) return null

  // In a real app, we would validate the token
  // For mock purposes, we'll extract the user ID from the token
  const userId = token.split("_")[2]
  const user = MOCK_USERS.find((u) => u.id === userId)

  if (!user) {
    localStorage.removeItem("auth_token")
    return null
  }

  // Return user data (without password)
  const { password: _, ...userData } = user
  return userData as User
}

// Register function
export async function register(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<{ user: User; token: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Check if user already exists
  if (MOCK_USERS.some((u) => u.email === userData.email)) {
    throw new Error("User already exists")
  }

  // Create new user
  const newUser = {
    id: `${MOCK_USERS.length + 1}`,
    ...userData,
    role: "user",
  }

  // In a real app, we would save this to a database
  // For mock purposes, we'll just add it to our array
  MOCK_USERS.push(newUser)

  // Create mock JWT token
  const mockToken = `mock_jwt_${newUser.id}_${Date.now()}`

  // Store token in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", mockToken)
  }

  // Return user data (without password)
  const { password: _, ...newUserData } = newUser

  return {
    user: newUserData as User,
    token: mockToken,
  }
}

// API request helper with authentication
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // This is a mock implementation
  // In a real app, this would make actual API calls

  let token = null
  if (typeof window !== "undefined") {
    token = localStorage.getItem("auth_token")
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock responses based on endpoint
  if (endpoint === "/auth/me") {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")
    return { user } as unknown as T
  }

  // Default mock response
  return { success: true } as unknown as T
}
