"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SerializedRole, SerializedUser } from "@/types";
import { UpdateRoleDialog } from "@/components/users/update-role-dialog";

interface Props {
  users: SerializedUser[];
  roles: SerializedRole[];
  canUpdateRole?: boolean;
  currentUserId: string;
  currentUserHierarchy: number;
}

export function UsersTable({
  users,
  roles,
  canUpdateRole,
  currentUserId,
  currentUserHierarchy,
}: Props) {
  const [editingUser, setEditingUser] = useState<SerializedUser | null>(null);

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">Chưa có user nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Groups</TableHead>
              {canUpdateRole && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const canEdit =
                canUpdateRole &&
                user._id !== currentUserId &&
                user.role.hierarchy > currentUserHierarchy;

              return (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {user.role?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.groups?.length > 0 ? (
                        user.groups.map((g) => (
                          <Badge
                            key={g._id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {g.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Chưa có group
                        </span>
                      )}
                    </div>
                  </TableCell>
                  {canUpdateRole && (
                    <TableCell>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingUser(user)}
                        >
                          <Shield size={14} />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <UpdateRoleDialog
          user={editingUser}
          roles={roles}
          currentUserHierarchy={currentUserHierarchy}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}
    </>
  );
}
