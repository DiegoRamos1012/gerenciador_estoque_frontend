import { z } from "zod";
import type {
  LoginResponse,
  Product,
  ProductCreateRequest,
  User,
} from "../utils/interfaces";
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

export const createProductRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(120, "Nome deve ter no máximo 120 caracteres"),
  productCode: z
    .string()
    .trim()
    .min(1, "Código do produto é obrigatório")
    .max(40, "Código do produto deve ter no máximo 40 caracteres"),
  price: z
    .number()
    .finite("Preço inválido")
    .min(0, "Preço não pode ser negativo"),
  quantity: z
    .number()
    .int("Quantidade deve ser um número inteiro")
    .min(0, "Quantidade não pode ser negativa"),
  description: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória")
    .max(500, "Descrição deve ter no máximo 500 caracteres"),
  status: productStatusSchema,
}) satisfies z.ZodType<ProductCreateRequest>;

export const createProductFormSchema = z
  .object({
    name: z.string(),
    productCode: z.string(),
    price: z.coerce.number(),
    quantity: z.coerce.number(),
    description: z.string(),
    status: productStatusSchema,
  })
  .pipe(createProductRequestSchema);

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
