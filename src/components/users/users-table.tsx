"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { SerializedGroup, SerializedRole, SerializedUser } from "@/types";
import { ColumnDef, FilterDef, PaginatedResult } from "@/types/table";
import { UpdateRoleDialog } from "@/components/users/update-role-dialog";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { getUsersPaginatedAction } from "@/actions/user.action";
import { useLocale } from "@/contexts/locale-context";

interface Props {
  initialData: PaginatedResult<SerializedUser>;
  roles: SerializedRole[];
  groups: SerializedGroup[];
  canUpdateRole?: boolean;
  canUpdateGroups?: boolean;
  currentUserId: string;
  currentUserHierarchy: number;
}

export function UsersTable({
  initialData,
  roles,
  groups,
  canUpdateRole,
  canUpdateGroups,
  currentUserId,
  currentUserHierarchy,
}: Props) {
  const [editingUser, setEditingUser] = useState<SerializedUser | null>(null);
  const { dict } = useLocale();
  const t = dict.users;

  const {
    data,
    state,
    isPending,
    setPage,
    setSearch,
    setFilter,
    clearFilters,
    setSort,
    refresh,
  } = useDataTable<SerializedUser>({
    fetcher: getUsersPaginatedAction,
    initialData,
    pageSize: 10,
  });

  const filters: FilterDef[] = [
    {
      key: "role",
      label: t.filterByRole,
      options: roles.map((r) => ({ label: r.name, value: r._id })),
    },
  ];

  const columns: ColumnDef<SerializedUser>[] = [
    {
      key: "name",
      header: t.columns.name,
      sortable: true,
      render: (u) => <span className="font-medium">{u.name}</span>,
    },
    {
      key: "email",
      header: t.columns.email,
      sortable: true,
      render: (u) => <span className="text-muted-foreground">{u.email}</span>,
    },
    {
      key: "role",
      header: t.columns.role,
      render: (u) => (
        <Badge variant="outline" className="text-xs capitalize">
          {u.role?.name}
        </Badge>
      ),
    },
    {
      key: "groups",
      header: t.columns.groups,
      render: (u) =>
        u.groups?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {u.groups.map((g) => (
              <Badge key={g._id} variant="secondary" className="text-xs">
                {g.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">{t.noGroup}</span>
        ),
    },
    ...(canUpdateRole
      ? [
          {
            key: "actions",
            header: "",
            width: "64px",
            render: (u: SerializedUser) => {
              const canEdit =
                u._id !== currentUserId &&
                u.role.hierarchy > currentUserHierarchy;
              return canEdit ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingUser(u)}
                >
                  <Shield size={14} />
                </Button>
              ) : null;
            },
          } satisfies ColumnDef<SerializedUser>,
        ]
      : []),
  ];

  return (
    <>
      <DataTable<SerializedUser>
        data={data}
        columns={columns}
        state={state}
        isPending={isPending}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        onSortChange={setSort}
        filters={filters}
        searchPlaceholder={t.searchPlaceholder}
        emptyMessage={t.emptyMessage}
        actions={
          canUpdateGroups ? (
            <AddUserDialog groups={groups} onSuccess={refresh} />
          ) : undefined
        }
      />

      {editingUser && (
        <UpdateRoleDialog
          user={editingUser}
          roles={roles}
          currentUserHierarchy={currentUserHierarchy}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onSuccess={refresh}
        />
      )}
    </>
  );
}
