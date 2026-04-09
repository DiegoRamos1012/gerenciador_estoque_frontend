export type userRole = "EMPLOYEE" | "MANAGER" | "ADMIN";

export const PRODUCT_STATUS_VALUES = [
  "ACTIVE",
  "INACTIVE",
  "OUT_OF_STOCK",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUS_VALUES)[number];
