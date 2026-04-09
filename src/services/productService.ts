import api from "./api";
import type { Product } from "../utils/interfaces";
import { productSchema, productsSchema } from "./apiSchemas";

export async function findAllProducts(): Promise<Product[]> {
  const { data } = await api.get<unknown>("/products");
  return productsSchema.parse(data);
}

export async function findProductById(id: string): Promise<Product> {
  const { data } = await api.get<unknown>(`/products/${id}`);
  return productSchema.parse(data);
}
