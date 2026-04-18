import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllPermissionsService } from "@/services/group.service";
import { serialize } from "@/lib/serialize";
import { PermissionList } from "@/components/permission-list";
import { SerializedPermission } from "@/types";
import { getUserPermissions } from "@/lib/permissions";

export default async function PermissionsPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const [allPermissions, userPermissionNames] = await Promise.all([
    getAllPermissionsService(),
    getUserPermissions(session.userId),
  ]);

  const userPermissions: SerializedPermission[] = serialize(
    allPermissions.filter((p) => userPermissionNames.includes(p.name)),
  );

  const grouped = userPermissions.reduce(
    (acc, p) => {
      if (!acc[p.resource]) acc[p.resource] = [];
      acc[p.resource].push(p);
      return acc;
    },
    {} as Record<string, SerializedPermission[]>,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Permissions của tôi
        </h2>
        <p className="text-sm text-muted-foreground">
          Danh sách quyền bạn đang có từ các groups
        </p>
      </div>

      {userPermissions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Bạn chưa được phân quyền nào
          </p>
        </div>
      ) : (
        <PermissionList grouped={grouped} />
      )}
    </div>
  );
}
