import { z } from "zod";
import type { LoginResponse, Product, User } from "../utils/interfaces";
import { PRODUCT_STATUS_VALUES } from "../utils/types";

const productStatusSchema = z.enum(PRODUCT_STATUS_VALUES);

const apiProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  productCode: z.string(),
  price: z.number(),
  quantity: z.number(),
  description: z.string(),
  status: productStatusSchema,
  createdAt: z.string(),
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
    createdAt: apiProduct.createdAt,
  }),
);

export const productsSchema = z.array(productSchema);

export const userSchema: z.ZodType<User> = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  createdAt: z.string(),
});

export const loginResponseSchema: z.ZodType<LoginResponse> = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  user: userSchema,
});
