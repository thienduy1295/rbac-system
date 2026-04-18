import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllGroupsService, getAllPermissionsService } from "@/services/group.service";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { serialize } from "@/lib/serialize";
import { GroupsTable } from "@/components/groups/groups-table";
import {
  getUserGroupIds,
  getUserPermissions,
  hasPermission,
} from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";

export default async function GroupsPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const [
    groups,
    allPermissions,
    canCreate,
    canUpdate,
    userGroupIds,
    userPermissionNames,
  ] = await Promise.all([
    getAllGroupsService(),
    getAllPermissionsService(),
    hasPermission(session.userId, PERMISSIONS.GROUPS_CREATE),
    hasPermission(session.userId, PERMISSIONS.GROUPS_UPDATE),
    getUserGroupIds(session.userId),
    getUserPermissions(session.userId),
  ]);

  // Chỉ assign permissions mà mình đang có
  const assignablePermissions = allPermissions.filter((p) =>
    userPermissionNames.includes(p.name),
  );

  // Dùng role từ JWT để xác định super admin — không dùng group count
  const isSuperAdmin = session.role === "super_admin";

  const visibleGroups = isSuperAdmin
    ? groups
    : groups.filter((g) => {
        // Không hiện group mình đang thuộc
        if (userGroupIds.includes(g._id.toString())) return false;

        // Chỉ hiện groups có parentGroup là group mình thuộc
        const parentId = g.parentGroup?._id;
        return parentId && userGroupIds.includes(parentId.toString());
      });

  // Groups mà user đang thuộc (dùng làm parent khi tạo group con)
  const userGroups = groups.filter((g) =>
    userGroupIds.includes(g._id.toString()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Groups</h2>
          <p className="text-sm text-muted-foreground">
            Tạo group và phân quyền cho từng group
          </p>
        </div>
        {canCreate && (
          <CreateGroupDialog
            permissions={serialize(assignablePermissions)}
            userGroups={serialize(userGroups)}
            isSuperAdmin={isSuperAdmin}
          />
        )}
      </div>

      <GroupsTable
        groups={serialize(visibleGroups)}
        permissions={serialize(assignablePermissions)}
        canUpdate={canUpdate}
        canUpdateUsers={false}
      />
    </div>
  );
}
