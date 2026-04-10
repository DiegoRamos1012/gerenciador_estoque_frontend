import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo } from "react";

import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  pageSize: 10 | 30 | 50;
  onPageSizeChange: (value: 10 | 30 | 50) => void;
  emptyMessage?: string;
};

const pageSizeOptions: Array<10 | 30 | 50> = [10, 30, 50];
const pageSizeItemClassName =
  "cursor-pointer hover:bg-gray-200 focus:bg-gray-200 data-[state=checked]:bg-gray-300";

function getSkeletonClassName(columnIndex: number) {
  if (columnIndex === 0) return "h-4 w-40";
  if (columnIndex === 1) return "h-4 w-28";
  if (columnIndex === 2) return "h-4 w-20";
  if (columnIndex === 3) return "h-4 w-16";
  if (columnIndex === 4) return "h-4 w-52";
  return "h-6 w-20 rounded-full";
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  pageSize,
  onPageSizeChange,
  emptyMessage = "Nenhum registro encontrado.",
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
  });

  useEffect(() => {
    table.setPageSize(pageSize);
    table.setPageIndex(0);
  }, [pageSize, table]);

  const rowModel = table.getRowModel();
  const rows = rowModel.rows;
  const hasRows = rows.length > 0;

  const skeletonRowIndexes = useMemo(
    () => Array.from({ length: pageSize }, (_, index) => index),
    [pageSize],
  );

  const skeletonColumnIndexes = useMemo(
    () => Array.from({ length: columns.length }, (_, index) => index),
    [columns.length],
  );

  const handlePageSizeChange = useCallback(
    (value: string) => onPageSizeChange(Number(value) as 10 | 30 | 50),
    [onPageSizeChange],
  );

  const handlePreviousPage = useCallback(() => {
    table.previousPage();
  }, [table]);

  const handleNextPage = useCallback(() => {
    table.nextPage();
  }, [table]);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-white/80">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              skeletonRowIndexes.map((rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`}>
                  {skeletonColumnIndexes.map((columnIndex) => (
                    <TableCell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
                      <Skeleton className={getSkeletonClassName(columnIndex)} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : hasRows ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">
          {loading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <>
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount() || 1}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Itens por página</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-9 w-20 bg-white cursor-pointer">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {pageSizeOptions.map((option) => (
                <SelectItem
                  key={option}
                  value={String(option)}
                  className={pageSizeItemClassName}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={loading || !table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={loading || !table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
