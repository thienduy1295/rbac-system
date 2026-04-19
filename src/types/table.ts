export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface FilterDef {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

export interface TableState {
  page: number;
  pageSize: number;
  search: string;
  filters: Record<string, string>;
  sortKey?: string;
  sortDir?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
