import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ZodError } from "zod";

import { DataTable } from "./components/data-table";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { findAllProducts, findProductById } from "./services/productService";
import type { Product } from "./utils/interfaces";
import type { CreatedAtFilter, ProductStatus } from "./utils/types";
import { Skeleton } from "./components/ui/skeleton";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { formatCurrency, formatDate } from "./utils/formatters";
import { getAxiosErrorMessage } from "./utils/http";
import {
  createdAtFilterOptions,
  getFilteredProducts,
  selectItemClassName,
  statusClassName,
  statusFilterOptions,
  statusLabel,
} from "./utils/home";
import { Plus } from "lucide-react";

function centeredHeader(label: string) {
  return <div className="text-center">{label}</div>;
}

export default function Home({ onLogout }: { onLogout?: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
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

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    [],
  );

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value as ProductStatus | "ALL");
  }, []);

  const handleCreatedAtFilterChange = useCallback((value: string) => {
    setCreatedAtFilter(value as CreatedAtFilter);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadProducts() {
      setLoadingProducts(true);

      try {
        const data = await findAllProducts();
        if (!isActive) return;
        setProducts(data);
      } catch (error) {
        if (!isActive) return;

        if (error instanceof AxiosError) {
          toast.error(getAxiosErrorMessage(error, "Erro ao carregar produtos"));
        } else if (error instanceof ZodError) {
          console.error("Falha ao validar resposta de /products:", error);
          toast.error("Resposta inválida da API ao carregar produtos");
        } else {
          console.error("Falha inesperada ao carregar produtos:", error);
          toast.error("Erro inesperado ao carregar produtos");
        }
      } finally {
        if (isActive) {
          setLoadingProducts(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isActive = false;
    };
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
        toast.error(
          getAxiosErrorMessage(error, "Erro ao buscar detalhes do produto"),
        );
      } else {
        toast.error("Erro inesperado ao buscar detalhes");
      }
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return getFilteredProducts({
      products,
      search: deferredSearch,
      statusFilter,
      createdAtFilter,
    });
  }, [products, deferredSearch, statusFilter, createdAtFilter]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "productName",
        header: () => centeredHeader("Nome"),
      },
      {
        accessorKey: "productCode",
        header: () => centeredHeader("Código de produto"),
        cell: ({ row }) => (
          <span className="block text-center font-data">
            {row.original.productCode}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: () => centeredHeader("Preço"),
        cell: ({ row }) => (
          <span className="block text-center font-data">
            {formatCurrency(row.original.price)}
          </span>
        ),
      },
      {
        accessorKey: "quantity",
        header: () => centeredHeader("Quantidade"),
        cell: ({ row }) => (
          <span className="block text-center font-data">
            {row.original.quantity}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: () => centeredHeader("Descrição"),
        cell: ({ row }) => (
          <span className="inline-block max-w-65 truncate">
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: () => centeredHeader("Status"),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span
              className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClassName[row.original.status]}`}
            >
              {statusLabel[row.original.status]}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => centeredHeader("Ações"),
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
      <div className="app-page-overlay flex min-h-svh w-full items-center justify-center bg-cover bg-center bg-no-repeat p-6 md:p-10">
        <div className="w-full max-w-6xl">
          <Card className="app-card shadow-2xl backdrop-blur-md">
            <CardHeader className="space-y-4 pb-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="app-title text-2xl font-bold">
                  Seu estoque
                </CardTitle>

                <div className="flex flex-wrap items-center gap-7">
                  <Button
                    className="app-primary-btn cursor-pointer border-transparent"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus />
                    Adicionar produto
                  </Button>
                  <Button
                    variant="outline"
                    className="app-danger-btn border-transparent"
                    onClick={() => onLogout?.()}
                  >
                    Sair
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Input
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Filtrar por nome, código ou descrição"
                  className="app-input-shell h-10 rounded-md border px-3 text-sm outline-none transition-colors"
                />

                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="app-input-shell h-12 w-full rounded-md border px-3 text-sm cursor-pointer">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectGroup>
                      {statusFilterOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className={selectItemClassName}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  value={createdAtFilter}
                  onValueChange={handleCreatedAtFilterChange}
                >
                  <SelectTrigger className="app-input-shell h-12 w-full rounded-md border px-3 text-sm cursor-pointer">
                    <SelectValue placeholder="Todos os períodos"></SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {createdAtFilterOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className={selectItemClassName}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
