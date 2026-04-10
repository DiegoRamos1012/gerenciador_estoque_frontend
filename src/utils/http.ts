import type { AxiosError } from "axios";

export function getAxiosErrorMessage(error: AxiosError, fallback: string) {
  const responseData = error.response?.data;

  if (!responseData || typeof responseData !== "object") {
    return fallback;
  }

  const typedData = responseData as { message?: string; error?: string };
  return typedData.message ?? typedData.error ?? fallback;
}
