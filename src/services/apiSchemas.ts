import { z } from "zod";
import type { LoginResponse, Product, User } from "../utils/interfaces";
import { PRODUCT_STATUS_VALUES, USER_ROLE_VALUES } from "../utils/types";

const productStatusSchema = z.enum(PRODUCT_STATUS_VALUES);

const productDateSchema = z.string().optional();

const apiProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  productCode: z.string(),
  price: z.number(),
  quantity: z.number(),
  description: z.string().default(""),
  status: productStatusSchema,
  lastTimeChanged: productDateSchema,
  createdAt: productDateSchema,
  created_at: productDateSchema,
  createdDate: productDateSchema,
});

export const productSchema = apiProductSchema.transform(
  (apiProduct): Product => ({
    id: apiProduct.id,
    productName: apiProduct.name,
    productCode: apiProduct.productCode,
    price: apiProduct.price,
    quantity: apiProduct.quantity,
    description: apiProduct.description,
    status: apiProduct.status,
    createdAt:
      apiProduct.lastTimeChanged ??
      apiProduct.createdAt ??
      apiProduct.created_at ??
      apiProduct.createdDate ??
      new Date(0).toISOString(),
  }),
);

export const productsSchema = z.array(productSchema);

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(USER_ROLE_VALUES),
  createdAt: z.string(),
}) satisfies z.ZodType<User>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  user: userSchema,
}) satisfies z.ZodType<LoginResponse>;
