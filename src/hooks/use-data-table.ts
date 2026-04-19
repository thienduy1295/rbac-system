"use client";

import { useState, useCallback, useTransition } from "react";
import { TableState, PaginatedResult } from "@/types/table";

interface UseDataTableOptions<T> {
  fetcher: (state: TableState) => Promise<PaginatedResult<T>>;
  initialData: PaginatedResult<T>;
  pageSize?: number;
}

export function useDataTable<T>({
  fetcher,
  initialData,
  pageSize = 10,
}: UseDataTableOptions<T>) {
  const [data, setData] = useState<PaginatedResult<T>>(initialData);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<TableState>({
    page: 1,
    pageSize,
    search: "",
    filters: {},
  });

  const fetch = useCallback(
    (newState: TableState) => {
      startTransition(async () => {
        const result = await fetcher(newState);
        setData(result);
      });
    },
    [fetcher],
  );

  const setPage = (page: number) => {
    const newState = { ...state, page };
    setState(newState);
    fetch(newState);
  };

  const setSearch = (search: string) => {
    const newState = { ...state, search, page: 1 };
    setState(newState);
    fetch(newState);
  };

  const setFilter = (key: string, value: string) => {
    const newState = {
      ...state,
      page: 1,
      filters: { ...state.filters, [key]: value },
    };
    setState(newState);
    fetch(newState);
  };

  const clearFilters = () => {
    const newState = { ...state, page: 1, filters: {} };
    setState(newState);
    fetch(newState);
  };

  const setSort = (key: string) => {
    let sortKey: string | undefined = key;
    let sortDir: "asc" | "desc" | undefined;

    if (state.sortKey === key) {
      if (state.sortDir === "asc") {
        sortDir = "desc";
      } else if (state.sortDir === "desc") {
        // 3rd click: clear sort
        sortKey = undefined;
        sortDir = undefined;
      } else {
        sortDir = "asc";
      }
    } else {
      sortDir = "asc";
    }

    const newState = { ...state, page: 1, sortKey, sortDir };
    setState(newState);
    fetch(newState);
  };

  const refresh = () => fetch(state);

  const activeFilterCount = Object.values(state.filters).filter(Boolean).length;

  return {
    data,
    state,
    isPending,
    setPage,
    setSearch,
    setFilter,
    clearFilters,
    setSort,
    refresh,
    activeFilterCount,
  };
}
