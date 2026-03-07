import type { ProductStatus } from "./types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Product {
  id: number;
  productName: string;
  productCode: string;
  price: number;
  quantity: number;
  description: string;
  status: ProductStatus;
}
