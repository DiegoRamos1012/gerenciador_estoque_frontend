import type { AxiosError } from "axios";

export function getAxiosErrorMessage(error: AxiosError, fallback: string) {
  const responseData = error.response?.data;

  if (!responseData || typeof responseData !== "object") {
    return fallback;
  }

  const typedData = responseData as { message?: string; error?: string };
  return typedData.message ?? typedData.error ?? fallback;
}

export function getAxiosFieldErrors(error: AxiosError): Record<string, string> {
  const responseData = error.response?.data;
  if (!responseData || typeof responseData !== "object") {
    return {};
  }

  const data = responseData as {
    errors?: unknown;
    fieldErrors?: unknown;
  };

  const source = data.fieldErrors ?? data.errors;
  if (!source) return {};

  if (Array.isArray(source)) {
    const mapped = source.reduce<Record<string, string>>((acc, item) => {
      if (!item || typeof item !== "object") return acc;

      const typedItem = item as { field?: unknown; message?: unknown };
      if (
        typeof typedItem.field === "string" &&
        typeof typedItem.message === "string"
      ) {
        acc[typedItem.field] = typedItem.message;
      }

      return acc;
    }, {});

    return mapped;
  }

  if (typeof source === "object") {
    return Object.entries(source as Record<string, unknown>).reduce<
      Record<string, string>
    >((acc, [key, value]) => {
      if (typeof value === "string") {
        acc[key] = value;
      } else if (Array.isArray(value) && typeof value[0] === "string") {
        acc[key] = value[0];
      }

      return acc;
    }, {});
  }

  return {};
}
