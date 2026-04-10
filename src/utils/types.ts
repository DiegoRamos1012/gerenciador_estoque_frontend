export const USER_ROLE_VALUES = ["EMPLOYEE", "MANAGER", "ADMIN"] as const;

export type userRole = (typeof USER_ROLE_VALUES)[number];

export const PRODUCT_STATUS_VALUES = [
  "ACTIVE",
  "INACTIVE",
  "OUT_OF_STOCK",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUS_VALUES)[number];

export type CreatedAtFilter =
  | "ALL"
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "LAST_90_DAYS";
