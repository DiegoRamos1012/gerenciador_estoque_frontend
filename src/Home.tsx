import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { DataTable } from "./components/data-table";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { findAllProducts, findProductById } from "./services/productService";
import type { Product } from "./utils/interfaces";
import type { ProductStatus } from "./utils/types";
import { Skeleton } from "./components/ui/skeleton";
import { Input } from "./components/ui/input";
import { Select, SelectTrigger, SelectValue } from "./components/ui/select";

type CreatedAtFilter =
  | "ALL"
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "LAST_90_DAYS";

const statusLabel: Record<ProductStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  OUT_OF_STOCK: "Fora de Estoque",
};

const statusClassName: Record<ProductStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-700 border-gray-200",
  OUT_OF_STOCK: "bg-amber-100 text-amber-700 border-amber-200",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return date.toLocaleString("pt-BR");
}

function isWithinCreatedAtFilter(dateString: string, filter: CreatedAtFilter) {
  if (filter === "ALL") return true;

  const createdAt = new Date(dateString);
  if (Number.isNaN(createdAt.getTime())) return false;

  const now = new Date();

  if (filter === "TODAY") {
    return createdAt.toDateString() === now.toDateString();
  }

  const diffMs = now.getTime() - createdAt.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (filter === "LAST_7_DAYS") return diffDays <= 7;
  if (filter === "LAST_30_DAYS") return diffDays <= 30;
  return diffDays <= 90;
}

export default function Home({ onLogout }: { onLogout?: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">(
    "ALL",
  );
  const [createdAtFilter, setCreatedAtFilter] =
    useState<CreatedAtFilter>("ALL");
  const [pageSize, setPageSize] = useState<10 | 30 | 50>(10);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);

      try {
        const data = await findAllProducts();
        setProducts(data);
      } catch (error) {
        if (error instanceof AxiosError) {
          const message =
            error.response?.data?.message ??
            error.response?.data?.error ??
            "Erro ao carregar produtos";
          toast.error(message);
        } else {
          toast.error("Erro inesperado ao carregar produtos");
        }
      } finally {
        setLoadingProducts(false);
      }
    }

    void loadProducts();
  }, []);

  const handleOpenDetails = useCallback(async (id: string) => {
    setIsDetailsDialogOpen(true);
    setLoadingDetails(true);

    try {
      const product = await findProductById(id);
      setSelectedProduct(product);
    } catch (error) {
      setIsDetailsDialogOpen(false);

      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message ??
          error.response?.data?.error ??
          "Erro ao buscar detalhes do produto";
        toast.error(message);
      } else {
        toast.error("Erro inesperado ao buscar detalhes");
      }
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...products]
      .filter((product) => {
        const matchesSearch =
          !normalizedSearch ||
          product.productName.toLowerCase().includes(normalizedSearch) ||
          product.productCode.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "ALL" || product.status === statusFilter;
        const matchesCreatedAt = isWithinCreatedAtFilter(
          product.createdAt,
          createdAtFilter,
        );

        return matchesSearch && matchesStatus && matchesCreatedAt;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [products, search, statusFilter, createdAtFilter]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "productName",
        header: "Nome",
      },
      {
        accessorKey: "productCode",
        header: "Código de produto",
      },
      {
        accessorKey: "price",
        header: "Preço",
        cell: ({ row }) => formatCurrency(row.original.price),
      },
      {
        accessorKey: "quantity",
        header: "Quantidade",
      },
      {
        accessorKey: "description",
        header: "Descrição",
        cell: ({ row }) => (
          <span className="inline-block max-w-65 truncate">
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClassName[row.original.status]}`}
          >
            {statusLabel[row.original.status]}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleOpenDetails(row.original.id)}
          >
            Ver detalhes
          </Button>
        ),
      },
    ],
    [handleOpenDetails],
  );

  return (
    <>
      <div
        className="flex min-h-svh w-full items-center justify-center bg-cover bg-center bg-no-repeat p-6 md:p-10"
        style={{
          backgroundImage: "url('/img/background-stock-employee.webp')",
        }}
      >
        <div className="w-full max-w-6xl">
          <Card className="border-white/20 bg-white/95 shadow-2xl backdrop-blur-md">
            <CardHeader className="space-y-4 pb-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Seu estoque
                </CardTitle>

                <div className="flex flex-wrap items-center gap-7">
                  <Button
                    className="cursor-pointer hover:"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    Adicionar produto
                  </Button>
                  <Button variant="outline" onClick={() => onLogout?.()}>
                    Sair
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Filtrar por nome, código ou descrição"
                  className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition-colors focus:border-blue-500"
                />

                <Select>
                  <SelectTrigger>
                    {" "}
                    <SelectValue placeholder="Todos os status"> </SelectValue>
                  </SelectTrigger>
                </Select>

                {/*<SelectItem
                  value={statusFilter}
                  onChange={(event: { target: { value: string; }; }) =>
                    setStatusFilter(event.target.value as ProductStatus | "ALL")
                  }
                  className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value="ALL">Todos os status</option>
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="OUT_OF_STOCK">Fora de Estoque</option>
                </SelectItem> */}

                <select
                  value={createdAtFilter}
                  onChange={(event) =>
                    setCreatedAtFilter(event.target.value as CreatedAtFilter)
                  }
                  className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value="ALL">Todos os períodos</option>
                  <option value="TODAY">Adicionados hoje</option>
                  <option value="LAST_7_DAYS">Últimos 7 dias</option>
                  <option value="LAST_30_DAYS">Últimos 30 dias</option>
                  <option value="LAST_90_DAYS">Últimos 90 dias</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pb-6">
              <DataTable
                columns={columns}
                data={filteredProducts}
                loading={loadingProducts}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                emptyMessage="Nenhum produto encontrado."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {isAddDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Adicionar produto
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Fechar
              </Button>
            </div>

            <p className="text-sm text-gray-600">
              Este diálogo já está pronto para criação de produto. Quando a rota
              de cadastro estiver disponível no backend, basta conectar o envio
              do formulário com axios neste ponto.
            </p>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isDetailsDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Detalhes do produto
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsDetailsDialogOpen(false);
                  setSelectedProduct(null);
                }}
              >
                Fechar
              </Button>
            </div>

            {loadingDetails || !selectedProduct ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full max-w-sm" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-900">Nome:</span>{" "}
                  {selectedProduct.productName}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Código:</span>{" "}
                  {selectedProduct.productCode}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Preço:</span>{" "}
                  {formatCurrency(selectedProduct.price)}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Quantidade:</span>{" "}
                  {selectedProduct.quantity}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Status:</span>{" "}
                  {statusLabel[selectedProduct.status]}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Criado em:</span>{" "}
                  {formatDate(selectedProduct.createdAt)}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Descrição:</span>{" "}
                  {selectedProduct.description}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
