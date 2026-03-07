const TOKEN_KEY = "token";
const USER_KEY = "user";

function isValidJwt(token: unknown): token is string {
  return typeof token === "string" && token.split(".").length === 3;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 < Date.now() - 30_000;
}

export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function saveUser(user: unknown): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token || !isValidJwt(token)) return null;

  if (isTokenExpired(token)) {
    clearAuth();
    return null;
  }
  return token;
}

export function getStoredUserRaw(): string | null {
  return sessionStorage.getItem(USER_KEY);
}

export function clearAuth(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export { isValidJwt };
