import api from "./api";
import type { User, LoginRequest, LoginResponse } from "../utils/interfaces";
import { loginResponseSchema, userSchema } from "./apiSchemas";
import {
  saveToken,
  saveUser,
  getToken,
  getStoredUserRaw,
  clearAuth,
  isValidJwt,
} from "./tokenStorage";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<unknown>("/auth/login", credentials);
  const parsedData = loginResponseSchema.parse(data);

  const token = parsedData.accessToken;
  if (!isValidJwt(token)) {
    throw new Error("Token JWT inválido recebido do servidor");
  }

  saveToken(token);
  saveUser(parsedData.user);

  return parsedData;
}

export function logout(): void {
  clearAuth();
}

export function getStoredUser(): User | null {
  const raw = getStoredUserRaw();
  if (!raw || raw === "undefined") return null;

  try {
    const parsedRaw = JSON.parse(raw);
    const parsedUser = userSchema.safeParse(parsedRaw);

    return parsedUser.success ? parsedUser.data : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export { getToken };
