"use client";

import { useState, useTransition } from "react";
import {
  ChevronRight,
  ChevronDown,
  Building2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  UserRound,
  Link,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { SerializedDepartment, SerializedGroup, SerializedUser } from "@/types";
import { deleteDepartmentAction } from "@/actions/department.action";
import { EditDepartmentDialog } from "@/components/departments/edit-department-dialog";
import { cn } from "@/lib/utils";

interface Props {
  departments: SerializedDepartment[];
  groups: SerializedGroup[];
  users: SerializedUser[];
  canUpdate?: boolean;
  canDelete?: boolean;
}

interface TreeNode extends SerializedDepartment {
  children: TreeNode[];
}

function buildTree(departments: SerializedDepartment[]): TreeNode[] {
  const map: Record<string, TreeNode> = {};
  const roots: TreeNode[] = [];

  for (const dept of departments) {
    map[dept._id] = { ...dept, children: [] };
  }

  for (const dept of departments) {
    const parentId =
      typeof dept.parentDepartment === "object"
        ? dept.parentDepartment?._id
        : dept.parentDepartment;

    if (parentId && map[parentId]) {
      map[parentId].children.push(map[dept._id]);
    } else {
      roots.push(map[dept._id]);
    }
  }

  return roots;
}

function DepartmentNode({
  node,
  depth,
  canUpdate,
  canDelete,
  groups,
  users,
  departments,
  onEdit,
  onDelete,
}: {
  node: TreeNode;
  depth: number;
  canUpdate?: boolean;
  canDelete?: boolean;
  groups: SerializedGroup[];
  users: SerializedUser[];
  departments: SerializedDepartment[];
  onEdit: (dept: SerializedDepartment) => void;
  onDelete: (dept: SerializedDepartment) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2.5 pr-3 hover:bg-accent/50 transition-colors group border-b border-border last:border-b-0"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {/* Toggle expand */}
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((v) => !v)}
          className={cn(
            "shrink-0 text-muted-foreground transition-colors",
            hasChildren
              ? "hover:text-foreground"
              : "opacity-0 pointer-events-none",
          )}
        >
          {expanded && hasChildren ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>

        {/* Icon */}
        <Building2 size={15} className="shrink-0 text-muted-foreground" />

        {/* Name */}
        <span className="text-sm font-medium flex-1">{node.name}</span>

        {/* Manager badge */}
        {node.manager && (
          <div className="hidden group-hover:flex items-center gap-1 text-xs text-muted-foreground">
            <UserRound size={12} />
            <span>
              {typeof node.manager === "object"
                ? node.manager.name
                : node.manager}
            </span>
          </div>
        )}

        {/* Linked group badge */}
        {node.linkedGroup && (
          <div className="hidden group-hover:flex items-center gap-1">
            <Link size={12} className="text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              {typeof node.linkedGroup === "object"
                ? node.linkedGroup.name
                : node.linkedGroup}
            </Badge>
          </div>
        )}

        {/* Children count */}
        {hasChildren && (
          <Badge variant="outline" className="text-xs">
            {node.children.length}
          </Badge>
        )}

        {/* Actions */}
        {(canUpdate || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-all">
              <MoreHorizontal size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem onClick={() => onEdit(node)}>
                  <Pencil size={14} />
                  Chỉnh sửa
                </DropdownMenuItem>
              )}
              {canUpdate && canDelete && <DropdownMenuSeparator />}
              {canDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(node)}
                >
                  <Trash2 size={14} />
                  Xóa phòng ban
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <DepartmentNode
              key={child._id}
              node={child}
              depth={depth + 1}
              canUpdate={canUpdate}
              canDelete={canDelete}
              groups={groups}
              users={users}
              departments={departments}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DepartmentTree({
  departments,
  groups,
  users,
  canUpdate,
  canDelete,
}: Props) {
  const [editingDept, setEditingDept] = useState<SerializedDepartment | null>(
    null,
  );
  const [deletingDept, setDeletingDept] = useState<SerializedDepartment | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const tree = buildTree(departments);

  const handleDelete = () => {
    if (!deletingDept) return;
    startTransition(async () => {
      const result = await deleteDepartmentAction(deletingDept._id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Xóa phòng ban thành công!");
      setDeletingDept(null);
    });
  };

  if (departments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <Building2 size={24} className="mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Chưa có phòng ban nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        {tree.map((node) => (
          <DepartmentNode
            key={node._id}
            node={node}
            depth={0}
            canUpdate={canUpdate}
            canDelete={canDelete}
            groups={groups}
            users={users}
            departments={departments}
            onEdit={setEditingDept}
            onDelete={setDeletingDept}
          />
        ))}
      </div>

      {/* Edit dialog */}
      {editingDept && (
        <EditDepartmentDialog
          department={editingDept}
          departments={departments}
          groups={groups}
          users={users}
          open={!!editingDept}
          onOpenChange={(open) => !open && setEditingDept(null)}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog
        open={!!deletingDept}
        onOpenChange={(open) => !open && setDeletingDept(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phòng ban</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phòng ban{" "}
              <span className="font-medium text-foreground">
                {deletingDept?.name}
              </span>
              ? Tất cả phòng ban con cũng sẽ bị xóa. Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
