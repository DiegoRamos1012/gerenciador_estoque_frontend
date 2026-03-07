import api from "./api";
import type { User, LoginRequest, LoginResponse } from "../utils/interfaces";
import {
  saveToken,
  saveUser,
  getToken,
  getStoredUserRaw,
  clearAuth,
  isValidJwt,
} from "./tokenStorage";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);

  const token = data.accessToken;
  if (!isValidJwt(token)) {
    throw new Error("Token JWT inválido recebido do servidor");
  }

  saveToken(token);
  saveUser(data.user);

  return data;
}

export function logout(): void {
  clearAuth();
}

export function getStoredUser(): User | null {
  const raw = getStoredUserRaw();
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

export { getToken };
