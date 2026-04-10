import api from "./api";
import type { Product, ProductCreateRequest } from "../utils/interfaces";
import {
  createProductRequestSchema,
  productSchema,
  productsSchema,
} from "./apiSchemas";

export async function findAllProducts(): Promise<Product[]> {
  const { data } = await api.get<unknown>("/products");
  return productsSchema.parse(data);
}

export async function findProductById(id: string): Promise<Product> {
  const { data } = await api.get<unknown>(`/products/${id}`);
  return productSchema.parse(data);
}

export async function createProduct(
  payload: ProductCreateRequest,
): Promise<void> {
  const validatedPayload = createProductRequestSchema.parse(payload);
  await api.post("/products", validatedPayload);
}
