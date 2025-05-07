import { User } from "../app/types/types";

const API_BASE = "/api";

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  const { user, token } = await response.json();

  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }

  return { user, token };
}

export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (!token) return null;

  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  const { user } = await response.json();
  return user;
}
