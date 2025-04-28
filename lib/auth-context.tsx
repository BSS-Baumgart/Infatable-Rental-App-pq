"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser, login as loginApi, logout as logoutApi } from "./auth"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  error: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error("Error loading user:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { user } = await loginApi(email, password)
      setUser(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await logoutApi()
      setUser(null)
    } catch (err) {
      console.error("Error during logout:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
