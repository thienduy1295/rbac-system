"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Loader2, MoreHorizontal, Folder } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { SerializedGroup, SerializedPermission } from "@/types";
import { ColumnDef, FilterDef, PaginatedResult } from "@/types/table";
import { EditGroupDialog } from "@/components/groups/edit-group-dialog";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { deleteGroupAction, getGroupsPaginatedAction } from "@/actions/group.action";
import { useLocale } from "@/contexts/locale-context";

const MAX_BADGES = 3;

function PermissionBadges({ permissions }: { permissions: SerializedPermission[] }) {
  const visible = permissions.slice(0, MAX_BADGES);
  const overflow = permissions.length - MAX_BADGES;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((p) => (
        <Badge key={p._id} variant="secondary" className="text-xs">
          {p.name}
        </Badge>
      ))}
      {overflow > 0 && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          +{overflow}
        </Badge>
      )}
    </div>
  );
}

interface Props {
  initialData: PaginatedResult<SerializedGroup>;
  allGroups: SerializedGroup[];
  permissions: SerializedPermission[];
  canCreate?: boolean;
  canUpdate?: boolean;
  canUpdateUsers?: boolean;
  canDelete?: boolean;
  userGroups?: SerializedGroup[];
  isSuperAdmin?: boolean;
}

export function GroupsTable({
  initialData,
  allGroups,
  permissions,
  canCreate,
  canUpdate,
  canUpdateUsers,
  canDelete,
  userGroups = [],
  isSuperAdmin = false,
}: Props) {
  const [editingGroup, setEditingGroup] = useState<SerializedGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<SerializedGroup | null>(null);
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const { dict } = useLocale();
  const t = dict.groups;

  const { data, state, isPending, setPage, setSearch, setFilter, clearFilters, setSort, refresh } =
    useDataTable<SerializedGroup>({
      fetcher: getGroupsPaginatedAction,
      initialData,
      pageSize: 10,
    });

  const parentOptions = allGroups
    .filter((g) => !g.parentGroup)
    .map((g) => ({ label: g.name, value: g._id }));

  const filters: FilterDef[] = [
    {
      key: "parentGroup",
      label: t.filterByType,
      options: [
        { label: t.filterRoot, value: "root" },
        ...parentOptions,
      ],
    },
  ];

  const showActions = canUpdate || canUpdateUsers || canDelete;

  const columns: ColumnDef<SerializedGroup>[] = [
    {
      key: "name",
      header: t.columns.name,
      sortable: true,
      render: (g) => (
        <div className="flex items-center gap-1.5">
          <Folder size={13} className="text-muted-foreground shrink-0" />
          <span className="font-medium">{g.name}</span>
        </div>
      ),
    },
    {
      key: "parentGroup",
      header: t.columns.parent,
      render: (g) =>
        g.parentGroup ? (
          <Badge variant="outline" className="text-xs font-normal">
            {g.parentGroup.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "description",
      header: t.columns.description,
      render: (g) => (
        <span className="text-muted-foreground">{g.description || "—"}</span>
      ),
    },
    {
      key: "permissions",
      header: t.columns.permissions,
      render: (g) => <PermissionBadges permissions={g.permissions} />,
    },
    ...(showActions
      ? [
          {
            key: "actions",
            header: "",
            width: "48px",
            render: (g: SerializedGroup) => (
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
                  <MoreHorizontal size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(canUpdate || canUpdateUsers) && (
                    <DropdownMenuItem onClick={() => setEditingGroup(g)}>
                      <Pencil size={14} />
                      {t.editAction}
                    </DropdownMenuItem>
                  )}
                  {canUpdate && canDelete && <DropdownMenuSeparator />}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setDeletingGroup(g)}
                      variant="destructive"
                    >
                      <Trash2 size={14} />
                      {t.deleteGroup}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          } satisfies ColumnDef<SerializedGroup>,
        ]
      : []),
  ];

  const handleDelete = () => {
    if (!deletingGroup) return;
    startDeleteTransition(async () => {
      const result = await deleteGroupAction(deletingGroup._id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(t.deleteSuccess);
      setDeletingGroup(null);
      refresh();
    });
  };

  return (
    <>
      <DataTable<SerializedGroup>
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
          canCreate ? (
            <CreateGroupDialog
              permissions={permissions}
              userGroups={userGroups}
              isSuperAdmin={isSuperAdmin}
              onSuccess={refresh}
            />
          ) : undefined
        }
      />

      {editingGroup && (
        <EditGroupDialog
          group={editingGroup}
          permissions={permissions}
          open={!!editingGroup}
          onOpenChange={(open) => !open && setEditingGroup(null)}
          canUpdate={canUpdate}
          canUpdateUsers={canUpdateUsers}
          onSuccess={refresh}
        />
      )}

      <AlertDialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteDesc}{" "}
              <span className="font-medium text-foreground">
                {deletingGroup?.name}
              </span>
              {t.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPendingDelete}>
              {dict.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPendingDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
            >
              {isPendingDelete ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> {t.deleting}
                </>
              ) : (
                t.deleteAction
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
