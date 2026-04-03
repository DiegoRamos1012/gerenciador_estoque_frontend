import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect } from "react";

import { Button } from "./ui/button";
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
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`}>
                  {columns.map((column, columnIndex) => (
                    <TableCell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
                      <Skeleton
                        className={
                          columnIndex === 0
                            ? "h-4 w-40"
                            : columnIndex === 1
                              ? "h-4 w-28"
                              : columnIndex === 2
                                ? "h-4 w-20"
                                : columnIndex === 3
                                  ? "h-4 w-16"
                                  : columnIndex === 4
                                    ? "h-4 w-52"
                                    : "h-6 w-20 rounded-full"
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
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
          <label htmlFor="page-size" className="text-sm text-gray-600">
            Itens por página
          </label>
          <select
            id="page-size"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value) as 10 | 30 | 50)
            }
          >
            <option value={10}>10</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={loading || !table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={loading || !table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
