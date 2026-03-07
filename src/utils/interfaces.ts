import type { ProductStatus } from "./types"

export interface User {
    id: number,
    name: string,
    email: string,
    password: string
}

export interface Product {
    id: number,
    productName: string,
    productCode: string,
    price: number,
    quantity: number,
    description: string,
    status: ProductStatus
}