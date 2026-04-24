import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllDepartmentsService } from "@/services/department.service";
import { getAllGroupsService } from "@/services/group.service";
import { findAllUsers } from "@/repositories/user.repository";
import { getUserContext, checkPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";
import { serialize } from "@/lib/serialize";
import { DepartmentTree } from "@/components/departments/department-tree";
import { CreateDepartmentDialog } from "@/components/departments/create-department-dialog";

export default async function DepartmentsPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const [departments, groups, users, userContext] = await Promise.all([
    getAllDepartmentsService(),
    getAllGroupsService(),
    findAllUsers(),
    getUserContext(session.userId),
  ]);

  const { permissionNames: permissions, isSuperAdmin } = userContext;
  const canCreate = checkPermission(
    permissions,
    PERMISSIONS.DEPARTMENTS_CREATE,
    isSuperAdmin,
  );
  const canUpdate = checkPermission(
    permissions,
    PERMISSIONS.DEPARTMENTS_UPDATE,
    isSuperAdmin,
  );
  const canDelete = checkPermission(
    permissions,
    PERMISSIONS.DEPARTMENTS_DELETE,
    isSuperAdmin,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Phòng ban</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý cơ cấu tổ chức
          </p>
        </div>
        {canCreate && (
          <CreateDepartmentDialog
            departments={serialize(departments)}
            groups={serialize(groups)}
            users={serialize(users)}
          />
        )}
      </div>

      <DepartmentTree
        departments={serialize(departments)}
        groups={serialize(groups)}
        users={serialize(users)}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
