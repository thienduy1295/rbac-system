"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ColumnDef, FilterDef, PaginatedResult, TableState } from "@/types/table";
import { useLocale } from "@/contexts/locale-context";

interface DataTableProps<T> {
  data: PaginatedResult<T>;
  columns: ColumnDef<T>[];
  state: TableState;
  isPending?: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onSortChange?: (key: string) => void;
  filters?: FilterDef[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function SortIcon({
  colKey,
  sortKey,
  sortDir,
}: {
  colKey: string;
  sortKey?: string;
  sortDir?: "asc" | "desc";
}) {
  if (sortKey !== colKey) return <ChevronsUpDown size={13} className="text-muted-foreground/50" />;
  if (sortDir === "asc") return <ChevronUp size={13} />;
  return <ChevronDown size={13} />;
}

export function DataTable<T extends { _id: string }>({
  data,
  columns,
  state,
  isPending,
  onPageChange,
  onSearchChange,
  onFilterChange,
  onClearFilters,
  onSortChange,
  filters = [],
  searchPlaceholder,
  emptyMessage,
  actions,
}: DataTableProps<T>) {
  const [showFilters, setShowFilters] = useState(false);
  const { dict } = useLocale();
  const td = dict.dataTable;

  const activeFilterCount = Object.values(state.filters).filter(Boolean).length;
  const pageNumbers = getPageNumbers(state.page, data.totalPages);

  const resolvedSearch = searchPlaceholder ?? td.filters;
  const resolvedEmpty = emptyMessage ?? "—";

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={resolvedSearch}
            value={state.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {filters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(showFilters && "bg-accent")}
          >
            <SlidersHorizontal size={14} />
            {td.filters}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X size={14} />
            {td.clearFilters}
          </Button>
        )}

        {actions && <div className="ml-auto">{actions}</div>}
      </div>

      {/* ── Filter panel ── */}
      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 rounded-lg border border-border bg-muted/30">
          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {filter.label}
              </span>
              <Select
                value={state.filters[filter.key] ?? ""}
                onValueChange={(val) => onFilterChange(filter.key, val ?? "")}
              >
                <SelectTrigger className="h-8 w-40 text-sm">
                  <SelectValue>
                    {(val: string | null) =>
                      val
                        ? (filter.options.find((o) => o.value === val)?.label ?? val)
                        : td.all
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{td.all}</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div
        className={cn(
          "rounded-lg border border-border overflow-hidden transition-opacity",
          isPending && "opacity-60 pointer-events-none",
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} style={{ width: col.width }}>
                  {col.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(col.key)}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {col.header}
                      <SortIcon
                        colKey={col.key}
                        sortKey={state.sortKey}
                        sortDir={state.sortDir}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-12"
                >
                  {resolvedEmpty}
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((row) => (
                <TableRow key={row._id}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render
                        ? col.render(row)
                        : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Footer ── */}
      {data.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {td.showing}{" "}
            <span className="font-medium text-foreground">
              {(state.page - 1) * state.pageSize + 1}
            </span>
            {" – "}
            <span className="font-medium text-foreground">
              {Math.min(state.page * state.pageSize, data.total)}
            </span>
            {" / "}
            <span className="font-medium text-foreground">{data.total}</span>
            {" "}{td.results}
          </p>

          {data.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(state.page - 1)}
                    aria-disabled={state.page === 1}
                    className={cn(state.page === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {pageNumbers.map((num, i) =>
                  num === "..." ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={num}>
                      <PaginationLink
                        isActive={num === state.page}
                        onClick={() => onPageChange(num)}
                      >
                        {num}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(state.page + 1)}
                    aria-disabled={state.page === data.totalPages}
                    className={cn(
                      state.page === data.totalPages && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
