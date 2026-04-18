import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getAllRolesService,
  getAllUsersService,
} from "@/services/user.service";
import { getAllGroupsService } from "@/services/group.service";
import { serialize } from "@/lib/serialize";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UsersTable } from "@/components/users/users-table";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const [users, groups, roles, canUpdateRole, canUpdateGroups] =
    await Promise.all([
      getAllUsersService(),
      getAllGroupsService(),
      getAllRolesService(),
      hasPermission(session.userId, PERMISSIONS.USERS_UPDATE),
      hasPermission(session.userId, PERMISSIONS.GROUPS_UPDATE),
    ]);

  const currentUser = users.find((u) => u._id.toString() === session.userId);
  const currentUserHierarchy = currentUser?.role.hierarchy ?? 99;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Users</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý user và thêm user vào group
          </p>
        </div>
        {canUpdateGroups && <AddUserDialog groups={serialize(groups)} />}
      </div>

      <UsersTable
        users={serialize(users)}
        roles={serialize(roles)}
        canUpdateRole={canUpdateRole}
        currentUserId={session.userId}
        currentUserHierarchy={currentUserHierarchy}
      />
    </div>
  );
}
