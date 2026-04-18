"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SerializedGroup, SerializedPermission } from "@/types";
import { EditGroupDialog } from "./edit-group-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Props {
  groups: SerializedGroup[];
  permissions: SerializedPermission[];
  canUpdate?: boolean;
  canUpdateUsers?: boolean;
}

export function GroupsTable({
  groups,
  permissions,
  canUpdate,
  canUpdateUsers,
}: Props) {
  const showEditButton = canUpdate || canUpdateUsers;

  const [editingGroup, setEditingGroup] = useState<SerializedGroup | null>(
    null,
  );

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">Chưa có group nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên group</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Permissions</TableHead>
              {showEditButton && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group._id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {group.description || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {group.permissions.map((p) => (
                      <Badge
                        key={p._id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {p.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                {showEditButton && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingGroup(group)}
                    >
                      <Pencil size={14} />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingGroup && (
        <EditGroupDialog
          group={editingGroup}
          permissions={permissions}
          open={!!editingGroup}
          onOpenChange={(open) => !open && setEditingGroup(null)}
          canUpdate={canUpdate} // ← truyền xuống
          canUpdateUsers={canUpdateUsers} // ← truyền xuống
        />
      )}
    </>
  );
}
