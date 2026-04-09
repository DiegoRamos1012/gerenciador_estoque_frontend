import type { ProductStatus } from "./types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  productCode: string;
  price: number;
  quantity: number;
  description: string;
  status: ProductStatus;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}
