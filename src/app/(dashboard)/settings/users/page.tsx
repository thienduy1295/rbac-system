import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getAllRolesService,
  getUsersPaginatedService,
} from "@/services/user.service";
import { getAllGroupsService } from "@/services/group.service";
import { serialize } from "@/lib/serialize";
import { UsersTable } from "@/components/users/users-table";
import { getUserPermissions } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const [initialData, groups, roles, userPermissions] = await Promise.all([
    getUsersPaginatedService({ page: 1, pageSize: 10, search: "", filters: {} }).then(serialize),
    getAllGroupsService().then(serialize),
    getAllRolesService(),
    getUserPermissions(session.userId),
  ]);

  const canUpdateRole = userPermissions.includes(PERMISSIONS.USERS_UPDATE);
  const canUpdateGroups = userPermissions.includes(PERMISSIONS.GROUPS_UPDATE);

  const currentUser = initialData.data.find((u) => u._id === session.userId);
  const currentUserHierarchy = currentUser?.role.hierarchy ?? 99;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Users</h2>
        <p className="text-sm text-muted-foreground">
          Quản lý user và thêm user vào group
        </p>
      </div>

      <UsersTable
        initialData={initialData}
        roles={serialize(roles)}
        groups={groups}
        canUpdateRole={canUpdateRole}
        canUpdateGroups={canUpdateGroups}
        currentUserId={session.userId}
        currentUserHierarchy={currentUserHierarchy}
      />
    </div>
  );
}
