import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getAllGroupsService,
  getAllPermissionsService,
  getGroupsPaginatedService,
} from "@/services/group.service";
import { serialize } from "@/lib/serialize";
import { GroupsTable } from "@/components/groups/groups-table";
import { checkPermission, getUserContext } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";

export default async function GroupsPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const [initialData, allGroups, allPermissions, { permissionNames: userPermissionNames, groupIds: userGroupIds, isSuperAdmin }] =
    await Promise.all([
      getGroupsPaginatedService({ page: 1, pageSize: 10, search: "", filters: {} }).then(serialize),
      getAllGroupsService().then(serialize),
      getAllPermissionsService(),
      getUserContext(session.userId),
    ]);

  const assignablePermissions = serialize(
    allPermissions.filter((p) => userPermissionNames.includes(p.name)),
  );

  const canCreate = checkPermission(userPermissionNames, PERMISSIONS.GROUPS_CREATE, isSuperAdmin);
  const canUpdate = checkPermission(userPermissionNames, PERMISSIONS.GROUPS_UPDATE, isSuperAdmin);
  const canDelete = checkPermission(userPermissionNames, PERMISSIONS.GROUPS_DELETE, isSuperAdmin);

  const userGroups = allGroups.filter((g) => userGroupIds.includes(g._id.toString()));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Groups</h2>
        <p className="text-sm text-muted-foreground">
          Tạo group và phân quyền cho từng group
        </p>
      </div>

      <GroupsTable
        initialData={initialData}
        allGroups={allGroups}
        permissions={assignablePermissions}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canUpdateUsers={false}
        canDelete={canDelete}
        userGroups={userGroups}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
