import api from "./api";
import type { User } from "../utils/interfaces";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);

  const token = data.accessToken;
  if (!token || typeof token !== "string" || token.split(".").length !== 3) {
    throw new Error("Token JWT inválido recebido do servidor");
  }

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem("user");
  if (!raw || raw === "undefined") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
