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
import {
  createProduct,
  findAllProducts,
  findProductById,
} from "./services/productService";
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
import { createProductFormSchema } from "./services/apiSchemas";
import { getAxiosErrorMessage, getAxiosFieldErrors } from "./utils/http";
import {
  createdAtFilterOptions,
  getFilteredProducts,
  productStatusOptions,
  selectItemClassName,
  statusClassName,
  statusFilterOptions,
  statusLabel,
} from "./utils/home";
import { LucideSquareArrowRightExit, Plus } from "lucide-react";

function centeredHeader(label: string) {
  return <div className="text-center">{label}</div>;
}

type AddProductFormState = {
  name: string;
  productCode: string;
  price: string;
  quantity: string;
  description: string;
  status: ProductStatus;
};

const initialAddProductForm: AddProductFormState = {
  name: "",
  productCode: "",
  price: "",
  quantity: "0",
  description: "",
  status: "ACTIVE",
};

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
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [addProductForm, setAddProductForm] = useState<AddProductFormState>(
    initialAddProductForm,
  );
  const [addProductErrors, setAddProductErrors] = useState<
    Partial<Record<keyof AddProductFormState, string>>
  >({});
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

  const handleAddProductFieldChange = useCallback(
    (field: keyof AddProductFormState, value: string) => {
      setAddProductForm((prev) => ({ ...prev, [field]: value }));
      setAddProductErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const closeAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    setAddProductErrors({});
    setAddProductForm(initialAddProductForm);
  }, []);

  const openAddDialog = useCallback(() => {
    setAddProductErrors({});
    setAddProductForm(initialAddProductForm);
    setIsAddDialogOpen(true);
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

  const handleCreateProduct = useCallback(async () => {
    setIsCreatingProduct(true);
    setAddProductErrors({});

    try {
      const validatedPayload = createProductFormSchema.parse(addProductForm);
      await createProduct(validatedPayload);

      const updatedProducts = await findAllProducts();
      setProducts(updatedProducts);

      toast.success("Produto adicionado com sucesso");
      closeAddDialog();
    } catch (error) {
      if (error instanceof ZodError) {
        const formErrors: Partial<Record<keyof AddProductFormState, string>> =
          {};

        for (const issue of error.issues) {
          const field = issue.path[0];
          if (typeof field === "string" && !(field in formErrors)) {
            formErrors[field as keyof AddProductFormState] = issue.message;
          }
        }

        setAddProductErrors(formErrors);
        toast.error("Verifique os campos do formulário");
        return;
      }

      if (error instanceof AxiosError) {
        const backendErrors = getAxiosFieldErrors(error);

        if (Object.keys(backendErrors).length > 0) {
          setAddProductErrors((prev) => ({
            ...prev,
            name: backendErrors.name ?? prev.name,
            productCode: backendErrors.productCode ?? prev.productCode,
            price: backendErrors.price ?? prev.price,
            quantity: backendErrors.quantity ?? prev.quantity,
            description: backendErrors.description ?? prev.description,
            status: backendErrors.status ?? prev.status,
          }));
        }

        toast.error(getAxiosErrorMessage(error, "Erro ao adicionar produto"));
        return;
      }

      toast.error("Erro inesperado ao adicionar produto");
    } finally {
      setIsCreatingProduct(false);
    }
  }, [addProductForm, closeAddDialog]);

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
                    onClick={openAddDialog}
                  >
                    <Plus />
                    Adicionar produto
                  </Button>
                  <Button
                    variant="outline"
                    className="app-danger-btn border-transparent"
                    onClick={() => onLogout?.()}
                  >
                    <LucideSquareArrowRightExit />
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

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ease-out ${
          isAddDialogOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isAddDialogOpen}
      >
        <div
          className={`w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl transition-transform duration-200 ease-out ${
            isAddDialogOpen ? "scale-100" : "scale-95"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Adicionar produto
            </h3>
            <Button variant="ghost" size="sm" onClick={closeAddDialog}>
              Fechar
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="product-name"
              >
                Nome
              </label>
              <Input
                id="product-name"
                value={addProductForm.name}
                onChange={(event) =>
                  handleAddProductFieldChange("name", event.target.value)
                }
                placeholder="Ex: Teclado Mecânico"
                className="app-input-shell"
              />
              {addProductErrors.name ? (
                <p className="text-xs text-red-600">{addProductErrors.name}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="product-code"
              >
                Código do produto
              </label>
              <Input
                id="product-code"
                value={addProductForm.productCode}
                onChange={(event) =>
                  handleAddProductFieldChange("productCode", event.target.value)
                }
                placeholder="Ex: TEC-MEC-001"
                className="app-input-shell"
              />
              {addProductErrors.productCode ? (
                <p className="text-xs text-red-600">
                  {addProductErrors.productCode}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="product-price"
                >
                  Preço
                </label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={addProductForm.price}
                  onChange={(event) =>
                    handleAddProductFieldChange("price", event.target.value)
                  }
                  placeholder="0.00"
                  className="app-input-shell"
                />
                {addProductErrors.price ? (
                  <p className="text-xs text-red-600">
                    {addProductErrors.price}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="product-quantity"
                >
                  Quantidade
                </label>
                <Input
                  id="product-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={addProductForm.quantity}
                  onChange={(event) =>
                    handleAddProductFieldChange("quantity", event.target.value)
                  }
                  placeholder="0"
                  className="app-input-shell"
                />
                {addProductErrors.quantity ? (
                  <p className="text-xs text-red-600">
                    {addProductErrors.quantity}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <Select
                value={addProductForm.status}
                onValueChange={(value) =>
                  handleAddProductFieldChange("status", value)
                }
              >
                <SelectTrigger className="app-input-shell h-10 cursor-pointer">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    {productStatusOptions.map((option) => (
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
              {addProductErrors.status ? (
                <p className="text-xs text-red-600">
                  {addProductErrors.status}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="product-description"
              >
                Descrição
              </label>
              <textarea
                id="product-description"
                value={addProductForm.description}
                onChange={(event) =>
                  handleAddProductFieldChange("description", event.target.value)
                }
                placeholder="Descreva o produto"
                rows={4}
                className="app-input-shell w-full resize-none rounded-md border px-3 py-2 text-sm outline-none"
              />
              {addProductErrors.description ? (
                <p className="text-xs text-red-600">
                  {addProductErrors.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeAddDialog}
              disabled={isCreatingProduct}
            >
              Cancelar
            </Button>
            <Button
              className="app-primary-btn border-transparent"
              onClick={() => void handleCreateProduct()}
              disabled={isCreatingProduct}
            >
              {isCreatingProduct ? "Salvando..." : "Salvar produto"}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ease-out ${
          isDetailsDialogOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isDetailsDialogOpen}
      >
        <div
          className={`w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-2xl transition-transform duration-200 ease-out ${
            isDetailsDialogOpen ? "scale-100" : "scale-95"
          }`}
        >
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
    </>
  );
}
