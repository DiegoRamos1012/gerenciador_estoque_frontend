import type { Product } from "./interfaces";
import type { CreatedAtFilter, ProductStatus } from "./types";

export const selectItemClassName =
  "cursor-pointer hover:bg-gray-200 focus:bg-gray-200 data-[state=checked]:bg-gray-300";

export const statusFilterOptions: Array<{
  value: ProductStatus | "ALL";
  label: string;
}> = [
  { value: "ALL", label: "Todos os status" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
  { value: "OUT_OF_STOCK", label: "Fora de Estoque" },
];

export const productStatusOptions: Array<{
  value: ProductStatus;
  label: string;
}> = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
  { value: "OUT_OF_STOCK", label: "Fora de Estoque" },
];

export const createdAtFilterOptions: Array<{
  value: CreatedAtFilter;
  label: string;
}> = [
  { value: "ALL", label: "Todos os períodos" },
  { value: "TODAY", label: "Adicionados Hoje" },
  { value: "LAST_7_DAYS", label: "Adicionados a 7 dias" },
  { value: "LAST_30_DAYS", label: "Adicionados a 30 dias" },
  { value: "LAST_90_DAYS", label: "Adicionados a 90 dias" },
];

export const statusLabel: Record<ProductStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  OUT_OF_STOCK: "Fora de Estoque",
};

export const statusClassName: Record<ProductStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-700 border-gray-200",
  OUT_OF_STOCK: "bg-amber-100 text-amber-700 border-amber-200",
};

type PreparedProduct = {
  product: Product;
  createdAtMs: number;
  searchableText: string;
};

function parseDateMs(dateString: string): number | null {
  const dateMs = Date.parse(dateString);
  return Number.isNaN(dateMs) ? null : dateMs;
}

function isWithinCreatedAtFilter(
  createdAtMs: number,
  filter: CreatedAtFilter,
  now: Date,
) {
  if (filter === "ALL") return true;

  const createdAt = new Date(createdAtMs);

  if (filter === "TODAY") {
    return createdAt.toDateString() === now.toDateString();
  }

  const diffMs = now.getTime() - createdAt.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (filter === "LAST_7_DAYS") return diffDays <= 7;
  if (filter === "LAST_30_DAYS") return diffDays <= 30;
  return diffDays <= 90;
}

export function getFilteredProducts(params: {
  products: Product[];
  search: string;
  statusFilter: ProductStatus | "ALL";
  createdAtFilter: CreatedAtFilter;
}): Product[] {
  const { products, search, statusFilter, createdAtFilter } = params;
  const normalizedSearch = search.trim().toLowerCase();
  const now = new Date();

  const preparedProducts: PreparedProduct[] = [];
  for (const product of products) {
    const createdAtMs = parseDateMs(product.createdAt);
    if (createdAtMs === null) continue;

    preparedProducts.push({
      product,
      createdAtMs,
      searchableText:
        `${product.productName} ${product.productCode} ${product.description}`.toLowerCase(),
    });
  }

  const filtered: PreparedProduct[] = [];
  for (const item of preparedProducts) {
    const { product, createdAtMs, searchableText } = item;

    const matchesStatus =
      statusFilter === "ALL" || product.status === statusFilter;
    if (!matchesStatus) continue;

    const matchesCreatedAt = isWithinCreatedAtFilter(
      createdAtMs,
      createdAtFilter,
      now,
    );
    if (!matchesCreatedAt) continue;

    if (normalizedSearch && !searchableText.includes(normalizedSearch)) {
      continue;
    }

    filtered.push(item);
  }

  filtered.sort((a, b) => b.createdAtMs - a.createdAtMs);
  return filtered.map((item) => item.product);
}
